"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Clock, CheckCircle, AlertTriangle, XCircle, BarChart3 } from "lucide-react"
import type { Ticket } from "@/app/page"

interface TicketStatsProps {
  tickets: Ticket[]
  activeFilter: string
  userRole: "user" | "admin"
  currentUser?: {
    name: string
    email: string
    department: string
  }
}

export function TicketStats({ tickets, activeFilter, userRole, currentUser }: TicketStatsProps) {
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
    urgent: tickets.filter((t) => t.priority === "urgent").length,
    high: tickets.filter((t) => t.priority === "high").length,
  }

  const getActiveCount = () => {
    switch (activeFilter) {
      case "open":
        return stats.open
      case "in-progress":
        return stats.inProgress
      case "resolved":
        return stats.resolved
      case "closed":
        return stats.closed
      default:
        return stats.total
    }
  }

  const getActiveLabel = () => {
    switch (activeFilter) {
      case "open":
        return "Abiertos"
      case "in-progress":
        return "En Progreso"
      case "resolved":
        return "Resueltos"
      case "closed":
        return "Cerrados"
      default:
        return "Total"
    }
  }

  const getActiveIcon = () => {
    switch (activeFilter) {
      case "open":
        return <Clock className="h-5 w-5 text-blue-600" />
      case "in-progress":
        return <BarChart3 className="h-5 w-5 text-yellow-600" />
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "closed":
        return <XCircle className="h-5 w-5 text-gray-600" />
      default:
        return <BarChart3 className="h-5 w-5 text-blue-600" />
    }
  }

  const getActiveColor = () => {
    switch (activeFilter) {
      case "open":
        return "border-l-blue-500 bg-blue-50"
      case "in-progress":
        return "border-l-yellow-500 bg-yellow-50"
      case "resolved":
        return "border-l-green-500 bg-green-50"
      case "closed":
        return "border-l-gray-500 bg-gray-50"
      default:
        return "border-l-blue-500 bg-blue-50"
    }
  }

  return (
    <div className="space-y-4">
      {userRole === "user" && currentUser && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-1">Mis Tickets - {currentUser.name}</h3>
          <p className="text-xs text-blue-700">Aquí puedes ver el estado de todas tus solicitudes al equipo de IT</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`border-l-4 ${getActiveColor()}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{getActiveLabel()}</p>
                <p className="text-2xl font-bold text-gray-900">{getActiveCount()}</p>
              </div>
              {getActiveIcon()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alta Prioridad</p>
                <p className="text-2xl font-bold text-gray-900">{stats.urgent + stats.high}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Distribución</p>
              <div className="flex gap-1">
                <div className="flex-1 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${stats.total > 0 ? (stats.open / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex-1 h-2 bg-yellow-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex-1 h-2 bg-green-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${stats.total > 0 ? ((stats.resolved + stats.closed) / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolved + stats.closed}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
