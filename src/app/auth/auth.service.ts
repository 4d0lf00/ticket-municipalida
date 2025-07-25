import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private localKey = 'usuarios';

  constructor() {
    this.crearUsuarioAdminPorDefecto();
  }

  // Método para agregar el usuario admin por defecto si no existe
  private crearUsuarioAdminPorDefecto(): void {
    const usuarios = this.getUsuarios();
    const adminExistente = usuarios.some(u => u.email === 'admin@admin.cl');

    if (!adminExistente) {
      const admin: User = {
        name: 'Admin',
        email: 'admin@admin.cl',
        role: 'admin',
        department: 'Admin',
        password: 'AdminimdA',  // Contraseña por defecto
      };

      usuarios.push(admin);  // Agregar el usuario admin
      localStorage.setItem(this.localKey, JSON.stringify(usuarios));  // Guardar en localStorage
    }
  }

  registrar(usuario: User): boolean {
    const usuarios = this.getUsuarios();
    const existe = usuarios.some(u => u.email === usuario.email);
    if (existe) return false;

    usuarios.push(usuario);
    localStorage.setItem(this.localKey, JSON.stringify(usuarios));
    return true;
  }

  login(email: string, password: string): User | null {
    const usuarios = this.getUsuarios();
    const usuario = usuarios.find(u => u.email === email);
    
    // Verificar si el correo existe y si la contraseña es correcta
    if (usuario && usuario.password === password) {
      return usuario;
    }

    return null;  // Si no existe o la contraseña es incorrecta, devolvemos null
  }

  getUsuarios(): User[] {
    const data = localStorage.getItem(this.localKey);
    return data ? JSON.parse(data) : [];
  }
}
