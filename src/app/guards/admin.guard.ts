import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserSessionService } from '../services/user-session.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private userSession: UserSessionService, private router: Router) {}

  canActivate(): boolean {
    const usuario = this.userSession.getUsuarioActivo();

    if (usuario && usuario.role === 'admin') {
      return true;
    }

    // Redirigir si no es admin
    this.router.navigate(['/']);
    return false;
  }
}
