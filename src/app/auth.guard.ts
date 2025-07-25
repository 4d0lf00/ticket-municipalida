import { Injectable } from '@angular/core'
import { CanActivate, Router } from '@angular/router'
import { UserSessionService } from './services/user-session.service'

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private userSession: UserSessionService, private router: Router) {}

  canActivate(): boolean {
    const usuario = this.userSession.getUsuarioActivo()
    if (usuario) {
      return true
    } else {
      this.router.navigate(['/login'])
      return false
    }
  }
}
