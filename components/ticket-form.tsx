"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Monitor, Wifi, Shield, Wrench } from "lucide-react"
import type { Ticket } from "@/app/page"

interface TicketFormProps {
  onSubmit: (
    ticket: Omit<
      Ticket,
      "id" | "createdAt" | "updatedAt" | "lastActivity" | "responses" | "requester" | "requesterEmail" | "department"
    >,
  ) => void
  currentUser?: {
    name: string
    email: string
    department: string
  }
}

export function TicketForm({ onSubmit, currentUser }: TicketFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as const,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description || !formData.category) {
      return
    }

    onSubmit({
      ...formData,
      status: "open",
    })

    setFormData({
      title: "",
      description: "",
      category: "",
      priority: "medium",
    })
  }

  const categories = [
    { value: "hardware", label: "Hardware", icon: Monitor, description: "Problemas con equipos, impresoras, etc." },
    { value: "software", label: "Software", icon: Wrench, description: "Problemas con programas y aplicaciones" },
    { value: "network", label: "Red/Internet", icon: Wifi, description: "Problemas de conectividad" },
    { value: "access", label: "Accesos", icon: Shield, description: "Solicitudes de acceso a sistemas" },
  ]

  const departments = [
    "Informática",
    "Contabilidad",
    "Recursos Humanos",
    "Ventas",
    "Marketing",
    "Administración",
    "Gerencia",
    "Otro",
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        {/* Información del usuario (solo lectura) */}
        {currentUser && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Información del Solicitante</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nombre:</span>
                <p className="font-medium">{currentUser.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium">{currentUser.email}</p>
              </div>
              <div>
                <span className="text-gray-600">Departamento:</span>
                <p className="font-medium">{currentUser.department}</p>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Information */}
        <div className="space-y-2">
          <Label htmlFor="title">Asunto</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Describe brevemente el problema"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Categoría</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Card
                  key={category.value}
                  className={`cursor-pointer transition-all ${
                    formData.category === category.value
                      ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50 border-gray-200"
                  }`}
                  onClick={() => setFormData({ ...formData, category: category.value })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-sm">{category.label}</h3>
                        <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Baja - No es urgente
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  Media - Puede esperar unas horas
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  Alta - Necesita atención pronto
                </div>
              </SelectItem>
              <SelectItem value="urgent">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  Urgente - Bloquea el trabajo
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción Detallada</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe el problema con el mayor detalle posible. Incluye pasos para reproducir el problema, mensajes de error, etc."
            rows={6}
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <AlertCircle className="h-5 w-5 text-blue-600" />
        <p className="text-sm text-blue-800">
          El equipo de IT revisará tu solicitud y te contactará pronto. Recibirás actualizaciones por email.
        </p>
      </div>

      <Button type="submit" className="w-full" size="lg">
        Crear Ticket
      </Button>
    </form>
  )
}
