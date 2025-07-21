"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Ticket } from "@/app/page"

interface TicketTableProps {
  tickets: Ticket[]
  onSelectTicket: (ticket: Ticket) => void
  userRole: "user" | "admin"
}

export function TicketTable({ tickets, onSelectTicket, userRole }: TicketTableProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
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
      case "urgent":
        return "Urgente"
      case "high":
        return "Alta"
      case "medium":
        return "Media"
      case "low":
        return "Baja"
      default:
        return priority
    }
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No se encontraron tickets</p>
        </CardContent>
      </Card>
    )
  }

  const getFilterInfo = () => {
    if (tickets.length === 0) return null

    return (
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          Mostrando <span className="font-semibold">{tickets.length}</span> ticket{tickets.length !== 1 ? "s" : ""}
          {tickets.length < 10 && " encontrado" + (tickets.length !== 1 ? "s" : "")}
        </p>
      </div>
    )
  }

  return (
    <>
      {getFilterInfo()}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  <Button variant="ghost" className="h-auto p-0 font-semibold">
                    Ticket
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  <Button variant="ghost" className="h-auto p-0 font-semibold">
                    Última Actualización
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  <Button variant="ghost" className="h-auto p-0 font-semibold">
                    Asunto
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  <Button variant="ghost" className="h-auto p-0 font-semibold">
                    De
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  <Button variant="ghost" className="h-auto p-0 font-semibold">
                    Prioridad
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-gray-900">
                  <Button variant="ghost" className="h-auto p-0 font-semibold">
                    Asignado A
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                  onClick={() => onSelectTicket(ticket)}
                >
                  <TableCell>
                    <Checkbox onClick={(e) => e.stopPropagation()} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          ticket.status === "open"
                            ? "bg-blue-500"
                            : ticket.status === "in-progress"
                              ? "bg-yellow-500"
                              : ticket.status === "resolved"
                                ? "bg-green-500"
                                : "bg-gray-500"
                        }`}
                      />
                      <span className="font-medium text-blue-600">#{ticket.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{formatDate(ticket.lastActivity)}</TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="font-medium text-gray-900 truncate">{ticket.title}</p>
                      <Badge className={`mt-1 ${getStatusColor(ticket.status)}`} variant="outline">
                        {getStatusText(ticket.status)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{ticket.requester}</p>
                      <p className="text-gray-500">{ticket.department}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getPriorityColor(ticket.priority)}`} variant="outline">
                      {getPriorityText(ticket.priority)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{ticket.assignedTo || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onSelectTicket(ticket)}>Ver detalles</DropdownMenuItem>
                        {userRole === "admin" && (
                          <>
                            <DropdownMenuItem>Asignar</DropdownMenuItem>
                            <DropdownMenuItem>Cambiar estado</DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Seleccionar:</span>
              <Button variant="link" className="h-auto p-0 text-sm">
                Todos
              </Button>
              <Button variant="link" className="h-auto p-0 text-sm">
                Ninguno
              </Button>
              <Button variant="link" className="h-auto p-0 text-sm">
                Seleccionar
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              Mostrando 1 - {tickets.length} de cerca de {tickets.length}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
