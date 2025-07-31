import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailService } from '../../services/email.service';

@Component({
  selector: 'app-email-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">Prueba de Envío de Emails - Brevo</h2>
      
      <div class="space-y-6">
        <!-- Email de prueba simple -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">Email de Prueba Simple</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Email Destinatario:</label>
              <input 
                type="email" 
                [(ngModel)]="testEmail" 
                class="w-full p-2 border rounded"
                placeholder="ejemplo@correo.com"
              >
            </div>
            <button 
              (click)="sendTestEmail()"
              [disabled]="sending"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {{ sending ? 'Enviando...' : 'Enviar Email de Prueba' }}
            </button>
          </div>
        </div>

        <!-- Email de ticket asignado -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">Email de Ticket Asignado</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Email del Asignado:</label>
              <input 
                type="email" 
                [(ngModel)]="assigneeEmail" 
                class="w-full p-2 border rounded"
                placeholder="asignado@munimelipilla.cl"
              >
            </div>
            <button 
              (click)="sendTicketAssignedEmail()"
              [disabled]="sending"
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {{ sending ? 'Enviando...' : 'Enviar Email de Asignación' }}
            </button>
          </div>
        </div>

                 <!-- Email de respuesta -->
         <div class="bg-white p-6 rounded-lg shadow">
           <h3 class="text-lg font-semibold mb-4">Email de Respuesta</h3>
           <div class="space-y-4">
             <div>
               <label class="block text-sm font-medium mb-2">Email del Destinatario:</label>
               <input 
                 type="email" 
                 [(ngModel)]="responseEmail" 
                 class="w-full p-2 border rounded"
                 placeholder="destinatario@munimelipilla.cl"
               >
             </div>
             <button 
               (click)="sendTicketResponseEmail()"
               [disabled]="sending"
               class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
             >
               {{ sending ? 'Enviando...' : 'Enviar Email de Respuesta' }}
             </button>
           </div>
         </div>

         <!-- Email de confirmación de ticket -->
         <div class="bg-white p-6 rounded-lg shadow">
           <h3 class="text-lg font-semibold mb-4">Email de Confirmación de Ticket</h3>
           <div class="space-y-4">
             <div>
               <label class="block text-sm font-medium mb-2">Email del Usuario:</label>
               <input 
                 type="email" 
                 [(ngModel)]="confirmationEmail" 
                 class="w-full p-2 border rounded"
                 placeholder="usuario@munimelipilla.cl"
               >
             </div>
             <button 
               (click)="sendTicketConfirmationEmail()"
               [disabled]="sending"
               class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
             >
               {{ sending ? 'Enviando...' : 'Enviar Email de Confirmación' }}
             </button>
           </div>
         </div>

        <!-- Resultados -->
        <div *ngIf="result" class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">Resultado</h3>
          <div [class]="result.success ? 'text-green-600' : 'text-red-600'">
            <p><strong>{{ result.success ? 'Éxito:' : 'Error:' }}</strong> {{ result.message }}</p>
            <pre *ngIf="result.details" class="mt-2 p-2 bg-gray-100 rounded text-sm">{{ result.details | json }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #f8fafc;
      min-height: 100vh;
      padding: 20px;
    }
  `]
})
export class EmailTestComponent {
  testEmail = '';
  assigneeEmail = '';
  responseEmail = '';
  confirmationEmail = '';
  sending = false;
  result: any = null;

  constructor(private emailService: EmailService) {}

  sendTestEmail() {
    if (!this.testEmail) {
      this.showResult(false, 'Por favor ingresa un email válido');
      return;
    }

    this.sending = true;
    this.result = null;

    const emailData = {
      to: this.testEmail,
      subject: 'Prueba de Email - Sistema de Tickets Municipal',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Sistema de Tickets Municipal</h1>
            <p style="margin: 10px 0 0 0;">Melipilla Activa 2025</p>
          </div>
          
          <div style="padding: 20px; background-color: #f8fafc;">
            <h2 style="color: #1e293b;">Prueba de Email</h2>
            <p>Este es un email de prueba para verificar que la integración con Brevo funciona correctamente.</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
            <p><strong>Hora:</strong> ${new Date().toLocaleTimeString('es-CL')}</p>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b;">
            <p style="margin: 0;">Este es un email de prueba del Sistema de Tickets Municipal</p>
            <p style="margin: 5px 0 0 0;">© 2025 Municipalidad de Melipilla</p>
          </div>
        </div>
      `
    };

    this.emailService.sendEmail(emailData).subscribe({
      next: (response: any) => {
        this.sending = false;
        this.showResult(true, 'Email enviado exitosamente', response);
      },
      error: (error: any) => {
        this.sending = false;
        this.showResult(false, 'Error enviando email', error);
      }
    });
  }

  sendTicketAssignedEmail() {
    if (!this.assigneeEmail) {
      this.showResult(false, 'Por favor ingresa un email válido');
      return;
    }

    this.sending = true;
    this.result = null;

    const mockTicket = {
      id: 'TK-001',
      title: 'Problema con impresora',
      description: 'La impresora no está funcionando correctamente',
      requesterName: 'Juan Pérez',
      requesterEmail: 'juan.perez@munimelipilla.cl',
      department: 'Administración',
      category: 'hardware',
      priority: 'high',
      status: 'open',
      assignee: this.assigneeEmail, // Agregar el assignee al ticket
      createdAt: new Date()
    };

    console.log('Enviando email de asignación a:', this.assigneeEmail);
    this.emailService.sendTicketAssignedEmail(mockTicket, this.assigneeEmail, 'Asignado Test').subscribe({
      next: (response: any) => {
        this.sending = false;
        this.showResult(true, 'Email de asignación enviado exitosamente', response);
      },
      error: (error: any) => {
        this.sending = false;
        this.showResult(false, 'Error enviando email de asignación', error);
      }
    });
  }

  sendTicketResponseEmail() {
    if (!this.responseEmail) {
      this.showResult(false, 'Por favor ingresa un email válido');
      return;
    }

    this.sending = true;
    this.result = null;

    const mockTicket = {
      id: 'TK-001',
      title: 'Problema con impresora',
      description: 'La impresora no está funcionando correctamente',
      status: 'in-progress'
    };

    const mockResponse = {
      author: 'Soporte IT',
      authorEmail: 'soporte@munimelipilla.cl',
      message: 'Hemos revisado el problema y estamos trabajando en la solución.',
      timestamp: new Date()
    };

         this.emailService.sendTicketResponseEmail(mockTicket, mockResponse, this.responseEmail, 'Destinatario Test').subscribe({
       next: (response: any) => {
         this.sending = false;
         this.showResult(true, 'Email de respuesta enviado exitosamente', response);
       },
       error: (error: any) => {
         this.sending = false;
         this.showResult(false, 'Error enviando email de respuesta', error);
       }
     });
   }

   sendTicketConfirmationEmail() {
     if (!this.confirmationEmail) {
       this.showResult(false, 'Por favor ingresa un email válido');
       return;
     }

     this.sending = true;
     this.result = null;

     const mockTicket = {
       id: 'TK-001',
       title: 'Problema con impresora',
       description: 'La impresora no está funcionando correctamente',
       requesterName: 'Juan Pérez',
       requesterEmail: this.confirmationEmail,
       department: 'Administración',
       category: 'hardware',
       priority: 'high',
       status: 'open',
       createdAt: new Date()
     };

     this.emailService.sendTicketConfirmationEmail(mockTicket).subscribe({
               next: (response: any) => {
          this.sending = false;
          this.showResult(true, 'Email de confirmación enviado exitosamente', response);
        },
        error: (error: any) => {
          this.sending = false;
          this.showResult(false, 'Error enviando email de confirmación', error);
        }
     });
   }

   private showResult(success: boolean, message: string, details?: any) {
    this.result = {
      success,
      message,
      details
    };
  }
} 