"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
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

  // Gebeta API format
  const { totalDistance, timetaken, direction } = routeData
  
  // Check if we have valid route data
  if (!direction || !Array.isArray(direction)) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Route className="h-5 w-5" />
          <span>Route to {nearestErteb.location.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-blue-700">
              {(totalDistance / 1000).toFixed(2)} km
            </div>
            <div className="text-sm text-blue-600">Distance</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-xl font-bold text-green-700 flex items-center justify-center">
              <Clock className="h-4 w-4 mr-1" />
              {Math.round(timetaken / 60)} min
            </div>
            <div className="text-sm text-green-600">Travel Time</div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium mb-2">Destination:</h4>
          <p className="text-sm text-gray-700 mb-1">
            <MapPin className="h-3 w-3 inline mr-1" />
            {nearestErteb.location.address}
          </p>
          <p className="text-sm text-gray-700">
            <Route className="h-3 w-3 inline mr-1" />
            {direction.length} route points
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
