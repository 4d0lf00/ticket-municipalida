import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { AuthService } from "../auth.service"
import { UserSessionService } from "src/app/services/user-session.service"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  email = ""
  password = ""
  mensaje = ""
  isLoading = false

  constructor(
    private authService: AuthService,
    private session: UserSessionService,
    private router: Router,
  ) {}

  login() {
    this.mensaje = ""

    if (!this.email || !this.password) {
      this.mensaje = "Por favor, complete todos los campos"
      return
    }

    this.isLoading = true

    setTimeout(() => {
      const usuario = this.authService.login(this.email, this.password)

      if (usuario) {
        this.session.setUsuarioActivo(usuario)
        this.router.navigate(["/tickets"])
      } else {
        this.mensaje = "Correo o contraseña incorrectos"
      }

      this.isLoading = false
    }, 500)
  }
}
