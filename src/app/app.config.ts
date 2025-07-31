import { type ApplicationConfig, importProvidersFrom } from "@angular/core"
import { provideRouter } from "@angular/router"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { provideHttpClient } from "@angular/common/http"

import { routes } from "./app.routes"

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    importProvidersFrom(BrowserAnimationsModule),
    provideHttpClient()
  ],
}
