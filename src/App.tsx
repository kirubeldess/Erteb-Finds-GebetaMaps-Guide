"use client"

import { useState, useEffect } from "react"
import { GebetaMap, MapMarker, MapPolyline } from "@gebeta/tiles"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, Loader2, AlertCircle, Crosshair, Map, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RouteDisplay } from "@/components/route-display"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

// Mock erteb locations in Addis Ababa area
const ERTEB_LOCATIONS = [
  { id: 1, name: "Erteb House Bole", lat: 8.9806, lng: 38.7578, address: "Bole Road, Addis Ababa" },
  { id: 2, name: "Erteb House Piazza", lat: 9.0348, lng: 38.7497, address: "Piazza, Addis Ababa" },
  { id: 3, name: "Erteb House Merkato", lat: 9.0092, lng: 38.7441, address: "Merkato, Addis Ababa" },
  { id: 4, name: "Erteb House CMC", lat: 8.9955, lng: 38.7614, address: "CMC, Addis Ababa" },
  { id: 5, name: "Erteb House Kazanchis", lat: 9.0157, lng: 38.7614, address: "Kazanchis, Addis Ababa" },
]

// Common locations in Addis Ababa for testing
const TEST_LOCATIONS = [
  { name: "Bole Airport", lat: 8.9778, lng: 38.7989 },
  { name: "Meskel Square", lat: 9.0113, lng: 38.7617 },
  { name: "National Museum", lat: 9.0266, lng: 38.7622 },
  { name: "Entoto Park", lat: 9.0699, lng: 38.7468 },
]

interface UserLocation {
  lat: number
  lng: number
  accuracy?: number
}

interface NearestErteb {
  location: (typeof ERTEB_LOCATIONS)[0]
  distance: number
}
export default function ErtebFinder() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [nearestErteb, setNearestErteb] = useState<NearestErteb | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([38.7578, 8.9806]) // Default to Addis Ababa
  const [routeData, setRouteData] = useState<any>(null)
  const [watchId, setWatchId] = useState<number | null>(null)
  const [isWatching, setIsWatching] = useState(false)
  
  // Manual coordinate entry
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualLat, setManualLat] = useState("")
  const [manualLng, setManualLng] = useState("")

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Find nearest erteb location
  const findNearestErteb = (userLat: number, userLng: number): NearestErteb => {
    let nearest = ERTEB_LOCATIONS[0]
    let minDistance = calculateDistance(userLat, userLng, nearest.lat, nearest.lng)

    ERTEB_LOCATIONS.forEach((location) => {
      const distance = calculateDistance(userLat, userLng, location.lat, location.lng)
      if (distance < minDistance) {
        minDistance = distance
        nearest = location
      }
    })

    return { location: nearest, distance: minDistance }
  }

  // Get user's current location
  const getCurrentLocation = () => {
    setIsLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.")
      setIsLoading(false)
      return
    }

    // Clear any existing watch
    if (watchId !== null) {
      stopWatchingLocation()
    }

    // Clear any cached positions first
    try {
      navigator.geolocation.clearWatch(navigator.geolocation.watchPosition(() => {}))
    } catch (e) {
      // Ignore errors from this operation
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        console.log(`Location details:`, position.coords)
        
        const userPos = { 
          lat: latitude, 
          lng: longitude,
          accuracy: accuracy
        }

        setUserLocation(userPos)
        setMapCenter([longitude, latitude])

        // Find nearest erteb
        const nearest = findNearestErteb(latitude, longitude)
        setNearestErteb(nearest)

        setIsLoading(false)
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location. "
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please allow location access in your browser settings."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable."
            break
          case error.TIMEOUT:
            errorMessage += "Request timed out. Please try again."
            break
          default:
            errorMessage += "Please check your device settings."
        }
        
        setError(errorMessage)
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // Longer timeout to get better accuracy
        maximumAge: 0, // Don't use cached position
      },
    )
  }

  // Start watching user's location
  const startWatchingLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.")
      return
    }
    
    // Clear any existing watch
    if (watchId !== null) {
      stopWatchingLocation()
    }
    
    try {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords
          console.log(`Updated location - Accuracy: ${accuracy} meters`)
          
          const userPos = { 
            lat: latitude, 
            lng: longitude,
            accuracy: accuracy
          }
          
          setUserLocation(userPos)
          setMapCenter([longitude, latitude])
          
          // Find nearest erteb
          const nearest = findNearestErteb(latitude, longitude)
          setNearestErteb(nearest)
          
          setIsWatching(true)
          setError(null)
          },
          (error) => {
          let errorMessage = "Unable to track your location. "
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Please allow location access in your browser settings."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable."
              break
            case error.TIMEOUT:
              errorMessage += "Request timed out. Please try again."
              break
            default:
              errorMessage += "Please check your device settings."
          }
          
          setError(errorMessage)
          stopWatchingLocation()
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
      
      setWatchId(id)
    } catch (err) {
      console.error("Error starting location watch:", err)
      setError("Failed to start location tracking.")
    }
  }
  
  // Stop watching user's location
  const stopWatchingLocation = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
      setIsWatching(false)
    }
  }
  
  // Clean up the watch when component unmounts
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  // Get directions to nearest erteb
  const getDirections = async () => {
    if (!userLocation || !nearestErteb) return

    setIsLoading(true)
    setError(null)

    try {
      const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55bmFtZSI6IktpcnViZWwiLCJkZXNjcmlwdGlvbiI6IjVkMWY2MjQyLTljNTYtNDE1Yy05ZWNkLWQ5Y2QzYWNlNDNhYyIsImlkIjoiNzdkYmVhZWEtMDJiOC00MGU2LWJhNWUtYWQ0NDQzMzIyMjI3IiwidXNlcm5hbWUiOiJraXJ1YmVsZGVzcyJ9.sDLsuOK3OLX2MEJGc8sBaE1amjeZrWt81iCjbPmf96E'

      const url = `https://mapapi.gebeta.app/api/route/direction/?origin=${userLocation.lat},${userLocation.lng}&destination=${nearestErteb.location.lat},${nearestErteb.location.lng}&instructions=1&apiKey=${apiKey}`
      
      console.log("Fetching directions from:", url)

      const response = await fetch(url)
      const data = await response.json()
      
      console.log("Direction API response:", data)

      if (response.ok && data && data.direction) {
        // Make sure we have the route data in the correct format
        if (Array.isArray(data.direction) && data.direction.length > 0) {
          console.log(`Route received with ${data.direction.length} points`)
          setRouteData(data)
          
          // Adjust map to show the entire route
          if (data.direction.length > 0) {
            // Get the first point of the route
            const firstPoint = data.direction[0]
            setMapCenter([firstPoint[0], firstPoint[1]])
          }
        } else {
          setError("Invalid route data received")
          console.error("Invalid route data:", data)
        }
      } else {
        const errorMessage = data.error?.message || "Unable to get directions. Please try again."
        setError(errorMessage)
        console.error("API Error:", data.error || data)
      }
    } catch (err) {
      setError("Network error. Please check your connection.")
      console.error("Network error:", err)
    }
    setIsLoading(false)
  }

  // Set location manually
  const setManualLocation = () => {
    const lat = parseFloat(manualLat)
    const lng = parseFloat(manualLng)
    
    if (isNaN(lat) || isNaN(lng)) {
      setError("Please enter valid coordinates")
      return
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError("Coordinates out of valid range")
      return
    }
    
    const userPos = { 
      lat, 
      lng,
      accuracy: 10 // Assuming high accuracy for manual input
    }

    setUserLocation(userPos)
    setMapCenter([lng, lat])

    // Find nearest erteb
    const nearest = findNearestErteb(lat, lng)
    setNearestErteb(nearest)
    
    setError(null)
  }

  // Update map when user location changes
  useEffect(() => {
    if (userLocation) {
      // Zoom in closer to user's location for better accuracy
      setMapCenter([userLocation.lng, userLocation.lat])
    }
  }, [userLocation])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Erteb Finder</h1>
                <p className="text-sm text-gray-600">Find the nearest erteb house</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="h-5 w-5" />
                  <span>Find Nearest Erteb</span>
                  {isWatching && (
                    <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                      <Crosshair className="w-3 h-3 mr-1" />
                      Live Tracking
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Locate your position and find the closest erteb house</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={getCurrentLocation} 
                    disabled={isLoading} 
                    className="w-full" 
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Finding Location...
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Find My Location
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={isWatching ? stopWatchingLocation : startWatchingLocation}
                    disabled={isLoading}
                    className={`w-full ${isWatching ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}`}
                    size="lg"
                  >
                    {isWatching ? (
                      <>
                        <Crosshair className="mr-2 h-4 w-4" />
                        Stop Tracking
                      </>
                    ) : (
                      <>
                        <Crosshair className="mr-2 h-4 w-4" />
                        Live Tracking
                      </>
                    )}
                  </Button>
                </div>

                {/* Manual coordinate entry */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium mb-3">Test with Manual Coordinates</h4>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <Input 
                        type="text" 
                        placeholder="Latitude" 
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                      />
                    </div>
                    <div>
                      <Input 
                        type="text" 
                        placeholder="Longitude" 
                        value={manualLng}
                        onChange={(e) => setManualLng(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={setManualLocation} 
                    className="w-full mb-3"
                    variant="outline"
                    size="sm"
                  >
                    <Map className="mr-2 h-4 w-4" />
                    Set Test Location
                  </Button>
                  
                  {/* Preset locations */}
                  <div className="mt-3">
                    <h5 className="text-xs font-medium text-gray-500 mb-2">Try these locations:</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {TEST_LOCATIONS.map((loc, index) => (
                        <Button 
                          key={index}
                          variant="ghost" 
                          size="sm"
                          className="text-xs justify-start h-auto py-1"
                          onClick={() => {
                            setManualLat(loc.lat.toString());
                            setManualLng(loc.lng.toString());
                          }}
                        >
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{loc.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {userLocation && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">Your Location</h3>
                    <p className="text-sm text-green-700">
                      Lat: {userLocation.lat.toFixed(6)}
                      <br />
                      Lng: {userLocation.lng.toFixed(6)}
                      {userLocation.accuracy && (
                        <>
                          <br />
                          <div className="mt-2">
                            <div className="flex items-center justify-between">
                              <span>Accuracy:</span>
                              <span 
                                className={`font-medium ${
                                  userLocation.accuracy < 20 
                                    ? "text-green-600" 
                                    : userLocation.accuracy < 100 
                                    ? "text-amber-600"
                                    : "text-red-600"
                                }`}
                              >
                                {userLocation.accuracy.toFixed(1)} meters
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${
                                  userLocation.accuracy < 20 
                                    ? "bg-green-600" 
                                    : userLocation.accuracy < 100 
                                    ? "bg-amber-600"
                                    : "bg-red-600"
                                }`}
                                style={{ 
                                  width: `${Math.max(0, Math.min(100, 100 - (userLocation.accuracy / 2)))}%` 
                                }}
                              ></div>
                            </div>
                            {userLocation.accuracy > 100 && (
                              <p className="text-xs text-red-600 mt-1 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Low accuracy - Consider refreshing your location
                              </p>
                            )}
                            {isWatching && (
                              <p className="text-xs text-green-600 mt-1 flex items-center">
                                <Crosshair className="w-3 h-3 mr-1" />
                                Live tracking enabled - Location updates automatically
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </p>
                        </div>
                )}

                {nearestErteb && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">Nearest Erteb House</h3>
                    <p className="font-medium text-blue-900">{nearestErteb.location.name}</p>
                    <p className="text-sm text-blue-700 mb-2">{nearestErteb.location.address}</p>
                    <p className="text-sm text-blue-600">Distance: {nearestErteb.distance.toFixed(2)} km</p>
                        <Button
                      onClick={getDirections}
                      disabled={isLoading}
                      className="w-full mt-3 bg-transparent"
                      variant="outline"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Getting Directions...
                        </>
                      ) : (
                        <>
                          <Navigation className="mr-2 h-4 w-4" />
                          Get Directions
                        </>
                      )}
                        </Button>
                  </div>
                )}

                {routeData && nearestErteb && <RouteDisplay routeData={routeData} nearestErteb={nearestErteb} />}
                </CardContent>
              </Card>

            {/* All Erteb Locations */}
            <Card>
                <CardHeader>
                <CardTitle>All Erteb Houses</CardTitle>
                <CardDescription>Available locations in Addis Ababa</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-3">
                  {ERTEB_LOCATIONS.map((location) => (
                    <div
                      key={location.id}
                      className={`p-3 rounded-lg border ${
                        nearestErteb?.location.id === location.id
                          ? "bg-green-50 border-green-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <p className="font-medium text-gray-900">{location.name}</p>
                      <p className="text-sm text-gray-600">{location.address}</p>
                      {nearestErteb?.location.id === location.id && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Nearest
                        </span>
                      )}
                    </div>
                  ))}
                  </div>
                </CardContent>
              </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardContent className="p-0 h-full">
                <GebetaMap
                  apiKey='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55bmFtZSI6IktpcnViZWwiLCJkZXNjcmlwdGlvbiI6IjVkMWY2MjQyLTljNTYtNDE1Yy05ZWNkLWQ5Y2QzYWNlNDNhYyIsImlkIjoiNzdkYmVhZWEtMDJiOC00MGU2LWJhNWUtYWQ0NDQzMzIyMjI3IiwidXNlcm5hbWUiOiJraXJ1YmVsZGVzcyJ9.sDLsuOK3OLX2MEJGc8sBaE1amjeZrWt81iCjbPmf96E'
                  center={mapCenter}
                  zoom={userLocation ? 15 : 12} // Zoom in closer when user location is available
                  style="basic"
                  className="w-full h-full rounded-lg"
                >
                  {/* User location marker */}
                  {userLocation && (
                    <MapMarker
                      id="user-location"
                      lngLat={[userLocation.lng, userLocation.lat]}
                      color="#3B82F6"
                      onClick={() => console.log("User location clicked")}
                    />
                  )}
                  
                  {/* Route polyline - show the route path when directions are available */}
                  {routeData && routeData.direction && (
                    <MapPolyline
                      id="route-path"
                      coordinates={routeData.direction.map((point: [number, number]) => point)}
                      color="#EF4444"
                      width={4}
                    />
                  )}
                  
                  {/* Erteb location markers */}
                  {ERTEB_LOCATIONS.map((location) => (
                    <MapMarker
                      key={location.id}
                      id={`erteb-${location.id}`}
                      lngLat={[location.lng, location.lat]}
                      color={nearestErteb?.location.id === location.id ? "#10B981" : "#EF4444"}
                      onClick={() => console.log(`${location.name} clicked`)}
                    />
                  ))}
                </GebetaMap>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
