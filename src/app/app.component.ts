import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterOutlet } from "@angular/router"
import { HeaderComponent } from "./shared/header/header.component"
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50" [class.dashboard-page]="isDashboard">
      <app-header *ngIf="mostrarHeader"></app-header>
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent {
  title = "Sistema de Tickets IT";
  mostrarHeader = true;
  isDashboard = false;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Oculta el header solo en la ruta '/login'
        this.mostrarHeader = this.router.url !== '/login';
        // Detecta si estamos en el dashboard
        this.isDashboard = this.router.url === '/dashboard';
      }
    });
  }
}
