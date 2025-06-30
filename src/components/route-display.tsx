"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Route } from "lucide-react"

interface RouteDisplayProps {
  routeData: any
  nearestErteb: {
    location: {
      name: string
      address: string
    }
    distance: number
  }
}

export function RouteDisplay({ routeData, nearestErteb }: RouteDisplayProps) {
  if (!routeData) return null

  const { routes } = routeData
  const route = routes?.[0]

  if (!route) return null

  const { distance, duration, legs } = route
  const instructions = legs?.[0]?.steps || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Route className="h-5 w-5" />
          <span>Route to {nearestErteb.location.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>{(distance / 1000).toFixed(1)} km</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{Math.round(duration / 60)} min</span>
            </Badge>
          </div>
        </div>

        {instructions.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Turn-by-turn directions:</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {instructions.map((step: any, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{step.maneuver?.instruction || step.name}</p>
                    {step.distance && (
                      <p className="text-xs text-gray-500">
                        {step.distance > 1000
                          ? `${(step.distance / 1000).toFixed(1)} km`
                          : `${Math.round(step.distance)} m`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
