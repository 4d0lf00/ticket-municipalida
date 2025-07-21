import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { TicketService } from '../../services/ticket.service';
import { UserSessionService } from '../../services/user-session.service';
import { Ticket } from '../../models/ticket.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css'],
})
export class TicketsComponent implements OnInit {
  tickets$: Observable<Ticket[]>; // Observable con los tickets (filtrados)
  currentUser$: Observable<User | null>;
  isAdmin$: Observable<boolean>;
  allUsers: User[] = []; // Asegúrate de declarar la propiedad allUsers

  searchQuery = '';
  statusFilter = 'all';
  filterBy: string = 'title'; // predeterminado
  tickets: Ticket[] = []; // lista original
  filteredTickets: Ticket[] = []; // lista filtrada
  constructor(
    private ticketService: TicketService,
    private session: UserSessionService
  ) {
    this.currentUser$ = this.session.usuarioActivo$;
    this.isAdmin$ = this.currentUser$.pipe(map(user => user?.role === 'admin'));

    // Inicializamos tickets$ para que cambie cuando cambie usuario, filtro o búsqueda
    this.tickets$ = combineLatest([
      this.ticketService.getTickets(), // Todos los tickets reactivos
      this.currentUser$,              // Usuario actual reactivo
    ]).pipe(
      map(([tickets, user]) => {
        if (!user) return [];
        if (user.role === 'admin' || user.role === 'support') return tickets; //Admin y soporte ven todos los tickets
        // Usuario normal ve solo sus tickets
        return tickets.filter(t => t.requesterEmail === user.email);
      })
    );
  }

  ngOnInit(): void {
    // Obtén todos los usuarios al iniciar
    this.session.usuarios$.subscribe((usuarios: User[]) => {
      this.allUsers = usuarios; // Asignamos todos los usuarios a 'allUsers'
    });
  }

  // Observable con tickets filtrados por búsqueda y estado (reactivo)
getFilteredTickets(): Observable<Ticket[]> {
  return this.tickets$.pipe(
    map(tickets =>
      tickets
        .filter(ticket => {
          const query = this.searchQuery.toLowerCase();
          const field = this.filterBy;
          let valueToCheck = '';

          switch (field) {
            case 'id':
              valueToCheck = ticket.id?.toString().toLowerCase() || '';
              break;
            case 'title':
              valueToCheck = ticket.title.toLowerCase();
              break;
            case 'requesterEmail':
              valueToCheck = ticket.requesterEmail?.toLowerCase() || '';
              break;
            case 'requesterName':
              valueToCheck = ticket.requesterName?.toLowerCase() || '';
              break;
            case 'assigneeName':
              valueToCheck = this.getAssigneeName(ticket.assignee)?.toLowerCase() || '';
              break;
            case 'assigneeEmail':
              valueToCheck = ticket.assignee?.toLowerCase() || '';
              break;
            case 'status':
              valueToCheck = ticket.status?.toLowerCase() || '';
              break;
            case 'department':
              valueToCheck = ticket.department?.toLowerCase() || '';
              break;
            case 'priority':
              valueToCheck = ticket.priority?.toLowerCase() || '';
              break;
            default:
              // Sin campo seleccionado: busca en todo
              valueToCheck = [
                ticket.title,
                ticket.requesterEmail,
                ticket.requesterName,
                ticket.id,
                this.getAssigneeName(ticket.assignee),
                ticket.assignee,
                ticket.status,
                ticket.department,
                ticket.priority
              ]
                .map(val => (val || '').toString().toLowerCase())
                .join(' ');
          }

          const matchesSearch = valueToCheck.includes(query);
          const matchesStatus =
            this.statusFilter === 'all' || ticket.status === this.statusFilter;

          return matchesSearch && matchesStatus;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    )
  );
}


filterTickets() {
  const query = this.searchQuery.toLowerCase();

  this.filteredTickets = this.tickets.filter(ticket => {
    let valueToCheck = '';

    switch (this.filterBy) {
      case 'title':
        valueToCheck = ticket.title.toLowerCase();
        break;
      case 'requesterEmail':
        valueToCheck = ticket.requesterEmail?.toLowerCase() || '';
        break;
      case 'requesterName':
        valueToCheck = ticket.requesterName?.toLowerCase() || '';
        break;
      case 'id':
        valueToCheck = ticket.id?.toString().toLowerCase() || '';
        break;
      case 'assigneeName':
        valueToCheck = this.getAssigneeName(ticket.assignee)?.toLowerCase() || '';
        break;
      case 'assigneeEmail':
        valueToCheck = ticket.assignee?.toLowerCase() || '';
        break;
      case 'status':
        valueToCheck = ticket.status?.toLowerCase() || '';
        break;
      case 'department':
        valueToCheck = ticket.department?.toLowerCase() || '';
        break;
      case 'priority':
        valueToCheck = ticket.priority?.toLowerCase() || '';
        break;
      default:
        valueToCheck = '';
    }

    return valueToCheck.includes(query);
  });
}

  getStatusCount(status: string): Observable<number> {
    return this.getFilteredTickets().pipe(
      map(tickets => tickets.filter(t => t.status === status).length)
    );
  }

  getTotalCount(): Observable<number> {
    return this.getFilteredTickets().pipe(map(tickets => tickets.length));
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const dt = new Date(date);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dt);
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      open: 'Abierto',
      'in-progress': 'En Progreso',
      resolved: 'Resuelto',
      closed: 'Cerrado',
    };
    return statusMap[status] || status;
  }

  getPriorityText(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente',
    };
    return priorityMap[priority] || priority;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      open: 'badge-blue',
      'in-progress': 'badge-yellow',
      resolved: 'badge-green',
      closed: 'badge-gray',
    };
    return colorMap[status] || 'badge-gray';
  }

  getPriorityColor(priority: string): string {
    const colorMap: { [key: string]: string } = {
      urgent: 'badge-red',
      high: 'badge-orange',
      medium: 'badge-yellow',
      low: 'badge-green',
    };
    return colorMap[priority] || 'badge-gray';
  }

  getAssigneeInitials(assignee?: string): string {
    if (!assignee) return 'SA';

    if (assignee.includes('@')) {
      const name = assignee.split('@')[0];
      return name.substring(0, 2).toUpperCase();
    }

    const names = assignee.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }

    return assignee.substring(0, 2).toUpperCase();
  }

getAssigneeName(assignee?: string): string {
  if (!assignee) return 'Sin asignar';

  // Verifica si es un correo (asumiendo que el correo es un correo electrónico)
  if (assignee.includes('@')) {
    // Encuentra el usuario con ese correo
    const user = this.allUsers.find(u => u.email === assignee);
    return user ? user.name : assignee;  // Si encuentra el usuario, devuelve su nombre, sino devuelve el correo
  }

  return assignee;
}


// Función para obtener el color según el rol del assignee
getAssigneeColor(assignee?: string): string {
  if (!assignee) return 'bg-gray-400'; // Si no hay assignee, se retorna el color gris

  const role = this.getUserRole(assignee); // Utilizamos la función para obtener el rol

  switch(role) {
    case 'admin':
      return 'admin-avatar'; // Clase que representa el color para admins
    case 'support':
      return 'support-avatar'; // Clase que representa el color para support
    case 'user':
      return 'user-avatar'; // Clase para usuarios
    case 'unknown':
    default:
      return 'unknown-avatar'; // Clase para desconocidos
  }
}


  getFormattedAssigneeName(assignee?: string): string {
    const name = this.getAssigneeName(assignee);
    const parts = name.split(' ');

    if (parts.length <= 1) return name;

    const mid = Math.ceil(parts.length / 2);
    const firstLine = parts.slice(0, mid).join(' ');
    const secondLine = parts.slice(mid).join(' ');

    return `${firstLine}<br>${secondLine}`;
  }

  getFormattedRequesterName(name: string): string {
    if (!name) return '';

    const parts = name.split(' ');

    if (parts.length <= 1) return name;

    const mid = Math.ceil(parts.length / 2);
    const firstLine = parts.slice(0, mid).join(' ');
    const secondLine = parts.slice(mid).join(' ');

    return `${firstLine}<br>${secondLine}`;
  }

// Función para obtener solo las dos primeras iniciales del requester
getRequesterInitials(requesterName: string): string {
  if (!requesterName) return '?';
  const parts = requesterName.split(' ');
  
  // Toma las iniciales de los dos primeros nombres/apellidos
  const initials = parts.slice(0, 2).map(p => p[0]).join('').toUpperCase(); 
  return initials;
}


  // Función para obtener el color según el rol del requester
  getRequesterColor(requesterName: string): string {
    const role = this.getUserRole(requesterName); // Utilizamos la función de obtener el rol
    
  switch(role) {
    case 'admin':
      return 'admin-avatar'; // Clase que representa el color para admins
    case 'support':
      return 'support-avatar'; // Clase que representa el color para support
    case 'user':
      return 'user-avatar'; // Clase para usuarios
    case 'unknown':
    default:
      return 'unknown-avatar'; // Clase para desconocidos
  }
  }

  // Función para obtener el rol del requester basado en el nombre
  getUserRole(requesterName: string): string {
    const user = this.allUsers.find((u: User) => u.name === requesterName);
    return user ? user.role : 'unknown'; // Si no se encuentra, se retorna 'unknown'
  }
}
