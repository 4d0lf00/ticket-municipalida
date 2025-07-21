import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserSessionService } from '../../services/user-session.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  user: User = {
    name: '',
    email: '',
    role: 'user', // El rol predeterminado es usuario
    department: '',
    password: ''
  };

  mensaje = '';
  isSuccess = false;

  // Lista de departamentos
  departamentos = [
    'Informática',
    'Finanzas',
    'Obras Municipales',
    'Aseo y Ornato',
    'Tránsito y Transporte',
    'Salud',
    'Educación',
    'Desarrollo Comunitario',
    'Cultura',
    'Turismo',
    'Vivienda',
    'Atención al Vecino',
    'Seguridad Pública',
    'Medio Ambiente',
    'Personal',
    'Jurídico',
    'Planificación',
    'Relaciones Públicas',
    'Prevención de Riesgos'
  ];

  constructor(private userSessionService: UserSessionService, private router: Router) {}

async registrar() {
  // Validación básica de campos
  if (!this.user.name || !this.user.email || !this.user.department || !this.user.role || !this.user.password) {
    this.mensaje = 'Por favor, complete todos los campos requeridos.';
    this.isSuccess = false;
    return;
  }

  // Validación de email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@munimelipilla\.cl$/;
  if (!emailRegex.test(this.user.email)) {
    this.mensaje = 'Solo se permiten correos del dominio @munimelipilla.cl.';
    this.isSuccess = false;
    return;
  }


  // Validación de contraseña
  if (this.user.password.length < 6) {  // Puedes ajustar la longitud mínima según lo que necesites
    this.mensaje = 'La contraseña debe tener al menos 6 caracteres.';
    this.isSuccess = false;
    return;
  }

  // Obtener usuario logueado
  const usuarioLogueado = this.userSessionService.getUsuarioActivo();

  // Verificar si el usuario logueado es un administrador
  if (usuarioLogueado?.role !== 'admin') {
    this.mensaje = '**Sin permisos**, solo un administrador puede registrar nuevos usuarios';
    this.isSuccess = false;
    return;
  }

  // Simulando el registro exitoso con el servicio
  const exito = this.registrarUsuarioEnSistema();

  if (exito) {
    this.mensaje = `¡Usuario ${this.user.name} registrado exitosamente!`;
    this.isSuccess = true;

    // Redirigir al login después de 2 segundos
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);

  } else {
    this.mensaje = 'Este correo ya está registrado ⚠️';
    this.isSuccess = false;
  }
}


registrarUsuarioEnSistema(): boolean {
  // Obtener la lista de usuarios desde el localStorage
  const usuarios = this.userSessionService.getUsuarios();

  // Verificar si el usuario con el mismo correo ya existe
  const usuarioExistente = usuarios.find(u => u.email === this.user.email);
  if (usuarioExistente) {
    this.mensaje = 'Este correo ya está registrado ⚠️';
    this.isSuccess = false;
    return false;
  }

  // Si no existe, agregar el nuevo usuario a la lista
  usuarios.push(this.user);

  // Guardar la lista de usuarios actualizada en el localStorage
  this.userSessionService.setUsuarios(usuarios);

  return true;
}



  resetForm() {
    this.user = {
      name: '',
      email: '',
      department: '',
      role: 'user',
      password: ''

    };
    this.mensaje = '';
    this.isSuccess = false;
  }
}
