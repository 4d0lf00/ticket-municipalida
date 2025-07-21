import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { TicketService } from "../../services/ticket.service";
import { User } from "../../models/user.model";
import { UserSessionService } from "../../services/user-session.service";
import { Ticket } from "../../models/ticket.model";
import { EditorModule } from '@tinymce/tinymce-angular';

@Component({
  selector: "app-create-ticket",
  standalone: true,
  imports: [CommonModule, FormsModule, EditorModule],
  templateUrl: "./create-ticket.component.html",
  styleUrls: ["./create-ticket.component.css"],
})
export class CreateTicketComponent implements OnInit, OnDestroy {
  usuario: User | null = null;
  usuarioSub?: Subscription;

  
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


  formData = {
    title: "",
    description: "",
    category: "",
    priority: "medium" as const,
  };

  categories = [
    {
      value: "hardware",
      label: "Hardware",
      description: "Problemas con equipos, impresoras, etc.",
      iconPath:
        "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    },
    {
      value: "software",
      label: "Software",
      description: "Problemas con programas y aplicaciones",
      iconPath:
        "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    },
    {
      value: "network",
      label: "Red/Internet",
      description: "Problemas de conectividad",
      iconPath:
        "M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0",
    },
    {
      value: "access",
      label: "Accesos",
      description: "Solicitudes de acceso a sistemas",
      iconPath:
        "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    },
  ];

  constructor(
    private ticketService: TicketService,
    private userSession: UserSessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioSub = this.userSession.usuarioActivo$.subscribe((user) => {
      this.usuario = user;
    });
  }

  ngOnDestroy(): void {
    this.usuarioSub?.unsubscribe();
  }

onSubmit(): void {
  if (
    !this.formData.title ||
    !this.formData.description ||
    !this.formData.category ||
    !this.usuario
  ) {
    return;
  }

  this.ticketService.addTicket({
    title: this.formData.title,
    description: this.formData.description,
    category: this.formData.category,
    priority: this.formData.priority,
    createdAt: new Date(),   // opcional
  });

  this.router.navigate(["/tickets"]);
}


  selectCategory(category: string): void {
    this.formData.category = category;
  }
}
