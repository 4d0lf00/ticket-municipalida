import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Ticket } from '../models/ticket.model';
import { User } from '../models/user.model';
import { EmailService } from './email.service';
import { UserSessionService } from './user-session.service';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private ticketsSubject = new BehaviorSubject<Ticket[]>([]);

  constructor(
    private emailService: EmailService,
    private userSessionService: UserSessionService
  ) {
    const loaded = this.loadTicketsFromStorage();
    if (loaded.length) this.ticketsSubject.next(loaded);
  }

  private loadTicketsFromStorage(): Ticket[] {
    const data = localStorage.getItem('tickets');
    return data ? JSON.parse(data) : [];
  }

  private saveTicketsToStorage(tickets: Ticket[]): void {
    try {
      // Intentar guardar normalmente
      localStorage.setItem('tickets', JSON.stringify(tickets));
    } catch (error) {
      console.warn('Error al guardar en localStorage:', error);
      
      // Solo mostrar aviso sin eliminar datos automáticamente
      alert('⚠️ El almacenamiento local está lleno. Por favor, contacta al administrador para liberar espacio.');
    }
  }



  getTickets(): Observable<Ticket[]> {
    return this.ticketsSubject.asObservable();
  }

  getAllTickets(): Ticket[] {
    return this.ticketsSubject.value;
  }

  getTicketsByUser(email: string): Observable<Ticket[]> {
  return this.ticketsSubject.asObservable().pipe(
    map((tickets) => tickets.filter(t => t.requesterEmail === email)) 
  );
}


addTicket(ticketData: Partial<Ticket>): void {
  const currentUser = JSON.parse(localStorage.getItem('usuarioActivo') || '{}') as User;

  const newTicket: Ticket = {
    id: `TK-${String(Date.now()).slice(-3)}`,
    title: ticketData.title || '',
    description: ticketData.description || '',
    category: ticketData.category || 'hardware',
    priority: ticketData.priority || 'media',
    status: 'open',
    requesterName: currentUser.name,  
    requesterEmail: currentUser.email,  
    assignee: 'soporte@munimelipilla.cl',
    createdAt: new Date(),
    updatedAt: new Date(),
    department: currentUser.department,
  };

  const updatedTickets = [...this.ticketsSubject.value, newTicket];
  this.ticketsSubject.next(updatedTickets);
  this.saveTicketsToStorage(updatedTickets);

  // Enviar email de notificación a administradores
  this.sendTicketCreatedNotification(newTicket);
}
  updateTicket(updated: Ticket): void {
    const currentTickets = this.ticketsSubject.value;
    const oldTicket = currentTickets.find(t => t.id === updated.id);
    console.log('updateTicket llamado:', {
      ticketId: updated.id,
      fromStatus: oldTicket?.status,
      toStatus: updated.status
    });
    
    const updatedTickets = currentTickets.map((t) =>
      t.id === updated.id ? updated : t
    );
    this.ticketsSubject.next(updatedTickets);
    this.saveTicketsToStorage(updatedTickets);

    // Enviar email si se asignó un nuevo responsable
    if (oldTicket && oldTicket.assignee !== updated.assignee && updated.assignee) {
      console.log('Asignación detectada:', {
        oldAssignee: oldTicket.assignee,
        newAssignee: updated.assignee,
        ticketId: updated.id
      });
      this.sendTicketAssignedNotification(updated);
    }

    // Enviar email si el estado cambió a resuelto
    if (oldTicket && oldTicket.status !== 'resolved' && updated.status === 'resolved') {
      console.log('Detectado cambio a RESUELTO. Enviando email al solicitante:', {
        ticketId: updated.id,
        requesterEmail: updated.requesterEmail,
        requesterName: updated.requesterName
      });
      this.emailService.sendTicketResolvedEmail(updated).subscribe({
        next: (response: any) => console.log('Email de ticket resuelto enviado al solicitante:', response),
        error: (error: any) => console.error('Error enviando email de ticket resuelto:', error)
      });
    }
  }

  /**
   * Agrega una respuesta a un ticket y envía notificación por email
   */
  addResponse(ticketId: string, response: any): void {
    const currentTickets = this.ticketsSubject.value;
    const ticket = currentTickets.find(t => t.id === ticketId);
    
    if (ticket) {
      // Optimizar la respuesta si contiene imágenes grandes
      const optimizedResponse = this.optimizeResponseForStorage(response);
      
      const updatedTicket = {
        ...ticket,
        responses: [...(ticket.responses || []), optimizedResponse],
        updatedAt: new Date()
      };
      
      this.updateTicket(updatedTicket);
      
      // Enviar email de notificación de respuesta (usar respuesta original para email)
      this.sendTicketResponseNotification(updatedTicket, response);
    }
  }

  /**
   * Optimiza una respuesta para almacenamiento, reduciendo el tamaño de las imágenes
   */
  private optimizeResponseForStorage(response: any): any {
    if (!response.message) return response;

    // Si el mensaje contiene imágenes, optimizar las URLs
    let optimizedMessage = response.message;
    
    // Buscar URLs de imágenes y optimizarlas
    const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/g;
    optimizedMessage = optimizedMessage.replace(imgRegex, (match: string, src: string) => {
      // Si la imagen es muy grande, reemplazar con un placeholder
      if (src.length > 1000) {
        return `<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBPcHRpbWl6YWRhPC90ZXh0Pjwvc3ZnPg==" alt="Imagen optimizada" style="max-width: 200px; height: auto;">`;
      }
      return match;
    });

    return {
      ...response,
      message: optimizedMessage
    };
  }

  /**
   * Envía notificación cuando se crea un nuevo ticket
   */
  private sendTicketCreatedNotification(ticket: Ticket): void {
    const usuarios = this.userSessionService.getUsuarios();
    const adminEmails = usuarios
      .filter(u => u.role === 'admin' || u.role === 'support')
      .map(u => u.email);

    // Enviar confirmación al usuario que creó el ticket
    this.emailService.sendTicketConfirmationEmail(ticket).subscribe({
      next: (response: any) => console.log('Email de confirmación enviado al usuario:', response),
      error: (error: any) => console.error('Error enviando email de confirmación:', error)
    });

    // Enviar notificación a administradores/soporte
    if (adminEmails.length > 0) {
      this.emailService.sendTicketCreatedEmail(ticket, adminEmails).subscribe({
        next: (response: any) => console.log('Email de nuevo ticket enviado a administradores:', response),
        error: (error: any) => console.error('Error enviando email de nuevo ticket:', error)
      });
    }
  }

  /**
   * Envía notificación cuando se asigna un ticket
   */
  private sendTicketAssignedNotification(ticket: Ticket): void {
    console.log('Iniciando envío de email de asignación para ticket:', ticket.id);
    
    if (ticket.assignee) {
      const usuarios = this.userSessionService.getUsuarios();
      const assignee = usuarios.find(u => u.email === ticket.assignee);
      
      console.log('Buscando asignado:', {
        assigneeEmail: ticket.assignee,
        usuariosDisponibles: usuarios.map(u => ({ name: u.name, email: u.email, role: u.role })),
        assigneeEncontrado: assignee
      });
      
      if (assignee) {
        console.log('Enviando email de asignación a:', assignee.email);
        this.emailService.sendTicketAssignedEmail(ticket, assignee.email, assignee.name).subscribe({
          next: (response: any) => console.log('Email de asignación enviado exitosamente:', response),
          error: (error: any) => console.error('Error enviando email de asignación:', error)
        });
      } else {
        console.warn('No se encontró el usuario asignado:', ticket.assignee);
        // Enviar email usando solo el email del assignee
        this.emailService.sendTicketAssignedEmail(ticket, ticket.assignee, ticket.assignee.split('@')[0]).subscribe({
          next: (response: any) => console.log('Email de asignación enviado usando email directo:', response),
          error: (error: any) => console.error('Error enviando email de asignación directo:', error)
        });
      }
    } else {
      console.warn('Ticket sin asignado:', ticket.id);
    }
  }

  /**
   * Envía notificación cuando se responde un ticket
   */
  private sendTicketResponseNotification(ticket: Ticket, response: any): void {
    // Determinar a quién enviar la notificación
    let recipientEmail = '';
    let recipientName = '';

    if (response.authorEmail === ticket.requesterEmail) {
      // Si el solicitante respondió, notificar al asignado
      if (ticket.assignee) {
        const usuarios = this.userSessionService.getUsuarios();
        const assignee = usuarios.find(u => u.email === ticket.assignee);
        if (assignee) {
          recipientEmail = assignee.email;
          recipientName = assignee.name;
        }
      }
    } else {
      // Si el asignado respondió, notificar al solicitante
      recipientEmail = ticket.requesterEmail;
      recipientName = ticket.requesterName;
    }

    if (recipientEmail) {
      this.emailService.sendTicketResponseEmail(ticket, response, recipientEmail, recipientName).subscribe({
        next: (response: any) => console.log('Email de respuesta enviado:', response),
        error: (error: any) => console.error('Error enviando email de respuesta:', error)
      });
    }
  }

  /**
   * Método público para forzar el envío de email de asignación
   */
  forceSendAssignmentEmail(ticket: Ticket): void {
    console.log('Forzando envío de email de asignación para ticket:', ticket.id);
    this.sendTicketAssignedNotification(ticket);
  }

  /**
   * Método público para forzar el envío de email de ticket resuelto
   */
  forceSendResolvedEmail(ticket: Ticket): void {
    console.log('Forzando envío de email de ticket resuelto para ticket:', ticket.id);
    this.emailService.sendTicketResolvedEmail(ticket).subscribe({
      next: (response: any) => console.log('Email de ticket resuelto enviado (forzado):', response),
      error: (error: any) => console.error('Error enviando email de ticket resuelto (forzado):', error)
    });
  }

  /**
   * Limpia datos antiguos del localStorage
   */
  cleanupStorage(): void {
    try {
      const tickets = this.getAllTickets();
      const totalTickets = tickets.length;
      
      if (totalTickets > 30) {
        // Mantener solo los últimos 30 tickets
        const recentTickets = tickets.slice(-30);
        this.ticketsSubject.next(recentTickets);
        this.saveTicketsToStorage(recentTickets);
        
        console.log(`Limpieza manual completada: ${totalTickets - recentTickets.length} tickets eliminados`);
        alert(`Limpieza completada: ${totalTickets - recentTickets.length} tickets antiguos eliminados`);
      } else {
        alert('No es necesario limpiar el almacenamiento. Solo hay ' + totalTickets + ' tickets.');
      }
    } catch (error) {
      console.error('Error en limpieza manual:', error);
      alert('Error al limpiar el almacenamiento');
    }
  }

  /**
   * Obtiene información sobre el uso del localStorage
   */
  getStorageInfo(): { totalTickets: number, storageSize: string } {
    try {
      const tickets = this.getAllTickets();
      const storageData = localStorage.getItem('tickets') || '';
      const storageSize = (storageData.length / 1024).toFixed(2) + ' KB';
      
      return {
        totalTickets: tickets.length,
        storageSize: storageSize
      };
    } catch (error) {
      console.error('Error obteniendo información de almacenamiento:', error);
      return { totalTickets: 0, storageSize: 'Error' };
    }
  }
}
