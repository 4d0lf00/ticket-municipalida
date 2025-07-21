"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TicketTable } from "@/components/ticket-table"
import { BarChart3, Clock, CheckCircle, AlertTriangle, Users, TrendingUp, Activity } from "lucide-react"
import type { Ticket } from "@/app/page"

interface AdminDashboardProps {
  tickets: Ticket[]
  onSelectTicket: (ticket: Ticket) => void
  onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => void
}

export function AdminDashboard({ tickets, onSelectTicket, onUpdateTicket }: AdminDashboardProps) {
  // Estadísticas
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
    urgent: tickets.filter((t) => t.priority === "urgent").length,
    high: tickets.filter((t) => t.priority === "high").length,
  }

  // Filtros de tickets
  const openTickets = tickets.filter((t) => t.status === "open")
  const inProgressTickets = tickets.filter((t) => t.status === "in-progress")
  const urgentTickets = tickets.filter((t) => t.priority === "urgent" || t.priority === "high")
  const recentTickets = tickets.slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Tickets</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">Todos los estados</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tickets Abiertos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.open}</p>
                <p className="text-xs text-gray-500 mt-1">Requieren atención</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Progreso</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
                <p className="text-xs text-gray-500 mt-1">Siendo trabajados</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alta Prioridad</p>
                <p className="text-3xl font-bold text-gray-900">{stats.urgent + stats.high}</p>
                <p className="text-xs text-gray-500 mt-1">Urgentes y altas</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Resumen de Estados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Abiertos</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">{stats.open}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">En Progreso</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">{stats.inProgress}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Resueltos</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">{stats.resolved}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cerrados</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-sm font-medium">{stats.closed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Distribución por Prioridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Urgente</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">{stats.urgent}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Alta</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">{stats.high}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Media</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">{tickets.filter((t) => t.priority === "medium").length}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Baja</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">{tickets.filter((t) => t.priority === "low").length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tasa de Resolución</span>
              <span className="text-sm font-medium">
                {stats.total > 0 ? Math.round(((stats.resolved + stats.closed) / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tickets Activos</span>
              <span className="text-sm font-medium">{stats.open + stats.inProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completados</span>
              <span className="text-sm font-medium">{stats.resolved + stats.closed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tiempo Promedio</span>
              <span className="text-sm font-medium">2.5 días</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de tickets */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recent">Recientes</TabsTrigger>
          <TabsTrigger value="open" className="flex items-center gap-2">
            Abiertos
            {stats.open > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {stats.open}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex items-center gap-2">
            En Progreso
            {stats.inProgress > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {stats.inProgress}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="urgent" className="flex items-center gap-2">
            Urgentes
            {urgentTickets.length > 0 && (
              <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                {urgentTickets.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <TicketTable tickets={recentTickets} onSelectTicket={onSelectTicket} userRole="admin" />
        </TabsContent>

        <TabsContent value="open">
          <TicketTable tickets={openTickets} onSelectTicket={onSelectTicket} userRole="admin" />
        </TabsContent>

        <TabsContent value="in-progress">
          <TicketTable tickets={inProgressTickets} onSelectTicket={onSelectTicket} userRole="admin" />
        </TabsContent>

        <TabsContent value="urgent">
          <TicketTable tickets={urgentTickets} onSelectTicket={onSelectTicket} userRole="admin" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
