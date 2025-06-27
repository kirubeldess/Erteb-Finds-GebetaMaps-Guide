// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { MapPin, Navigation, Clock, Route } from "lucide-react"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { GebetaMap, MapMarker, MapPolyline } from "@gebeta/tiles"

// // Sample Erteb spots data - replace with your actual data
// const ERTEB_SPOTS = [
//   {
//     id: 1,
//     name: "Erteb Central",
//     address: "Bole, Addis Ababa",
//     lat: 8.9806,
//     lng: 38.7578,
//     phone: "+251-11-123-4567",
//     hours: "8:00 AM - 10:00 PM",
//     services: ["Coffee", "Pastries", "WiFi"],
//   },
//   {
//     id: 2,
//     name: "Erteb Piazza",
//     address: "Piazza, Addis Ababa",
//     lat: 9.0348,
//     lng: 38.7497,
//     phone: "+251-11-234-5678",
//     hours: "9:00 AM - 9:00 PM",
//     services: ["Coffee", "Meals", "Meeting Room"],
//   },
//   {
//     id: 3,
//     name: "Erteb Merkato",
//     address: "Merkato, Addis Ababa",
//     lat: 9.0065,
//     lng: 38.7221,
//     phone: "+251-11-345-6789",
//     hours: "7:00 AM - 11:00 PM",
//     services: ["Coffee", "Quick Bites", "Takeaway"],
//   },
//   {
//     id: 4,
//     name: "Erteb CMC",
//     address: "CMC, Addis Ababa",
//     lat: 8.995,
//     lng: 38.789,
//     phone: "+251-11-456-7890",
//     hours: "8:30 AM - 9:30 PM",
//     services: ["Coffee", "Workspace", "Printing"],
//   },
//   {
//     id: 5,
//     name: "Erteb Kazanchis",
//     address: "Kazanchis, Addis Ababa",
//     lat: 9.0234,
//     lng: 38.7612,
//     phone: "+251-11-567-8901",
//     hours: "9:00 AM - 10:00 PM",
//     services: ["Coffee", "Desserts", "Events"],
//   },
// ]

// interface UserLocation {
//   lat: number
//   lng: number
// }

// interface ErtebSpotWithDistance {
//   id: number
//   name: string
//   address: string
//   lat: number
//   lng: number
//   phone: string
//   hours: string
//   services: string[]
//   distance?: number
// }

// interface RouteData {
//   totalDistance: number
//   timetaken: number
//   direction: [number, number][]
// }

// export default function ErtebFinder() {
//   const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
//   const [nearestSpots, setNearestSpots] = useState<ErtebSpotWithDistance[]>([])
//   const [selectedSpot, setSelectedSpot] = useState<ErtebSpotWithDistance | null>(null)
//   const [routeData, setRouteData] = useState<RouteData | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [showMap, setShowMap] = useState(false)
//   const apiKey = import.meta.env.VITE_GEBETA_API_KEY

//   // Calculate distance between two points using Haversine formula
//   const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
//     const R = 6371 // Earth's radius in kilometers
//     const dLat = ((lat2 - lat1) * Math.PI) / 180
//     const dLng = ((lng2 - lng1) * Math.PI) / 180
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
//     return R * c
//   }

//   // Find nearest Erteb spots using distance calculation
//   const findNearestSpots = (location: UserLocation) => {
//     const spotsWithDistance = ERTEB_SPOTS.map((spot) => ({
//       ...spot,
//       distance: calculateDistance(location.lat, location.lng, spot.lat, spot.lng),
//     }))

//     // Sort by distance and take top 5
//     const sorted = spotsWithDistance.sort((a, b) => a.distance! - b.distance!).slice(0, 5)
//     setNearestSpots(sorted)
//   }

//   const handleGetStarted = () => {
//     setLoading(true);
//     // Get user's location
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const location = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude
//           };
//           setUserLocation(location);
//           findNearestSpots(location);
//           setShowMap(true);
//           setLoading(false);
//         },
//         (error) => {
//           console.error("Error getting location:", error);
//           // Default to Addis Ababa if location access is denied
//           const defaultLocation = { lat: 8.9806, lng: 38.7578 };
//           setUserLocation(defaultLocation);
//           findNearestSpots(defaultLocation);
//           setShowMap(true);
//           setLoading(false);
//         }
//       );
//     } else {
//       // Default to Addis Ababa if geolocation is not supported
//       const defaultLocation = { lat: 8.9806, lng: 38.7578 };
//       setUserLocation(defaultLocation);
//       findNearestSpots(defaultLocation);
//       setShowMap(true);
//       setLoading(false);
//     }
//   };

//   // Get directions to selected spot using Directions API
//   const getDirections = async (spot: ErtebSpotWithDistance) => {
//     if (!userLocation || !apiKey) {
//       setError("Please enter your API key and enable location services.")
//       return
//     }

//     setLoading(true)
//     setError(null)

//     try {
//       const response = await fetch(
//         `https://mapapi.gebeta.app/api/route/direction/?origin=${userLocation.lat},${userLocation.lng}&destination=${spot.lat},${spot.lng}&apiKey=${apiKey}`,
//       )

//       if (!response.ok) {
//         throw new Error("Failed to get directions")
//       }

//       const data = await response.json()

//       if (data.msg === "Ok") {
//         setRouteData({
//           totalDistance: data.totalDistance,
//           timetaken: data.timetaken,
//           direction: data.direction,
//         })
//         setSelectedSpot(spot)
//       } else {
//         setError("No route found to this location.")
//       }
//     } catch (err) {
//       setError("Failed to get directions. Please check your API key and try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">Erteb Spot Finder & Route Optimizer</h1>
//           <p className="text-gray-600">Discover, navigate, and optimize your visits to Erteb locations</p>
//         </div>

//         {!showMap ? (
//           <Card className="mb-6">
//             <CardHeader>
//               <CardTitle>Get Started</CardTitle>
//               <CardDescription>Click the button below to find Erteb spots near you</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Button 
//                 onClick={handleGetStarted}
//                 className="bg-blue-600 hover:bg-blue-700 w-full"
//                 disabled={loading}
//               >
//                 {loading ? "Finding your location..." : "Find Erteb Spots Near Me"}
//               </Button>
//             </CardContent>
//           </Card>
//         ) : (
//           <>
//             {/* Map Display - Always visible when showMap is true */}
//             <Card className="mb-6">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <MapPin className="w-5 h-5 text-blue-600" />
//                   Erteb Map
//                 </CardTitle>
//                 <CardDescription>View Erteb spots and your location</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="h-96 rounded-lg overflow-hidden">
//                   <GebetaMap
//                     apiKey={apiKey}
//                     center={[userLocation?.lng || 38.7578, userLocation?.lat || 8.9806]}
//                     zoom={12}
//                     style={"basic"}
//                   >
//                     {/* User location marker */}
//                     <MapMarker
//                       id="user-location"
//                       lngLat={[userLocation?.lng || 38.7578, userLocation?.lat || 8.9806]}
//                       color="#22C55E"
//                       onClick={() => console.log("Your location clicked!")}
//                     />

//                     {/* Erteb spot markers */}
//                     {nearestSpots.map((spot, index) => (
//                       <MapMarker
//                         key={spot.id}
//                         id={`spot-${spot.id}`}
//                         lngLat={[spot.lng, spot.lat]}
//                         color={index === 0 ? "#EF4444" : "#3B82F6"}
//                         onClick={() => {
//                           console.log(`${spot.name} clicked!`)
//                           getDirections(spot)
//                         }}
//                       />
//                     ))}

//                     {/* Route polyline - show the actual path when directions are available */}
//                     {selectedSpot && routeData && (
//                       <MapPolyline
//                         id="route-path"
//                         coordinates={routeData.direction.map(([lng, lat]) => [lng, lat])}
//                         color="#EF4444"
//                         width={4}
//                       />
//                     )}
//                   </GebetaMap>
//                 </div>

//                 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="flex items-center gap-2">
//                     <div className="w-4 h-4 bg-green-500 rounded-full"></div>
//                     <span className="text-sm text-gray-600">Your Location</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-4 h-4 bg-red-500 rounded-full"></div>
//                     <span className="text-sm text-gray-600">Nearest Erteb Spot</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
//                     <span className="text-sm text-gray-600">Other Erteb Spots</span>
//                   </div>
//                   <div className="text-sm text-gray-600">Click any marker to get directions</div>
//                 </div>
//               </CardContent>
//             </Card>
            
//             {/* User Location Display */}
//             {userLocation && (
//               <Card className="mb-6">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Navigation className="w-5 h-5 text-green-600" />
//                     Your Location
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-gray-600">
//                     Latitude: {userLocation.lat.toFixed(6)}, Longitude: {userLocation.lng.toFixed(6)}
//                   </p>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Nearest Spots */}
//             {nearestSpots.length > 0 && (
//               <Card className="mb-6">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <MapPin className="w-5 h-5 text-blue-600" />
//                     Nearest Erteb Spots
//                   </CardTitle>
//                   <CardDescription>Sorted by straight-line distance</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {nearestSpots.map((spot, index) => (
//                       <div
//                         key={spot.id}
//                         className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
//                       >
//                         <div className="flex-1">
//                           <div className="flex items-center gap-2 mb-1">
//                             <h3 className="font-semibold text-gray-900">{spot.name}</h3>
//                             <Badge variant="secondary">#{index + 1}</Badge>
//                           </div>
//                           <p className="text-gray-600 text-sm mb-1">{spot.address}</p>
//                           <p className="text-gray-500 text-xs mb-1">
//                             {spot.phone} • {spot.hours}
//                           </p>
//                           <div className="flex gap-1 mb-2">
//                             {spot.services.map((service) => (
//                               <Badge key={service} variant="outline" className="text-xs">
//                                 {service}
//                               </Badge>
//                             ))}
//                           </div>
//                           <div className="flex gap-4 text-sm">
//                             <span className="text-blue-600 font-medium">{spot.distance?.toFixed(2)} km away</span>
//                           </div>
//                         </div>
//                         <Button
//                           onClick={() => getDirections(spot)}
//                           disabled={loading}
//                           size="sm"
//                           className="bg-green-600 hover:bg-green-700"
//                         >
//                           <Route className="w-4 h-4 mr-1" />
//                           Get Directions
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Route Information */}
//             {selectedSpot && routeData && (
//               <Card className="mt-6">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Route className="w-5 h-5 text-green-600" />
//                     Route to {selectedSpot.name}
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                     <div className="text-center p-4 bg-blue-50 rounded-lg">
//                       <div className="text-2xl font-bold text-blue-600">{routeData.totalDistance.toFixed(1)} km</div>
//                       <div className="text-sm text-gray-600">Distance</div>
//                     </div>
//                     <div className="text-center p-4 bg-green-50 rounded-lg">
//                       <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
//                         <Clock className="w-5 h-5" />
//                         {Math.round(routeData.timetaken / 60)} min
//                       </div>
//                       <div className="text-sm text-gray-600">Travel Time</div>
//                     </div>
//                     <div className="text-center p-4 bg-purple-50 rounded-lg">
//                       <div className="text-2xl font-bold text-purple-600">{routeData.direction.length}</div>
//                       <div className="text-sm text-gray-600">Route Points</div>
//                     </div>
//                   </div>

//                   <div className="bg-gray-50 p-4 rounded-lg">
//                     <h4 className="font-semibold mb-2">Destination Details:</h4>
//                     <p className="text-sm text-gray-600 mb-1">📍 {selectedSpot.address}</p>
//                     <p className="text-sm text-gray-600 mb-1">📞 {selectedSpot.phone}</p>
//                     <p className="text-sm text-gray-600 mb-1">🕒 {selectedSpot.hours}</p>
//                     <div className="flex gap-1 mt-2">
//                       {selectedSpot.services.map((service) => (
//                         <Badge key={service} variant="outline" className="text-xs">
//                           {service}
//                         </Badge>
//                       ))}
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}
//           </>
//         )}

//         {/* Instructions - only show when no data */}
//         {nearestSpots.length === 0 && !loading && showMap && (
//           <Card>
//             <CardHeader>
//               <CardTitle>How to Use</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <h4 className="font-semibold mb-2">🔍 Find Nearest Erteb Spots</h4>
//                 <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
//                   <li>Click on any Erteb spot to see more details</li>
//                   <li>View the sorted list of nearest spots with distances</li>
//                   <li>Click "Get Directions" for detailed turn-by-turn navigation</li>
//                   <li>Click any map marker to get directions to that spot</li>
//                 </ol>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Loading indicator */}
//         {loading && (
//           <div className="flex justify-center my-8">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }






















 


import { GebetaMap, MapMarker } from '@gebeta/tiles';

export default function App() {
  return (
    <div style={{ width: '80%', height: '100vh' }}>
      <GebetaMap
        apiKey="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55bmFtZSI6IktpcnViZWwiLCJkZXNjcmlwdGlvbiI6IjVkMWY2MjQyLTljNTYtNDE1Yy05ZWNkLWQ5Y2QzYWNlNDNhYyIsImlkIjoiNzdkYmVhZWEtMDJiOC00MGU2LWJhNWUtYWQ0NDQzMzIyMjI3IiwidXNlcm5hbWUiOiJraXJ1YmVsZGVzcyJ9.sDLsuOK3OLX2MEJGc8sBaE1amjeZrWt81iCjbPmf96E"
        center={[38.7578, 8.9806]}
        zoom={12}
        style="basic"
      >
        <MapMarker
          id="marker-1"
          lngLat={[38.7578, 8.9806]}
          color="#FF0000"
          onClick={() => console.log('Marker clicked!')}
        />
      </GebetaMap>
    </div>
  );
}