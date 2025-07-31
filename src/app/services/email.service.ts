import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
  sender?: {
    name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
  private readonly BREVO_API_KEY = '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';
  private readonly FROM_EMAIL = 'no-reply@munimelipilla.cl';
  private readonly FROM_NAME = 'Municipalidad de Melipilla 2025';

  constructor(private http: HttpClient) {}

  sendEmail(emailData: EmailData): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'api-key': this.BREVO_API_KEY
    });

    const payload = {
      sender: {
        name: this.FROM_NAME,
        email: this.FROM_EMAIL
      },
      to: [
        {
          email: emailData.to,
          name: emailData.to.split('@')[0]
        }
      ],
      subject: emailData.subject,
      htmlContent: emailData.htmlContent
    };

    return this.http.post(this.BREVO_API_URL, payload, { headers }).pipe(
      tap(response => console.log('Email enviado exitosamente:', response)),
      catchError(error => {
        console.error('Error enviando email:', error);
        return of({ error: 'Error enviando email' });
      })
    );
  }

  sendTicketAssignedEmail(ticket: any, assigneeEmail: string, assigneeName: string): Observable<any> {
    const subject = `Ticket ${ticket.id} asignado - ${ticket.title}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #2563eb; color: white; padding: 12px; text-align: center; border-radius: 6px 6px 0 0;">
          <h1 style="margin: 0; font-size: 18px; font-weight: bold; color: white;">Sistema de Tickets Municipal</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: white;">Municipalidad de Melipilla 2025</p>
        </div>
        <div style="padding: 12px; background-color: #f8fafc;">
          <h2 style="color: #1e293b; margin: 0 0 8px 0; font-size: 16px;">Ticket Asignado</h2>
          <div style="background-color: white; padding: 10px; border-radius: 6px; margin: 8px 0; border: 1px solid #e2e8f0;">
            <h3 style="color: #2563eb; margin: 0 0 8px 0; font-size: 14px;">Ticket #${ticket.id}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
              <div>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Título:</strong> ${ticket.title}</p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Solicitante:</strong> ${ticket.requesterName}</p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Email:</strong> ${ticket.requesterEmail}</p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Departamento:</strong> ${ticket.department}</p>
              </div>
              <div>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Categoría:</strong> ${this.getCategoryText(ticket.category)}</p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Prioridad:</strong> <span style="color: ${this.getPriorityColor(ticket.priority)}; font-weight: bold;">${this.getPriorityText(ticket.priority)}</span></p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Estado:</strong> <span style="color: ${this.getStatusColor(ticket.status)}; font-weight: bold;">${this.getStatusText(ticket.status)}</span></p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Fecha:</strong> ${new Date(ticket.createdAt).toLocaleString('es-CL')}</p>
              </div>
            </div>
            <div style="padding: 8px; background-color: #f8fafc; border-radius: 4px;">
              <p style="margin: 0; font-size: 12px;"><strong>Descripción:</strong></p>
              <p style="margin: 4px 0 0 0; white-space: pre-wrap; font-size: 12px; line-height: 1.3;">${ticket.description}</p>
            </div>
          </div>
          <div style="background-color: #dbeafe; padding: 10px; border-radius: 6px; border-left: 3px solid #2563eb; margin: 8px 0;">
            <h4 style="margin: 0; color: #1e40af; font-size: 14px;">Has sido asignado a este ticket</h4>
            <p style="margin: 4px 0 0 0; font-size: 12px; line-height: 1.3;">Por favor, revisa los detalles y toma las acciones necesarias.</p>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 10px; text-align: center; color: #64748b; border-radius: 0 0 6px 6px;">
          <p style="margin: 0; font-size: 10px;">Este es un email automático del Sistema de Tickets Municipal</p>
          <p style="margin: 2px 0 0 0; font-size: 10px;">© 2025 Municipalidad de Melipilla</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: assigneeEmail,
      subject: subject,
      htmlContent: htmlContent
    });
  }

  sendTicketResponseEmail(ticket: any, response: any, recipientEmail: string, recipientName: string): Observable<any> {
    const subject = `Nueva respuesta en Ticket ${ticket.id} - ${ticket.title}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #2563eb; color: white; padding: 12px; text-align: center; border-radius: 6px 6px 0 0;">
          <h1 style="margin: 0; font-size: 18px; font-weight: bold; color: white;">Sistema de Tickets Municipal</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: white;">Municipalidad de Melipilla 2025</p>
        </div>
        <div style="padding: 12px; background-color: #f8fafc;">
          <h2 style="color: #1e293b; margin: 0 0 8px 0; font-size: 16px;">Nueva Respuesta en Ticket</h2>
          <div style="background-color: white; padding: 10px; border-radius: 6px; margin: 8px 0; border: 1px solid #e2e8f0;">
            <h3 style="color: #2563eb; margin: 0 0 8px 0; font-size: 14px;">Ticket #${ticket.id}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
              <div>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Título:</strong> ${ticket.title}</p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Estado actual:</strong> <span style="color: ${this.getStatusColor(ticket.status)}; font-weight: bold;">${this.getStatusText(ticket.status)}</span></p>
              </div>
              <div>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Fecha de respuesta:</strong> ${new Date(response.timestamp).toLocaleString('es-CL')}</p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Autor:</strong> ${response.author}</p>
              </div>
            </div>
            <div style="padding: 8px; background-color: #f8fafc; border-radius: 4px;">
              <p style="margin: 0; font-size: 12px;"><strong>Descripción del ticket:</strong></p>
              <p style="margin: 4px 0 0 0; white-space: pre-wrap; font-size: 12px; line-height: 1.3;">${ticket.description}</p>
            </div>
          </div>
          <div style="background-color: #f0fdf4; padding: 10px; border-radius: 6px; border-left: 3px solid #22c55e; margin: 8px 0;">
            <h4 style="margin: 0; color: #166534; font-size: 14px;">Nueva Respuesta</h4>
            <div style="margin-top: 6px;">
              <p style="margin: 2px 0; font-size: 12px;"><strong>Autor:</strong> ${response.author} (${response.authorEmail})</p>
              <p style="margin: 2px 0; font-size: 12px;"><strong>Fecha:</strong> ${new Date(response.timestamp).toLocaleString('es-CL')}</p>
            </div>
            <div style="background-color: white; padding: 8px; border-radius: 4px; margin-top: 6px; border: 1px solid #e2e8f0;">
              <p style="margin: 0; white-space: pre-wrap; line-height: 1.3; font-size: 12px;">${this.cleanMessageFromImages(response.message)}</p>
              ${this.extractImagesFromMessage(response.message).length > 0 ? `
                <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: bold; color: #374151;">📷 Imágenes:</p>
                  ${this.extractImagesFromMessage(response.message).map((imgSrc: string, index: number) => `
                    <div style="margin: 4px 0; padding: 6px; background-color: #f9fafb; border-radius: 4px; border: 1px solid #e5e7eb;">
                      <img src="${imgSrc}" 
                           alt="Imagen adjunta" 
                           style="max-width: 100%; max-height: 300px; height: auto; border-radius: 3px; border: 1px solid #d1d5db; object-fit: contain;"
                           onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                      <div style="display: none; padding: 4px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 3px; margin-top: 2px;">
                        <p style="margin: 0; font-size: 10px; color: #dc2626;">⚠️ No se pudo cargar la imagen</p>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
          <div style="background-color: #dbeafe; padding: 10px; border-radius: 6px; border-left: 3px solid #2563eb; margin: 8px 0;">
            <h4 style="margin: 0; color: #1e40af; font-size: 14px;">Se ha agregado una nueva respuesta</h4>
            <p style="margin: 4px 0 0 0; font-size: 12px; line-height: 1.3;">Revisa los detalles y responde si es necesario.</p>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 10px; text-align: center; color: #64748b; border-radius: 0 0 6px 6px;">
          <p style="margin: 0; font-size: 10px;">Este es un email automático del Sistema de Tickets Municipal</p>
          <p style="margin: 2px 0 0 0; font-size: 10px;">© 2025 Municipalidad de Melipilla</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject: subject,
      htmlContent: htmlContent
    });
  }

  sendTicketCreatedEmail(ticket: any, adminEmails: string[]): Observable<any> {
    const subject = `Nuevo Ticket ${ticket.id} creado - ${ticket.title}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #2563eb; color: white; padding: 12px; text-align: center; border-radius: 6px 6px 0 0;">
          <h1 style="margin: 0; font-size: 18px; font-weight: bold; color: white;">Sistema de Tickets Municipal</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: white;">Municipalidad de Melipilla 2025</p>
        </div>
        <div style="padding: 12px; background-color: #f8fafc;">
          <h2 style="color: #1e293b; margin: 0 0 8px 0; font-size: 16px;">Nuevo Ticket Creado</h2>
          <div style="background-color: white; padding: 10px; border-radius: 6px; margin: 8px 0; border: 1px solid #e2e8f0;">
            <h3 style="color: #2563eb; margin: 0 0 8px 0; font-size: 14px;">Ticket #${ticket.id}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
              <div>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Título:</strong> ${ticket.title}</p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Solicitante:</strong> ${ticket.requesterName}</p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Email:</strong> ${ticket.requesterEmail}</p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Departamento:</strong> ${ticket.department}</p>
              </div>
              <div>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Categoría:</strong> ${this.getCategoryText(ticket.category)}</p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Prioridad:</strong> <span style="color: ${this.getPriorityColor(ticket.priority)}; font-weight: bold;">${this.getPriorityText(ticket.priority)}</span></p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Estado:</strong> <span style="color: ${this.getStatusColor(ticket.status)}; font-weight: bold;">${this.getStatusText(ticket.status)}</span></p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Fecha:</strong> ${new Date(ticket.createdAt).toLocaleString('es-CL')}</p>
              </div>
            </div>
            <div style="padding: 8px; background-color: #f8fafc; border-radius: 4px;">
              <p style="margin: 0; font-size: 12px;"><strong>Descripción:</strong></p>
              <p style="margin: 4px 0 0 0; white-space: pre-wrap; font-size: 12px; line-height: 1.3;">${ticket.description}</p>
            </div>
          </div>
          <div style="background-color: #fef3c7; padding: 10px; border-radius: 6px; border-left: 3px solid #f59e0b; margin: 8px 0;">
            <h4 style="margin: 0; color: #92400e; font-size: 14px;">Se ha creado un nuevo ticket</h4>
            <p style="margin: 4px 0 0 0; font-size: 12px; line-height: 1.3;">Por favor, revisa y asigna el ticket al personal correspondiente.</p>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 10px; text-align: center; color: #64748b; border-radius: 0 0 6px 6px;">
          <p style="margin: 0; font-size: 10px;">Este es un email automático del Sistema de Tickets Municipal</p>
          <p style="margin: 2px 0 0 0; font-size: 10px;">© 2025 Municipalidad de Melipilla</p>
        </div>
      </div>
    `;

    const emailPromises = adminEmails.map(email => 
      this.sendEmail({
        to: email,
        subject: subject,
        htmlContent: htmlContent
      })
    );

    return new Observable(observer => {
      Promise.all(emailPromises).then(() => {
        observer.next({ success: true });
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  sendTicketConfirmationEmail(ticket: any): Observable<any> {
    const subject = `Confirmación de Ticket ${ticket.id} - ${ticket.title}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #2563eb; color: white; padding: 12px; text-align: center; border-radius: 6px 6px 0 0;">
          <h1 style="margin: 0; font-size: 18px; font-weight: bold; color: white;">Sistema de Tickets Municipal</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: white;">Municipalidad de Melipilla 2025</p>
        </div>
        <div style="padding: 12px; background-color: #f8fafc;">
          <h2 style="color: #1e293b; margin: 0 0 8px 0; font-size: 16px;">Confirmación de Ticket Creado</h2>
          <div style="background-color: white; padding: 10px; border-radius: 6px; margin: 8px 0; border: 1px solid #e2e8f0;">
            <h3 style="color: #2563eb; margin: 0 0 8px 0; font-size: 14px;">Ticket #${ticket.id}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
              <div>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Título:</strong> ${ticket.title}</p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Departamento:</strong> ${ticket.department}</p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Categoría:</strong> ${this.getCategoryText(ticket.category)}</p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Fecha:</strong> ${new Date(ticket.createdAt).toLocaleString('es-CL')}</p>
              </div>
              <div>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Prioridad:</strong> <span style="color: ${this.getPriorityColor(ticket.priority)}; font-weight: bold;">${this.getPriorityText(ticket.priority)}</span></p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Estado:</strong> <span style="color: ${this.getStatusColor(ticket.status)}; font-weight: bold;">${this.getStatusText(ticket.status)}</span></p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Número de ticket:</strong> <strong style="color: #2563eb;">${ticket.id}</strong></p>
              </div>
            </div>
            <div style="padding: 8px; background-color: #f8fafc; border-radius: 4px;">
              <p style="margin: 0; font-size: 12px;"><strong>Descripción:</strong></p>
              <p style="margin: 4px 0 0 0; white-space: pre-wrap; font-size: 12px; line-height: 1.3;">${ticket.description}</p>
            </div>
          </div>
          <div style="background-color: #f0fdf4; padding: 10px; border-radius: 6px; border-left: 3px solid #22c55e; margin: 8px 0;">
            <h4 style="margin: 0; color: #166534; font-size: 14px;">¡Tu ticket ha sido creado exitosamente!</h4>
            <p style="margin: 4px 0 0 0; font-size: 12px; line-height: 1.3;">Hemos recibido tu solicitud y la estamos procesando.</p>
          </div>
          <div style="background-color: #dbeafe; padding: 10px; border-radius: 6px; border-left: 3px solid #2563eb; margin: 8px 0;">
            <h4 style="margin: 0; color: #1e40af; font-size: 14px;">Próximos pasos:</h4>
            <ul style="margin: 4px 0 0 0; padding-left: 16px; line-height: 1.3; font-size: 12px;">
              <li>Tu ticket será revisado por nuestro equipo técnico</li>
              <li>Recibirás notificaciones por email cuando haya actualizaciones</li>
              <li>Puedes hacer seguimiento de tu ticket en el sistema</li>
              <li>Si tienes urgencias, contacta directamente al departamento correspondiente</li>
            </ul>
          </div>
          <div style="background-color: #fef3c7; padding: 10px; border-radius: 6px; border-left: 3px solid #f59e0b; margin: 8px 0;">
            <h4 style="margin: 0; color: #92400e; font-size: 14px;">Información importante:</h4>
            <p style="margin: 4px 0 0 0; font-size: 12px; line-height: 1.3;">Guarda este email como respaldo. Número de ticket: <strong style="color: #2563eb;">${ticket.id}</strong></p>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 10px; text-align: center; color: #64748b; border-radius: 0 0 6px 6px;">
          <p style="margin: 0; font-size: 10px;">Este es un email automático del Sistema de Tickets Municipal</p>
          <p style="margin: 2px 0 0 0; font-size: 10px;">© 2025 Municipalidad de Melipilla</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: ticket.requesterEmail,
      subject: subject,
      htmlContent: htmlContent
    });
  }

  private getCategoryText(category: string): string {
    const categories: { [key: string]: string } = {
      'hardware': 'Hardware',
      'software': 'Software',
      'network': 'Red',
      'access': 'Acceso',
      'other': 'Otro'
    };
    return categories[category] || category;
  }

  private getPriorityText(priority: string): string {
    const priorities: { [key: string]: string } = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta',
      'urgent': 'Urgente'
    };
    return priorities[priority] || priority;
  }

  private getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'low': '#22c55e',
      'medium': '#f59e0b',
      'high': '#ef4444',
      'urgent': '#dc2626'
    };
    return colors[priority] || '#6b7280';
  }

  private getStatusText(status: string): string {
    const statuses: { [key: string]: string } = {
      'open': 'Abierto',
      'in-progress': 'En Progreso',
      'resolved': 'Resuelto',
      'closed': 'Cerrado'
    };
    return statuses[status] || status;
  }

  private getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'open': '#3b82f6',
      'in-progress': '#f59e0b',
      'resolved': '#22c55e',
      'closed': '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  private extractImagesFromMessage(message: string): string[] {
    // Buscar tanto imágenes con src normal como con data:image
    const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/g;
    const images: string[] = [];
    let match;
    
    while ((match = imgRegex.exec(message)) !== null) {
      if (match[1] && match[1].trim()) {
        // Verificar si es una imagen base64 válida
        if (match[1].startsWith('data:image/')) {
          images.push(match[1].trim());
        } else if (match[1].startsWith('http') || match[1].startsWith('https')) {
          images.push(match[1].trim());
        }
      }
    }
    
    return images;
  }

  private cleanMessageFromImages(message: string): string {
    // Remover etiquetas img completas, incluyendo las que tienen data:image
    return message.replace(/<img[^>]*>/g, '');
  }
}
