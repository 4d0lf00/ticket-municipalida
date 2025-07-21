import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, RouterModule } from "@angular/router"
import { TicketService } from "../../services/ticket.service"
import { Ticket, TicketStats } from "../../models/ticket.model"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"
import { User } from "../../models/user.model"
import { UserSessionService } from "../../services/user-session.service"
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { provideCharts } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ViewChild } from '@angular/core';

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective, FormsModule],
  providers: [provideCharts()],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  public ChartDataLabels = ChartDataLabels;
  public innerWidth: number = window.innerWidth;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  usuario: User | null = null
  tickets$: Observable<Ticket[]>
  stats$: Observable<TicketStats>
  // Estadísticas agrupadas
  ticketsByMonth$: Observable<{
    month: string,
    total: number,
    resolved: number,
    open: number,
    inProgress: number
  }[]>;
  ticketsByUser$: Observable<{
    name: string,
    email: string,
    role: string,
    assigned: number,
    resolved: number,
    resolutionRate: number
  }[]>;

  // Datos para gráficos
  ticketsByMonthChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  ticketsByUserChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  avgResolutionTimeChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };

  // Opciones de gráficos
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'center',
        labels: {
          color: '#1e293b',
          font: { size: 14, weight: 'bold' },
          padding: 20
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#fbbf24',
        borderColor: '#2563eb',
        borderWidth: 1,
        padding: 12,
        caretSize: 8,
        cornerRadius: 8
      },
      title: {
        display: false
      },
      datalabels: {
        anchor: 'center',
        align: 'center',
        clamp: true,
        color: '#000',
        font: (ctx: any) => {
          if (window.innerWidth < 700) {
            return { weight: 'bold', size: 10 };
          }
          return { weight: 'bold', size: 16 };
        },
        formatter: (value: any) => value,
        display: (ctx: any) => {
          if (typeof ctx.dataset.data[ctx.dataIndex] === 'number' && ctx.dataset.data[ctx.dataIndex] > 0) return true;
          return false;
        },
        padding: {
          top: 4,
          bottom: 4
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          color: '#64748b',
          font: (ctx: any) => {
            if (window.innerWidth < 700) {
              return { size: 10 };
            }
            return { size: 15 };
          },
          maxRotation: 30,
          minRotation: 0
        },
        // Más espacio entre barras (eliminar de escalas y elementos.bar, solo se usa en datasets)
      },
      y: {
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          color: '#64748b',
          font: (ctx: any) => {
            if (window.innerWidth < 700) {
              return { size: 10 };
            }
            return { size: 15 };
          }
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 8,
        borderSkipped: false,
        // Más espacio entre barras (eliminar de escalas y elementos.bar, solo se usa en datasets)
      }
    }
  };

  availableMonthYears: string[] = [];
  selectedMonthYear: string = '';
  availableMonthYearsUser: string[] = [];
  selectedMonthYearUser: string = '';
  availableMonthYearsAvgTime: string[] = [];
  selectedMonthYearAvgTime: string = '';

  constructor(
    private userSession: UserSessionService,
    private router: Router,
    private ticketService: TicketService
  ) {
    this.tickets$ = this.ticketService.getTickets();
    this.stats$ = this.calculateStats();
    this.ticketsByMonth$ = this.calculateTicketsByMonth();
    this.ticketsByUser$ = this.calculateTicketsByUserFiltered();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  onResize() {
    this.innerWidth = window.innerWidth;
    this.chart?.chart?.update();
  }

  ngOnInit(): void {
    this.usuario = this.userSession.getUsuarioActivo();
    if (!this.usuario || (this.usuario.role !== 'admin' && this.usuario.role !== 'support')) {
      this.router.navigate(['/unauthorized']);
    }
    // Suscribirse a los datos y preparar los gráficos
    this.ticketsByMonth$.subscribe(data => {
      this.availableMonthYears = data.map(d => d.month);
      this.ticketsByMonthChartData = {
        labels: data.map(d => d.month),
        datasets: [
          { label: 'Total', data: data.map(d => d.total), backgroundColor: '#60a5fa', datalabels: { anchor: 'center', align: 'center', clamp: true, color: '#000', display: (ctx: any) => ctx.dataset.data[ctx.dataIndex] > 0 } },
          { label: 'Resueltos', data: data.map(d => d.resolved), backgroundColor: '#34d399', datalabels: { anchor: 'center', align: 'center', clamp: true, color: '#000', display: (ctx: any) => ctx.dataset.data[ctx.dataIndex] > 0 } },
          { label: 'Abiertos', data: data.map(d => d.open), backgroundColor: '#fbbf24', datalabels: { anchor: 'center', align: 'center', clamp: true, color: '#000', display: (ctx: any) => ctx.dataset.data[ctx.dataIndex] > 0 } },
          { label: 'En Progreso', data: data.map(d => d.inProgress), backgroundColor: '#f59e42', datalabels: { anchor: 'center', align: 'center', clamp: true, color: '#000', display: (ctx: any) => ctx.dataset.data[ctx.dataIndex] > 0 } },
        ]
      };
      if (this.selectedMonthYear) {
        this.applyMonthYearFilter();
      }
    });
    // Tickets por usuario y gráfico
    this.tickets$.subscribe(tickets => {
      // Generar lista de meses disponibles para el filtro de usuario
      const monthsSet = new Set<string>();
      tickets.forEach(ticket => {
        const date = new Date(ticket.createdAt);
        const month = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        monthsSet.add(month);
      });
      this.availableMonthYearsUser = Array.from(monthsSet).sort((a, b) => {
        const [mA, yA] = a.split('/').map(Number);
        const [mB, yB] = b.split('/').map(Number);
        return yA !== yB ? yA - yB : mA - mB;
      });
      this.applyMonthYearUserFilter();
    });
    // Tiempo promedio de resolución por usuario y gráfico
    this.tickets$.subscribe(tickets => {
      // Generar lista de meses disponibles para el filtro de tiempo promedio
      const monthsSet = new Set<string>();
      tickets.forEach(ticket => {
        if (ticket.status === 'resolved' && ticket.updatedAt) {
          const date = new Date(ticket.updatedAt);
          const month = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
          monthsSet.add(month);
        }
      });
      this.availableMonthYearsAvgTime = Array.from(monthsSet).sort((a, b) => {
        const [mA, yA] = a.split('/').map(Number);
        const [mB, yB] = b.split('/').map(Number);
        return yA !== yB ? yA - yB : mA - mB;
      });
      this.applyMonthYearAvgTimeFilter();
    });
  }

  private calculateStats(): Observable<TicketStats> {
    return this.tickets$.pipe(
      map((tickets) => ({
        total: tickets.length,
        open: tickets.filter((t) => t.status === "open").length,
        inProgress: tickets.filter((t) => t.status === "in-progress").length,
        resolved: tickets.filter((t) => t.status === "resolved").length,
        closed: tickets.filter((t) => t.status === "closed").length,
        urgent: tickets.filter((t) => t.priority === "urgent").length,
        high: tickets.filter((t) => t.priority === "high").length,
      }))
    )
  }

  /**
   * Agrupa tickets por mes (formato: MM/YYYY) y muestra total, resueltos, abiertos y en progreso
   */
  private calculateTicketsByMonth(): Observable<{
    month: string,
    total: number,
    resolved: number,
    open: number,
    inProgress: number
  }[]> {
    return this.tickets$.pipe(
      map((tickets) => {
        const grouped: { [month: string]: { total: number, resolved: number, open: number, inProgress: number } } = {};
        tickets.forEach(ticket => {
          const date = new Date(ticket.createdAt);
          const month = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
          if (!grouped[month]) grouped[month] = { total: 0, resolved: 0, open: 0, inProgress: 0 };
          grouped[month].total++;
          if (ticket.status === 'resolved') grouped[month].resolved++;
          if (ticket.status === 'open') grouped[month].open++;
          if (ticket.status === 'in-progress') grouped[month].inProgress++;
        });
        return Object.entries(grouped).map(([month, stats]) => ({ month, ...stats })).sort((a, b) => {
          // Ordenar por fecha ascendente
          const [mA, yA] = a.month.split('/').map(Number);
          const [mB, yB] = b.month.split('/').map(Number);
          return yA !== yB ? yA - yB : mA - mB;
        });
      })
    );
  }

  /**
   * Cuenta tickets asignados, resueltos y porcentaje de resolución por usuario (admin/soporte)
   */
  private calculateTicketsByUser(): Observable<{
    name: string,
    email: string,
    role: string,
    assigned: number,
    resolved: number,
    resolutionRate: number
  }[]> {
    return this.tickets$.pipe(
      map((tickets) => {
        const userStats: { [email: string]: { assigned: number, resolved: number } } = {};
        tickets.forEach(ticket => {
          const assignee = ticket.assignee || 'Sin asignar';
          if (!userStats[assignee]) userStats[assignee] = { assigned: 0, resolved: 0 };
          userStats[assignee].assigned++;
          if (ticket.status === 'resolved') userStats[assignee].resolved++;
        });
        // Obtener usuarios del sistema
        const usuarios = this.userSession.getUsuarios();
        return Object.entries(userStats).map(([email, stats]) => {
          const user = usuarios.find(u => u.email === email);
          return {
            name: user ? user.name : email,
            email,
            role: user ? user.role : 'N/A',
            assigned: stats.assigned,
            resolved: stats.resolved,
            resolutionRate: stats.assigned > 0 ? Math.round((stats.resolved / stats.assigned) * 100) : 0
          };
        });
      })
    );
  }

  // --- Tickets por usuario con filtro ---
  private calculateTicketsByUserFiltered(): Observable<{
    name: string,
    email: string,
    role: string,
    assigned: number,
    resolved: number,
    resolutionRate: number
  }[]> {
    return this.tickets$.pipe(
      map((tickets) => {
        let filteredTickets = tickets;
        if (this.selectedMonthYearUser) {
          filteredTickets = tickets.filter(ticket => {
            const date = new Date(ticket.createdAt);
            const month = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            return month === this.selectedMonthYearUser;
          });
        }
        const userStats: { [email: string]: { assigned: number, resolved: number } } = {};
        filteredTickets.forEach(ticket => {
          const assignee = ticket.assignee || 'Sin asignar';
          if (!userStats[assignee]) userStats[assignee] = { assigned: 0, resolved: 0 };
          userStats[assignee].assigned++;
          if (ticket.status === 'resolved') userStats[assignee].resolved++;
        });
        const usuarios = this.userSession.getUsuarios();
        return Object.entries(userStats).map(([email, stats]) => {
          const user = usuarios.find(u => u.email === email);
          return {
            name: user ? user.name : email,
            email,
            role: user ? user.role : 'N/A',
            assigned: stats.assigned,
            resolved: stats.resolved,
            resolutionRate: stats.assigned > 0 ? Math.round((stats.resolved / stats.assigned) * 100) : 0
          };
        });
      })
    );
  }

  onMonthYearUserChange() {
    this.applyMonthYearUserFilter();
  }

  private applyMonthYearUserFilter() {
    this.ticketsByUser$ = this.calculateTicketsByUserFiltered();
    this.ticketsByUser$.subscribe(data => {
      this.ticketsByUserChartData = {
        labels: data.map(d => d.name),
        datasets: [
          { label: 'Asignados', data: data.map(d => d.assigned), backgroundColor: '#60a5fa', datalabels: { anchor: 'center', align: 'center', clamp: true } },
          { label: 'Resueltos', data: data.map(d => d.resolved), backgroundColor: '#34d399', datalabels: { anchor: 'center', align: 'center', clamp: true } },
          { label: '% Resolución', data: data.map(d => d.resolutionRate), backgroundColor: '#fbbf24', datalabels: { anchor: 'center', align: 'center', clamp: true } },
        ]
      };
    });
  }

  // --- Tiempo promedio de resolución por usuario con filtro ---
  onMonthYearAvgTimeChange() {
    this.applyMonthYearAvgTimeFilter();
  }

  private applyMonthYearAvgTimeFilter() {
    this.tickets$.subscribe(tickets => {
      const usuarios = this.userSession.getUsuarios();
      const userTimes: { [email: string]: { name: string, total: number, count: number } } = {};
      let filteredTickets = tickets;
      if (this.selectedMonthYearAvgTime) {
        filteredTickets = tickets.filter(ticket => {
          if (ticket.status === 'resolved' && ticket.updatedAt) {
            const date = new Date(ticket.updatedAt);
            const month = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            return month === this.selectedMonthYearAvgTime;
          }
          return false;
        });
      } else {
        filteredTickets = tickets.filter(ticket => ticket.status === 'resolved' && ticket.updatedAt);
      }
      filteredTickets.forEach(ticket => {
        if (ticket.status === 'resolved' && ticket.assignee && ticket.createdAt && ticket.updatedAt) {
          const user = usuarios.find(u => u.email === ticket.assignee);
          const name = user ? user.name : ticket.assignee;
          const created = new Date(ticket.createdAt).getTime();
          const resolved = new Date(ticket.updatedAt).getTime();
          const diffHours = (resolved - created) / (1000 * 60 * 60);
          if (!userTimes[ticket.assignee]) userTimes[ticket.assignee] = { name, total: 0, count: 0 };
          userTimes[ticket.assignee].total += diffHours;
          userTimes[ticket.assignee].count++;
        }
      });
      this.avgResolutionTimeChartData = {
        labels: Object.values(userTimes).map(u => u.name),
        datasets: [
          {
            label: 'Tiempo promedio de resolución (h)',
            data: Object.values(userTimes).map(u => u.count > 0 ? +(u.total / u.count).toFixed(2) : 0),
            backgroundColor: '#818cf8',
            datalabels: { anchor: 'center', align: 'center', clamp: true }
          }
        ]
      };
    });
  }

getRecentTickets(): Observable<Ticket[]> {
  return this.tickets$.pipe(
    map((tickets) =>
      [...tickets] // Clonamos el arreglo para evitar mutarlo
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
    )
  );
}

  onMonthYearChange() {
    this.applyMonthYearFilter();
  }

  private applyMonthYearFilter() {
    this.ticketsByMonth$.subscribe(data => {
      let filtered = data;
      if (this.selectedMonthYear) {
        filtered = data.filter(d => d.month === this.selectedMonthYear);
      }
      this.ticketsByMonthChartData = {
        labels: filtered.map(d => d.month),
        datasets: [
          { label: 'Total', data: filtered.map(d => d.total), backgroundColor: '#60a5fa' },
          { label: 'Resueltos', data: filtered.map(d => d.resolved), backgroundColor: '#34d399' },
          { label: 'Abiertos', data: filtered.map(d => d.open), backgroundColor: '#fbbf24' },
          { label: 'En Progreso', data: filtered.map(d => d.inProgress), backgroundColor: '#f59e42' },
        ]
      };
    });
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      open: "Abierto",
      "in-progress": "En Progreso",
      resolved: "Resuelto",
      closed: "Cerrado",
    }
    return statusMap[status] || status
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      open: "badge-blue",
      "in-progress": "badge-yellow",
      resolved: "badge-green",
      closed: "badge-gray",
    }
    return colorMap[status] || "badge-gray"
  }
}
