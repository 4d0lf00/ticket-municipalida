# Sistema de Tickets Municipal

Sistema de gestión de tickets de soporte técnico para la Ilustre Municipalidad de Melipilla.

## Tecnologías Utilizadas

### Frontend
- **Angular 17+** - Framework principal
- **TypeScript** - Lenguaje de programación
- **Tailwind CSS** - Framework de estilos
- **Chart.js + ng2-charts** - Gráficos y estadísticas
- **TinyMCE** - Editor de texto enriquecido
- **RxJS** - Programación reactiva

### Servicios Externos
- **API Brevo** - Envío de emails transaccionales
- **localStorage** - Persistencia de datos local

## Funcionalidades

- ✅ Sistema de autenticación y autorización
- ✅ Gestión completa de tickets
- ✅ Dashboard administrativo con estadísticas
- ✅ Sistema de notificaciones por email
- ✅ Interfaz responsiva
- ✅ Editor de texto enriquecido para respuestas

## Instalación

```bash
npm install
npm start
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── auth/           # Autenticación
│   ├── pages/          # Páginas principales
│   ├── services/       # Servicios de negocio
│   ├── models/         # Modelos de datos
│   └── shared/         # Componentes compartidos
├── environments/       # Configuración de entornos
└── styles.css         # Estilos globales
```

## Estado del Proyecto

**✅ Completado**: Sistema funcional con todas las características principales implementadas.

**🔄 Pendiente**: Implementación de backend con base de datos y autenticación JWT.
