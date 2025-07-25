"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { TicketForm } from "@/components/ticket-form"
import { TicketTable } from "@/components/ticket-table"
import { TicketDetail } from "@/components/ticket-detail"
import { AdminDashboard } from "@/components/admin-dashboard"
import { Computer, Search, Plus, Filter, Settings, User, Bell, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { TicketStats } from "@/components/ticket-stats"

export type Ticket = {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in-progress" | "resolved" | "closed"
  requester: string
  requesterEmail: string
  assignedTo?: string
  department: string
  createdAt: Date
  updatedAt: Date
  lastActivity: Date
  responses: TicketResponse[]
}

export type TicketResponse = {
  id: string
  message: string
  author: string
  authorEmail: string
  isStaff: boolean
  createdAt: Date
  isInternal?: boolean
}

const initialTickets: Ticket[] = [
  // Tickets de María González
  {
    id: "004612",
    title: "Carpeta compartida",
    description:
      "Necesito acceso a la carpeta compartida del departamento de contabilidad para revisar los archivos del mes anterior.",
    category: "access",
    priority: "high",
    status: "open",
    requester: "María González",
    requesterEmail: "mgonzalez@empresa.cl",
    department: "Contabilidad",
    createdAt: new Date("2024-06-24T17:10:00"),
    updatedAt: new Date("2024-06-24T17:10:00"),
    lastActivity: new Date("2024-06-24T17:10:00"),
    responses: [],
  },
  {
    id: "004615",
    title: "Problema con Excel",
    description: "Excel se cierra inesperadamente cuando intento abrir archivos grandes. Necesito ayuda urgente.",
    category: "software",
    priority: "medium",
    status: "resolved",
    requester: "María González",
    requesterEmail: "mgonzalez@empresa.cl",
    department: "Contabilidad",
    createdAt: new Date("2024-06-20T10:30:00"),
    updatedAt: new Date("2024-06-22T14:15:00"),
    lastActivity: new Date("2024-06-22T14:15:00"),
    responses: [
      {
        id: "r4",
        message: "Hemos actualizado tu versión de Excel y optimizado la memoria. El problema debería estar resuelto.",
        author: "Carlos IT",
        authorEmail: "carlos@empresa.cl",
        isStaff: true,
        createdAt: new Date("2024-06-22T14:15:00"),
      },
    ],
  },

  // Tickets de Pedro Martín
  {
    id: "004620",
    title: "Solicitud de nuevo monitor",
    description: "Mi monitor actual tiene líneas verticales y dificulta mi trabajo. Solicito reemplazo.",
    category: "hardware",
    priority: "medium",
    status: "in-progress",
    requester: "Pedro Martín",
    requesterEmail: "pmartin@empresa.cl",
    department: "Ventas",
    createdAt: new Date("2024-06-23T09:15:00"),
    updatedAt: new Date("2024-06-24T11:30:00"),
    lastActivity: new Date("2024-06-24T11:30:00"),
    responses: [
      {
        id: "r5",
        message: "Hemos ordenado un monitor nuevo. Llegará la próxima semana y procederemos con el cambio.",
        author: "Laura IT",
        authorEmail: "laura@empresa.cl",
        isStaff: true,
        createdAt: new Date("2024-06-24T11:30:00"),
      },
    ],
  },
  {
    id: "004610",
    title: "SOLICITA NOTEBOOK",
    description:
      "Solicito asignación de notebook para trabajo remoto. Mi equipo actual no tiene la capacidad suficiente para las tareas requeridas.",
    category: "hardware",
    priority: "high",
    status: "open",
    requester: "Francisco Sandoval",
    requesterEmail: "fsandoval@empresa.cl",
    department: "Ventas",
    createdAt: new Date("2024-06-24T15:47:00"),
    updatedAt: new Date("2024-06-24T15:47:00"),
    lastActivity: new Date("2024-06-24T15:47:00"),
    responses: [],
  },
  {
    id: "004303",
    title: "PC hace ruido fuerte por el ventilador",
    description:
      "Mi computadora está haciendo un ruido muy fuerte desde el ventilador. El ruido es constante y está afectando mi concentración en el trabajo.",
    category: "hardware",
    priority: "high",
    status: "in-progress",
    requester: "Vanessa Cantillana",
    requesterEmail: "vcantillana@empresa.cl",
    assignedTo: "Francisco Droguett",
    department: "Recursos Humanos",
    createdAt: new Date("2024-04-25T10:56:00"),
    updatedAt: new Date("2024-06-24T14:30:00"),
    lastActivity: new Date("2024-06-24T14:30:00"),
    responses: [
      {
        id: "r1",
        message:
          "Hemos recibido tu solicitud. Vamos a revisar el equipo mañana en la mañana. Por favor mantén el equipo encendido para poder diagnosticar el problema.",
        author: "Francisco Droguett",
        authorEmail: "fdroguett@empresa.cl",
        isStaff: true,
        createdAt: new Date("2024-06-24T14:30:00"),
      },
    ],
  },
  {
    id: "004608",
    title: "Impresora Lenta en impresión",
    description:
      "La impresora imprime muy lentamente, da la impresión de que la información fuera le llegando de a poco ya que imprime un poco, se detiene, imprime otro poco y se vuelve a detener, y así hasta que imprime todo lo que se le envió.",
    category: "hardware",
    priority: "medium",
    status: "closed",
    requester: "Ana Margarita Riveros Melo",
    requesterEmail: "ariveros@empresa.cl",
    assignedTo: "Jaime Astorga",
    department: "Informática",
    createdAt: new Date("2024-06-25T09:43:00"),
    updatedAt: new Date("2024-06-25T15:22:00"),
    lastActivity: new Date("2024-06-25T15:22:00"),
    responses: [
      {
        id: "r2",
        message:
          "La impresora imprime muy lentamente, da la impresión de que la información fuera le llegando de a poco ya que imprime un poco, se detiene, imprime otro poco y se vuelve a detener, y así hasta que imprime todo lo que se le envió.\n\nSugiero mantención por parte de la empresa responsable.",
        author: "Ana Margarita Riveros Melo",
        authorEmail: "ariveros@empresa.cl",
        isStaff: false,
        createdAt: new Date("2024-06-25T09:43:00"),
      },
      {
        id: "r3",
        message:
          "Estimad@ Ana Margarita Riveros Melo, Se informa que su solicitud fue gestionada exitosamente\n\nSaludos Cordiales.-",
        author: "Jaime Astorga",
        authorEmail: "jastorga@empresa.cl",
        isStaff: true,
        createdAt: new Date("2024-06-25T15:22:00"),
      },
    ],
  },
]

export default function TicketSystem() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [userRole, setUserRole] = useState<"user" | "admin">("admin")
  const [activeTab, setActiveTab] = useState("tickets")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [currentUser, setCurrentUser] = useState({
    name: "María González",
    email: "mgonzalez@empresa.cl",
    department: "Contabilidad",
  })

  const getVisibleTickets = () => {
    if (userRole === "admin") {
      return tickets // Admins ven todos los tickets
    } else {
      // Usuarios normales solo ven sus propios tickets
      return tickets.filter((ticket) => ticket.requesterEmail === currentUser.email)
    }
  }

  const visibleTickets = getVisibleTickets()

  // Estadísticas para los filtros
  const stats = {
    total: visibleTickets.length,
    open: visibleTickets.filter((t) => t.status === "open").length,
    inProgress: visibleTickets.filter((t) => t.status === "in-progress").length,
    resolved: visibleTickets.filter((t) => t.status === "resolved").length,
    closed: visibleTickets.filter((t) => t.status === "closed").length,
    urgent: visibleTickets.filter((t) => t.priority === "urgent").length,
  }

  const addTicket = (newTicket: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "lastActivity" | "responses">) => {
    const ticket: Ticket = {
      ...newTicket,
      requester: currentUser.name,
      requesterEmail: currentUser.email,
      department: currentUser.department,
      id: (Math.floor(Math.random() * 900000) + 100000).toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
      responses: [],
    }
    setTickets([ticket, ...tickets])
    setActiveTab("tickets")
  }

  const updateTicket = (ticketId: string, updates: Partial<Ticket>) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, ...updates, updatedAt: new Date(), lastActivity: new Date() } : ticket,
      ),
    )
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, ...updates, updatedAt: new Date(), lastActivity: new Date() })
    }
  }

  const addResponse = (ticketId: string, message: string, isStaff = false, isInternal = false) => {
    const response: TicketResponse = {
      id: Date.now().toString(),
      message,
      author: isStaff ? "Equipo IT" : "Usuario",
      authorEmail: isStaff ? "it@empresa.cl" : "usuario@empresa.cl",
      isStaff,
      isInternal,
      createdAt: new Date(),
    }

    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              responses: [...ticket.responses, response],
              updatedAt: new Date(),
              lastActivity: new Date(),
            }
          : ticket,
      ),
    )

    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({
        ...selectedTicket,
        responses: [...selectedTicket.responses, response],
        updatedAt: new Date(),
        lastActivity: new Date(),
      })
    }
  }

  const filteredTickets = visibleTickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.includes(searchQuery)

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  if (selectedTicket) {
    return (
      <TicketDetail
        ticket={selectedTicket}
        onBack={() => setSelectedTicket(null)}
        onUpdateTicket={updateTicket}
        onAddResponse={addResponse}
        userRole={userRole}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Computer className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Sistema de Tickets</h1>
                  <p className="text-sm text-gray-500">Departamento de Informática</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.department}</p>
              </div>

              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{userRole === "admin" ? "Administrador" : "Usuario"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setUserRole(userRole === "admin" ? "user" : "admin")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Cambiar a {userRole === "admin" ? "Usuario" : "Admin"}
                  </DropdownMenuItem>
                  {userRole === "user" && (
                    <DropdownMenuItem
                      onClick={() =>
                        setCurrentUser({
                          name: currentUser.name === "María González" ? "Pedro Martín" : "María González",
                          email:
                            currentUser.email === "mgonzalez@empresa.cl"
                              ? "pmartin@empresa.cl"
                              : "mgonzalez@empresa.cl",
                          department: currentUser.department === "Contabilidad" ? "Ventas" : "Contabilidad",
                        })
                      }
                    >
                      <User className="h-4 w-4 mr-2" />
                      Cambiar Usuario
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Diferente para usuarios y admins */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-12 bg-transparent border-0 p-0 space-x-8">
              {userRole === "admin" ? (
                <>
                  <TabsTrigger
                    value="dashboard"
                    className="h-12 px-0 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
                  >
                    Panel de Control
                  </TabsTrigger>
                  <TabsTrigger
                    value="tickets"
                    className="h-12 px-0 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
                  >
                    Todos los Tickets
                  </TabsTrigger>
                </>
              ) : (
                <TabsTrigger
                  value="tickets"
                  className="h-12 px-0 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
                >
                  Mis Tickets
                </TabsTrigger>
              )}
              <TabsTrigger
                value="create"
                className="h-12 px-0 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
              >
                Nuevo Ticket
              </TabsTrigger>
              <TabsTrigger
                value="knowledge"
                className="h-12 px-0 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
              >
                Base de Conocimientos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard" className="mt-0">
            <AdminDashboard tickets={tickets} onSelectTicket={setSelectedTicket} onUpdateTicket={updateTicket} />
          </TabsContent>

          <TabsContent value="tickets" className="mt-0">
            <div className="space-y-4">
              {/* Filter Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      onClick={() => setStatusFilter("all")}
                      className="flex items-center gap-2"
                    >
                      Todos
                      <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                        {visibleTickets.length}
                      </Badge>
                    </Button>

                    <Button
                      variant={statusFilter === "open" ? "default" : "outline"}
                      onClick={() => setStatusFilter("open")}
                      className="flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Abiertos
                      <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                        {stats.open}
                      </Badge>
                    </Button>

                    <Button
                      variant={statusFilter === "in-progress" ? "default" : "outline"}
                      onClick={() => setStatusFilter("in-progress")}
                      className="flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      En Progreso
                      <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                        {stats.inProgress}
                      </Badge>
                    </Button>

                    <Button
                      variant={statusFilter === "resolved" ? "default" : "outline"}
                      onClick={() => setStatusFilter("resolved")}
                      className="flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Resueltos
                      <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                        {stats.resolved}
                      </Badge>
                    </Button>

                    <Button
                      variant={statusFilter === "closed" ? "default" : "outline"}
                      onClick={() => setStatusFilter("closed")}
                      className="flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      Cerrados
                      <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                        {stats.closed}
                      </Badge>
                    </Button>
                  </div>

                  <div className="flex gap-2 w-full lg:w-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          Prioridad: {priorityFilter === "all" ? "Todas" : priorityFilter}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setPriorityFilter("all")}>Todas</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPriorityFilter("urgent")}>Urgente</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPriorityFilter("high")}>Alta</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPriorityFilter("medium")}>Media</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPriorityFilter("low")}>Baja</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="relative flex-1 lg:w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Button className="flex items-center gap-2" onClick={() => setActiveTab("create")}>
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Nuevo</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Ticket Stats */}
              <TicketStats tickets={filteredTickets} activeFilter={statusFilter} />

              {/* Tickets Table */}
              <TicketTable tickets={filteredTickets} onSelectTicket={setSelectedTicket} userRole={userRole} />
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Ticket</h2>
                  <p className="text-gray-600 mt-1">
                    Describe tu problema o solicitud para que el equipo de IT pueda ayudarte
                  </p>
                </div>
                <TicketForm onSubmit={addTicket} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="mt-0">
            <Card>
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Base de Conocimientos</h2>
                <p className="text-gray-600">Próximamente: Artículos y guías para resolver problemas comunes</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
