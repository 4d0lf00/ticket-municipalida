import { Component, ElementRef, HostListener, OnInit, OnDestroy, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { User } from '../../models/user.model';
import { UserSessionService } from '../../services/user-session.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  usuario: User | null = null;
  showUserMenu = false;
  private sub!: Subscription;
  @ViewChild('menuWrapper') menuWrapperRef!: ElementRef;

  constructor(
    private userSession: UserSessionService,
    private router: Router,
    private elRef: ElementRef // 👉 necesario para detectar clics fuera
  ) {}

  ngOnInit(): void {
    this.sub = this.userSession.usuarioActivo$.subscribe(user => {
      this.usuario = user;
    });
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.userSession.logout();
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // 👇 Detectar clics fuera del child "relative"
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const clickedInside = this.menuWrapperRef?.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showUserMenu = false;
    }
  }
}
