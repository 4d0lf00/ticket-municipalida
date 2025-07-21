import { Component, OnInit, AfterViewInit, OnDestroy, inject, ElementRef, ChangeDetectorRef , HostListener, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { TicketService } from "src/app/services/ticket.service";
import { UserSessionService } from "src/app/services/user-session.service";
import { Ticket } from "src/app/models/ticket.model";
import { User } from "src/app/models/user.model";
import { EditorModule } from "@tinymce/tinymce-angular";

interface QuickResponse {
  title: string;
  text: string;
}

@Component({
  selector: "app-resolve-ticket",
  standalone: true,
  imports: [CommonModule, FormsModule, EditorModule],
  templateUrl: "./resolve-ticket.component.html",
  styleUrls: ["./resolve-ticket.component.css"],
})
export class ResolveTicketComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('menuContainer') menuContainers!: QueryList<ElementRef>;
  openMenuIndex: number | null = null;

  selectedImageUrl: string | null = null;
  isImageModalOpen = false;
  ticket!: Ticket;
  responses: { author: string; authorEmail: string; message: string; timestamp: Date }[] = [];
  newResponse = "";
  currentUser: User | null = null;
  assignableUsers: User[] = [];
  allUsers: User[] = [];

  selectedQuickResponse = "";
  selectedSignature = "none";

@HostListener('document:click', ['$event.target'])
onClickOutside(target: HTMLElement) {
  if (this.openMenuIndex !== null && this.menuContainers?.length) {
    const clickedInside = this.menuContainers.some(container =>
      container.nativeElement.contains(target)
    );

    if (!clickedInside) {
      this.openMenuIndex = null;
    }
  }
}


  quickResponses: QuickResponse[] = [
    {
      title: "Saludo inicial",
      text: "Hola, gracias por contactarnos. Hemos recibido tu solicitud y la estamos revisando.",
    },
    {
      title: "Solicitar más información",
      text: "Para poder ayudarte mejor, necesitamos que nos proporciones más detalles sobre el problema que estás experimentando.",
    },
    {
      title: "Problema resuelto",
      text: "El problema ha sido resuelto. Por favor, verifica que todo esté funcionando correctamente y no dudes en contactarnos si necesitas ayuda adicional.",
    },
    {
      title: "Escalamiento a técnico",
      text: "Hemos escalado tu solicitud a nuestro equipo técnico especializado. Te contactarán en las próximas 24 horas.",
    },
    {
      title: "Cierre de ticket",
      text: "Consideramos que este ticket ha sido resuelto satisfactoriamente. Si tienes alguna pregunta adicional, no dudes en abrir un nuevo ticket.",
    },
  ];

  editorApiKey = 'fv5pe5l2c10deu68ekllz4c0fkuqixnwl0y8k6gu8gjzbibu';

  editorInit = {
    height: 300,
    menubar: false,
    plugins: 'lists link table image code',
    toolbar: 'undo redo | bold italic underline strikethrough | bullist numlist | table | link | image | code',
    branding: false,
    statusbar: false,
    file_picker_types: 'image file',
    file_picker_callback: (callback: any, value: any, meta: any) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');

      if (meta.filetype === 'image') {
        input.setAttribute('accept', 'image/*');
      } else {
        input.setAttribute('accept', '*/*');
      }

      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          if (meta.filetype === 'image') {
            callback(result, { alt: file.name });
          } else {
            callback(result, { text: file.name });
          }
        };
        reader.readAsDataURL(file);
      };

      input.click();
    }
  };

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private ticketService: TicketService = inject(TicketService);
  private userSessionService: UserSessionService = inject(UserSessionService);
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    const allTickets = this.ticketService.getAllTickets();
    this.ticket = allTickets.find((t) => t.id === id)!;

    if (!this.ticket) {
      this.router.navigate(["/tickets"]);
      return;
    }

    this.userSessionService.usuarioActivo$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
    });

    this.userSessionService.usuarios$.pipe(takeUntil(this.destroy$)).subscribe((usuarios: User[]) => {
      this.allUsers = usuarios;
      this.assignableUsers = usuarios.filter((u) => u.role === "admin" || u.role === "support");
    });

    const storedResponses = localStorage.getItem(`ticket-responses-${this.ticket.id}`);
    if (storedResponses) {
      this.responses = JSON.parse(storedResponses).map((r: any) => ({
        ...r,
        timestamp: new Date(r.timestamp),
      }));
    } else {
      this.responses = [
        {
          author: "Soporte Tecnico",
          authorEmail: "soporte@munimelipilla.cl",
          message:
            "Hemos recibido tu solicitud. Estamos revisando el problema y te contactaremos pronto con una solución.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      ];
      localStorage.setItem(`ticket-responses-${this.ticket.id}`, JSON.stringify(this.responses));
    }
  }
ngAfterViewInit(): void {
    document.addEventListener('click', this.handleImageClick);
  }
  ngOnDestroy() {
    document.removeEventListener('click', this.handleImageClick);
    this.destroy$.next();
    this.destroy$.complete();
  }
handleImageClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;

  if (target.tagName === 'IMG' && target.closest('.response-content')) {
    const image = target as HTMLImageElement;

    // 🔒 Evitar que se abra el enlace (si está dentro de un <a>)
    const parentLink = image.closest('a');
    if (parentLink) {
      event.preventDefault(); // Evita abrir nueva pestaña
    }

    const src = image.src;
    this.openImageModal(src);
  }
}
onResponseContentClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (target.tagName.toLowerCase() === 'img') {
    const src = (target as HTMLImageElement).src;
    this.openImageModal(src);
  }
}


  openImageModal(src: string) {
    this.selectedImageUrl = src;
    this.isImageModalOpen = true;
  }

  closeImageModal() {
    this.selectedImageUrl = null;
    this.isImageModalOpen = false;
  }

  insertQuickResponse() {
    if (this.selectedQuickResponse) {
      if (this.newResponse) {
        this.newResponse += "<br><br>" + this.selectedQuickResponse;
      } else {
        this.newResponse = this.selectedQuickResponse;
      }
      this.selectedQuickResponse = "";
    }
  }

  resetForm() {
    this.newResponse = "";
    this.selectedQuickResponse = "";
    this.selectedSignature = "none";
  }

  goBack(): void {
    this.location.back();
  }
addResponse() {
  if (!this.newResponse.trim() || !this.currentUser) return;

  let finalMessage = this.newResponse;

  // Envolver imágenes en enlaces
  finalMessage = finalMessage.replace(
    /<img[^>]*src="([^"]+)"[^>]*>/g,
    '<a href="$1" target=""><img src="$1" style="max-width: 100%; height: auto;" /></a>'
  );

  if (this.selectedSignature === "department") {
    const responder = this.allUsers.find(u => u.email === this.currentUser?.email);
    const responderDept = responder?.department || 'Departamento Desconocido';
    finalMessage += `<br><br>${"─".repeat(40)}<br>Atentamente,<br>Equipo de ${responderDept}`;
  }

  const newMsg = {
    author: this.currentUser.name,
    authorEmail: this.currentUser.email,
    message: finalMessage,
    timestamp: new Date(),
  };

  this.responses.push(newMsg);

  if (this.ticket.assignee) {
    this.ticket.assignee = this.ticket.assignee;
  }

  localStorage.setItem(`ticket-responses-${this.ticket.id}`, JSON.stringify(this.responses));
  this.saveChanges();
  this.resetForm();
}




  saveChanges() {
    this.ticket.updatedAt = new Date();
    this.ticketService.updateTicket(this.ticket);
    alert("Ticket actualizado exitosamente");
  }

  formatDate(date: Date): string {
    const now = new Date();
    const ticketDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - ticketDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "hace unos minutos";
    } else if (diffInHours < 24) {
      return `hace ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
    } else {
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(ticketDate);
    }
  }

  formatFullDate(date: Date): string {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

  getUserRole(email: string): "admin" | "user" | "support" | "unknown" {
    if (!email) return "unknown";
    const user = this.allUsers.find((u) => u.email === email);
    return user?.role ?? "unknown";
  }

  getInitials(name?: string): string {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    const initials = parts.slice(0, 2).map(p => p[0]).join('').toUpperCase(); 
    return initials;
}

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      open: "Abierto",
      "in-progress": "En Progreso",
      resolved: "Resuelto",
    };
    return statusMap[status] || status;
  }

  getPriorityText(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      urgent: "Urgente",
      high: "Alta",
      medium: "Media",
      low: "Baja",
    };
    return priorityMap[priority] || priority;
  }

  getCategoryText(category: string): string {
    const categoryMap: { [key: string]: string } = {
      hardware: "Hardware",
      software: "Software",
      network: "Red/Internet",
      access: "Accesos",
    };
    return categoryMap[category] || category;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      open: "status-open",
      "in-progress": "status-in-progress",
      resolved: "status-resolved",
    };
    return classMap[status] || "status-open";
  }

  getPriorityClass(priority: string): string {
    const classMap: { [key: string]: string } = {
      urgent: "priority-urgent",
      high: "priority-high",
      medium: "priority-medium",
      low: "priority-low",
    };
    return classMap[priority] || "priority-medium";
  }

toggleMenu(index: number) {
  this.openMenuIndex = this.openMenuIndex === index ? null : index;
  this.cdr.detectChanges(); // 🔄 fuerza actualización para que menuContainers se actualice
}


editResponse(index: number) {
  const responseToEdit = this.responses[index];

  // Verifica que el usuario actual sea el autor
  if (responseToEdit.authorEmail !== this.currentUser?.email) {
    console.warn("No tienes permiso para editar esta respuesta.");
    return;
  }

  this.newResponse = responseToEdit.message;
  this.responses.splice(index, 1); // Quita la respuesta para reemplazarla
  this.openMenuIndex = null;
}


deleteResponse(index: number) {
  const responseToDelete = this.responses[index];

  // Verifica que el usuario actual sea el autor
  if (responseToDelete.authorEmail !== this.currentUser?.email) {
    console.warn("No tienes permiso para eliminar esta respuesta.");
    return;
  }

  if (confirm("¿Estás seguro de que deseas eliminar esta respuesta?")) {
    this.responses.splice(index, 1);
    localStorage.setItem(`ticket-responses-${this.ticket.id}`, JSON.stringify(this.responses));
    this.saveChanges();
  }
  this.openMenuIndex = null;
}

@HostListener('window:scroll')
onScroll() {
  if (this.openMenuIndex !== null) {
    this.openMenuIndex = null;
  }
}
updateTicketOnly() {
  this.ticket.updatedAt = new Date();
  this.ticketService.updateTicket(this.ticket);
  alert("Ticket actualizado sin publicar respuesta.");
}

}
