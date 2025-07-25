"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  User,
  Send,
  AlertCircle,
  Mail,
  Building,
  MessageSquare,
  Settings,
  Printer,
  RefreshCw,
  Reply,
  Edit3,
} from "lucide-react"
import type { Ticket } from "@/app/page"

interface TicketDetailProps {
  ticket: Ticket
  onBack: () => void
  onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => void
  onAddResponse: (ticketId: string, message: string, isStaff?: boolean, isInternal?: boolean) => void
  userRole: "user" | "admin"
}

export function TicketDetail({ ticket, onBack, onUpdateTicket, onAddResponse, userRole }: TicketDetailProps) {
  const [responseMessage, setResponseMessage] = useState("")
  const [newStatus, setNewStatus] = useState(ticket.status)
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo || "")
  const [responseType, setResponseType] = useState<"public" | "internal">("public")

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatFullDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const handleSendResponse = () => {
    if (!responseMessage.trim()) return

    onAddResponse(ticket.id, responseMessage, userRole === "admin", responseType === "internal")
    setResponseMessage("")
  }

  const handleUpdateStatus = () => {
    const updates: Partial<Ticket> = { status: newStatus }
    if (assignedTo) {
      updates.assignedTo = assignedTo
    }
    onUpdateTicket(ticket.id, updates)
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

  const getCategoryText = (category: string) => {
    switch (category) {
      case "hardware":
        return "Hardware"
      case "software":
        return "Software"
      case "network":
        return "Red/Internet"
      case "access":
        return "Accesos"
      default:
        return category
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "hardware":
        return <Printer className="h-4 w-4" />
      case "software":
        return <Settings className="h-4 w-4" />
      case "network":
        return <RefreshCw className="h-4 w-4" />
      case "access":
        return <User className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    ticket.status === "open"
                      ? "bg-blue-500"
                      : ticket.status === "in-progress"
                        ? "bg-yellow-500"
                        : ticket.status === "resolved"
                          ? "bg-green-500"
                          : "bg-gray-500"
                  }`}
                />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Ticket #{ticket.id}</h1>
                  <p className="text-sm text-gray-600">{ticket.title}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge className={`${getStatusColor(ticket.status)}`} variant="outline">
                {getStatusText(ticket.status)}
              </Badge>
              <Badge className={`${getPriorityColor(ticket.priority)}`} variant="outline">
                {getPriorityText(ticket.priority)}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Ticket Info */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{ticket.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {ticket.requester}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {ticket.requesterEmail}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {ticket.department}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(ticket.category)}
                    <Badge variant="outline">{getCategoryText(ticket.category)}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Thread */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Hilo del Ticket ({ticket.responses.length + 1})
                  </CardTitle>
                  <Tabs value="thread" className="w-auto">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="thread">Tareas</TabsTrigger>
                      <TabsTrigger value="tasks">Hilo</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Original ticket */}
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 mt-1">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {ticket.requester
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{ticket.requester}</span>
                          <span className="text-sm text-gray-500">publicado {formatDate(ticket.createdAt)}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Reply className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                    </div>

                    {/* Activity log */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 ml-4">
                      <Edit3 className="h-3 w-3" />
                      <span>Creado por</span>
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-xs">
                          {ticket.requester
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {ticket.requester} {formatDate(ticket.createdAt)}
                      </span>
                    </div>

                    {ticket.assignedTo && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 ml-4">
                        <User className="h-3 w-3" />
                        <span>
                          Daniela Castañeda asignó esto a {ticket.assignedTo} {formatDate(ticket.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Responses */}
                {ticket.responses.map((response, index) => (
                  <div key={response.id} className="flex gap-4">
                    <Avatar className="h-10 w-10 mt-1">
                      <AvatarFallback className={response.isStaff ? "bg-orange-100 text-orange-600" : "bg-gray-100"}>
                        {response.isStaff
                          ? "IT"
                          : response.author
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div
                        className={`rounded-lg p-4 border ${
                          response.isStaff ? "bg-orange-50 border-orange-100" : "bg-gray-50 border-gray-200"
                        } ${response.isInternal ? "border-dashed" : ""}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{response.author}</span>
                            {response.isStaff && (
                              <Badge variant="secondary" className="text-xs">
                                Equipo IT
                              </Badge>
                            )}
                            {response.isInternal && (
                              <Badge variant="outline" className="text-xs border-dashed">
                                Nota Interna
                              </Badge>
                            )}
                            <span className="text-sm text-gray-500">publicado {formatDate(response.createdAt)}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Reply className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{response.message}</p>
                      </div>

                      {response.isStaff && index === ticket.responses.length - 1 && ticket.status === "closed" && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 ml-4">
                          <Settings className="h-3 w-3" />
                          <span>Cerrado por</span>
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-xs">IT</AvatarFallback>
                          </Avatar>
                          <span>
                            {response.author} con el estado de Closed {formatDate(response.createdAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <Separator />

                {/* Response Form */}
                {userRole === "admin" && (
                  <div className="space-y-4">
                    <Tabs value={responseType} onValueChange={(value: any) => setResponseType(value)}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="public">Publicar Respuesta</TabsTrigger>
                        <TabsTrigger value="internal">Publicar nota interna</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <div className="space-y-3">
                      <Textarea
                        placeholder={
                          responseType === "internal"
                            ? "Escribe una nota interna para el equipo..."
                            : "Escribe tu respuesta..."
                        }
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        rows={4}
                        className="min-h-[100px]"
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Select defaultValue="it-dept">
                            <SelectTrigger className="w-64">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="it-dept">Depto Informática &lt;informatica@empresa.cl&gt;</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center gap-2">
                          <Select defaultValue="all-active">
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all-active">Todos los Destinatarios activos</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            onClick={handleSendResponse}
                            disabled={!responseMessage.trim()}
                            className="flex items-center gap-2"
                          >
                            <Send className="h-4 w-4" />
                            {responseType === "internal" ? "Publicar Nota" : "Enviar Respuesta"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información del Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Estado:</span>
                    <div className="mt-1">
                      <Badge className={`${getStatusColor(ticket.status)}`} variant="outline">
                        {getStatusText(ticket.status)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Prioridad:</span>
                    <div className="mt-1">
                      <Badge className={`${getPriorityColor(ticket.priority)}`} variant="outline">
                        {getPriorityText(ticket.priority)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Departamento:</span>
                  <p className="mt-1">{ticket.department}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Creado en:</span>
                  <p className="mt-1">{formatFullDate(ticket.createdAt)}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Cerrado por:</span>
                  <p className="mt-1">{ticket.assignedTo || "-"}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Plan de SLA:</span>
                  <p className="mt-1">Ninguno</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Fecha de cierre:</span>
                  <p className="mt-1">{ticket.status === "closed" ? formatFullDate(ticket.updatedAt) : "-"}</p>
                </div>
              </CardContent>
            </Card>

            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Usuario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {ticket.requester
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{ticket.requester}</p>
                    <p className="text-gray-600">{ticket.requesterEmail}</p>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="mt-1">{ticket.requesterEmail}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Fuente:</span>
                  <p className="mt-1">Web</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Temas de ayuda:</span>
                  <p className="mt-1">{getCategoryText(ticket.category)}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Último mensaje:</span>
                  <p className="mt-1">{formatDate(ticket.lastActivity)}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Última respuesta:</span>
                  <p className="mt-1">{formatDate(ticket.lastActivity)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Admin Controls */}
            {userRole === "admin" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Gestión</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado</label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Abierto</SelectItem>
                        <SelectItem value="in-progress">En Progreso</SelectItem>
                        <SelectItem value="resolved">Resuelto</SelectItem>
                        <SelectItem value="closed">Cerrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Asignado a</label>
                    <Select value={assignedTo} onValueChange={setAssignedTo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Jaime Astorga">Jaime Astorga</SelectItem>
                        <SelectItem value="Francisco Droguett">Francisco Droguett</SelectItem>
                        <SelectItem value="Carlos IT">Carlos IT</SelectItem>
                        <SelectItem value="Laura IT">Laura IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleUpdateStatus}
                    className="w-full"
                    disabled={newStatus === ticket.status && assignedTo === ticket.assignedTo}
                  >
                    Actualizar Ticket
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
