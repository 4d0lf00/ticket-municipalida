"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, MessageCircle } from "lucide-react"
import type { Ticket } from "@/app/page"

interface TicketListProps {
  tickets: Ticket[]
  onSelectTicket: (ticket: Ticket) => void
  getStatusColor: (status: string) => string
  getPriorityColor: (priority: string) => string
  title: string
  showRequester?: boolean
}

export function TicketList({
  tickets,
  onSelectTicket,
  getStatusColor,
  getPriorityColor,
  title,
  showRequester = true,
}: TicketListProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Abierto"
      case "in-progress":
        return "En Progreso"
      case "resolved":
        return "Resuelto"
      case "closed":
        return "Cerrado"
      default:
        return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "low":
        return "Baja"
      case "medium":
        return "Media"
      case "high":
        return "Alta"
      case "urgent":
        return "Urgente"
      default:
        return priority
    }
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No hay tickets disponibles</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onSelectTicket(ticket)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-sm truncate">{ticket.title}</h3>
                  <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>{getStatusText(ticket.status)}</Badge>
                  <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                    {getPriorityText(ticket.priority)}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{ticket.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {showRequester && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {ticket.requester}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(ticket.createdAt)}
                  </div>
                  {ticket.responses.length > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {ticket.responses.length} respuesta{ticket.responses.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>

              <Button variant="outline" size="sm">
                Ver Detalles
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
