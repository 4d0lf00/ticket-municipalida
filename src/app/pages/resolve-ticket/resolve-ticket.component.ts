import { Component, OnInit, AfterViewInit, OnDestroy, inject, ElementRef, ChangeDetectorRef , HostListener, QueryList, ViewChildren, ViewChild } from '@angular/core';
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
  @ViewChild('responseEditor') responseEditor!: any;
  openMenuIndex: number | null = null;

  selectedImageUrl: string | null = null;
  isImageModalOpen = false;
  ticket!: Ticket;
  responses: { author: string; authorEmail: string; message: string; timestamp: Date }[] = [];
  newResponse = "";
  currentUser: User | null = null;
  assignableUsers: User[] = [];
  allUsers: User[] = [];
  lastStatus: string = '';
  hasSentResolvedEmail = false;

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
      title: "Solicitar información",
      text: "Para poder ayudarte mejor, necesitamos que nos proporciones más detalles sobre el problema que estás experimentando.",
    },
    {
      title: "Problema resuelto",
      text: "El problema ha sido resuelto. Por favor, verifica que todo esté funcionando correctamente y no dudes en contactarnos si necesitas ayuda adicional.",
    },
    {
      title: "Escalar a técnico",
      text: "Hemos escalado tu solicitud a nuestro equipo técnico especializado. Te contactarán en las próximas 24 horas.",
    },
    {
      title: "Cerrar ticket",
      text: "Consideramos que este ticket ha sido resuelto satisfactoriamente. Si tienes alguna pregunta adicional, no dudes en abrir un nuevo ticket.",
    },
  ];

  editorApiKey = 'fv5pe5l2c10deu68ekllz4c0fkuqixnwl0y8k6gu8gjzbibu';

  editorInit = {
    height: 300,
    menubar: false,
    plugins: 'lists link table image code',
    toolbar: 'undo redo bold italic underline strikethrough bullist numlist table link image code',
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
    },
    content_style: `
      .tox .tox-toolbar__primary {
        flex-wrap: wrap !important;
        overflow-x: visible !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
      }
      .tox .tox-toolbar-overlord {
        overflow-x: visible !important;
      }
    `
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
    const found = allTickets.find((t) => t.id === id);
    // Usar una copia profunda para evitar mutar el objeto dentro del servicio
    this.ticket = found ? JSON.parse(JSON.stringify(found)) : (undefined as any);
    this.lastStatus = this.ticket?.status || '';

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
    
    // Enfocar el editor después de limpiar el formulario
    setTimeout(() => {
      // Intentar diferentes métodos para enfocar el editor
      if (this.responseEditor) {
        // Método 1: Usar la API del editor
        if (this.responseEditor.editorComponent) {
          this.responseEditor.editorComponent.focus();
        }
        // Método 2: Buscar el iframe del editor y enfocarlo
        const editorIframe = document.querySelector('.tox-edit-area iframe') as HTMLIFrameElement;
        if (editorIframe) {
          editorIframe.focus();
          // Método 3: Buscar el body del editor dentro del iframe
          if (editorIframe.contentDocument?.body) {
            editorIframe.contentDocument.body.focus();
          }
        }
      }
    }, 200);
  }

  focusEditor() {
    setTimeout(() => {
      if (this.responseEditor && this.responseEditor.editorComponent) {
        this.responseEditor.editorComponent.focus();
      }
      const editorIframe = document.querySelector('.tox-edit-area iframe') as HTMLIFrameElement;
      if (editorIframe) {
        editorIframe.focus();
        if (editorIframe.contentDocument?.body) {
          editorIframe.contentDocument.body.focus();
        }
      }
    }, 200);
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

    // Usar el nuevo método del servicio que incluye envío de email
    this.ticketService.addResponse(this.ticket.id, newMsg);
    
    // Actualizar las respuestas locales
    this.responses.push(newMsg);
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
  // Obtener copia del ticket actual almacenado para comparar cambios
  const stored = this.ticketService.getAllTickets().find(t => t.id === this.ticket.id);
  const previousStatus = stored?.status;

  this.ticket.updatedAt = new Date();
  this.ticketService.updateTicket(this.ticket);

  // Si cambió a resuelto, aseguramos persistencia del cambio antes de alertar
  if (previousStatus !== 'resolved' && this.ticket.status === 'resolved') {
    console.log('Estado cambiado a resuelto, se enviará notificación.');
      this.hasSentResolvedEmail = true;
  }
  alert("Ticket actualizado sin publicar respuesta.");
}

// Método para manejar cambios en la asignación
onAssigneeChange() {
  console.log('Asignado cambiado a:', this.ticket.assignee);
  
  // Primero actualizar el ticket
  this.updateTicketOnly();
  
  // Luego forzar el envío del email de asignación
  if (this.ticket.assignee) {
    setTimeout(() => {
      this.ticketService.forceSendAssignmentEmail(this.ticket);
    }, 100);
  }
}

onStatusChange() {
  // Guardar cambio inmediato para que el servicio detecte el estado resuelto y envíe el correo
  console.log('Cambio de estado desde componente:', {
    previousStatus: this.lastStatus,
    newStatus: this.ticket.status,
    ticketId: this.ticket.id
  });
  this.lastStatus = this.ticket.status;
  this.updateTicketOnly();

  // En caso de no detectarse en el servicio (por igualdad de estados), forzar envío si nuevo estado es resuelto
  if (this.ticket.status === 'resolved') {
    setTimeout(() => {
      this.ticketService.forceSendResolvedEmail(this.ticket);
    }, 100);
  }
}

}
