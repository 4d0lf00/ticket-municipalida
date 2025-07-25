import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserSessionService {
  private usuarioSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  private usuariosSubject = new BehaviorSubject<User[]>(this.loadUsuariosFromStorage());

  constructor() {}

  // Cargar usuario activo desde localStorage
  private loadUserFromStorage(): User | null {
    const data = localStorage.getItem('usuarioActivo');
    return data ? JSON.parse(data) : null;
  }

  // Cargar todos los usuarios desde localStorage
  private loadUsuariosFromStorage(): User[] {
    const data = localStorage.getItem('usuarios');
    return data ? JSON.parse(data) : [];
  }

  // Observable del usuario activo
  get usuarioActivo$(): Observable<User | null> {
    return this.usuarioSubject.asObservable();
  }

  // Observable de todos los usuarios
  get usuarios$(): Observable<User[]> {
    return this.usuariosSubject.asObservable();
  }

  // Obtener la lista de usuarios directamente (sin ser observable)
  getUsuarios(): User[] {
    return this.usuariosSubject.getValue();
  }

  // Guardar la lista de usuarios en localStorage
  setUsuarios(usuarios: User[]): void {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    this.usuariosSubject.next(usuarios);
  }

  // Obtener usuario activo directamente (sin ser observable)
  getUsuarioActivo(): User | null {
    return this.usuarioSubject.getValue();
  }

  // Establecer usuario activo
  setUsuarioActivo(user: User): void {
    localStorage.setItem('usuarioActivo', JSON.stringify(user));
    this.usuarioSubject.next(user);
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('usuarioActivo');
    this.usuarioSubject.next(null);
  }
}
