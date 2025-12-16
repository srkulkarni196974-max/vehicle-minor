import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Gauge, Clock, Radio, PlayCircle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { API_URL } from '../config';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface VehicleLocation {
    lat: number;
    lng: number;
    speed: number;
    timestamp: Date;
}

interface TripPoints {
    start: { lat: number; lng: number; label: string };
    end: { lat: number; lng: number; label: string };
}

// Component to auto-center map
function MapController({ center, bounds }: { center: [number, number], bounds?: L.LatLngBoundsExpression }) {
    const map = useMap();

    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            map.setView(center, 15);
        }
    }, [center, bounds, map]);

    return null;
}

interface VehicleTrackerProps {
    vehicleId: string;
    vehicleName: string;
    tripPoints?: TripPoints;
    historyPoints?: { lat: number; lng: number; timestamp: string }[];
    onSaveTrip?: (data: any) => void;
}

export default function VehicleTracker({ vehicleId, vehicleName, tripPoints, historyPoints, onSaveTrip }: VehicleTrackerProps) {
    const [currentLocation, setCurrentLocation] = useState<VehicleLocation>({
        lat: tripPoints?.start.lat || 18.5204, // Default to Trip Start or Pune
        lng: tripPoints?.start.lng || 73.8567,
        speed: 0,
        timestamp: new Date(),
    });
    const [locationHistory, setLocationHistory] = useState<[number, number][]>([]);
    const [internalTripPoints, setInternalTripPoints] = useState<TripPoints | undefined>(undefined);
    const [isConnected, setIsConnected] = useState(false);
    const [fullRouteCoordinates, setFullRouteCoordinates] = useState<[number, number][]>([]);
    const [remainingRouteCoordinates, setRemainingRouteCoordinates] = useState<[number, number][]>([]);
    const socketRef = useRef<Socket | null>(null);

    // Fetch Route from OSRM
    useEffect(() => {
        const fetchRoute = async () => {
            const points = tripPoints || internalTripPoints;
            if (!points) return;

            try {
                // OSRM expects {lon},{lat}
                const start = `${points.start.lng},${points.start.lat}`;
                const end = `${points.end.lng},${points.end.lat}`;
                const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;

                const response = await axios.get(url);
                if (response.data.routes && response.data.routes.length > 0) {
                    const coordinates = response.data.routes[0].geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
                    setFullRouteCoordinates(coordinates);
                    setRemainingRouteCoordinates(coordinates);
                }
            } catch (error) {
                console.error('Error fetching route:', error);
            }
        };

        fetchRoute();
    }, [tripPoints, internalTripPoints]);

    // Update Remaining Route based on Current Location
    useEffect(() => {
        if (fullRouteCoordinates.length === 0) return;

        // Find the closest point on the route to the current location
        let minDistance = Infinity;
        let closestIndex = 0;

        const currentLatLng = L.latLng(currentLocation.lat, currentLocation.lng);

        for (let i = 0; i < fullRouteCoordinates.length; i++) {
            const point = L.latLng(fullRouteCoordinates[i][0], fullRouteCoordinates[i][1]);
            const distance = currentLatLng.distanceTo(point);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        }

        // Slice the route from the closest point to the end
        // Also prepend the current location to make it smooth
        const remaining = fullRouteCoordinates.slice(closestIndex);
        setRemainingRouteCoordinates([[currentLocation.lat, currentLocation.lng], ...remaining]);

    }, [currentLocation, fullRouteCoordinates]);

    // Initialize Socket.io
    useEffect(() => {
        // Connect to the backend using centralized config
        const socketUrl = API_URL;
        console.log('Connecting to socket at:', socketUrl);

        socketRef.current = io(socketUrl);

        socketRef.current.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
            socketRef.current?.emit('join_vehicle', vehicleId);
        });

        socketRef.current.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        // Listen for updates from the REST API (DriverLocationService)
        socketRef.current.on('location-update', (data: any) => {
            if (data.vehicleId === vehicleId) {
                console.log('📍 Received location update:', data);
                const newLoc = {
                    lat: data.latitude,
                    lng: data.longitude,
                    speed: data.speed || 0,
                    timestamp: new Date(data.timestamp),
                };
                setCurrentLocation(newLoc);
                setLocationHistory(prev => [...prev, [data.latitude, data.longitude] as [number, number]].slice(-100));
            }
        });

        // Listen for updates from direct socket events (if any)
        socketRef.current.on('receive_location', (data: any) => {
            if (data.vehicleId === vehicleId) {
                console.log('📍 Received direct socket location:', data);
                const newLoc = {
                    lat: data.location.lat,
                    lng: data.location.lng,
                    speed: data.location.speed || 0,
                    timestamp: new Date(data.location.timestamp),
                };
                setCurrentLocation(newLoc);
                setLocationHistory(prev => [...prev, [data.location.lat, data.location.lng] as [number, number]].slice(-100));
            }
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [vehicleId]); // Removed currentLocation from dependency to avoid re-connecting on every update

    // Fetch vehicle data (Location & History) & Active Trip
    const fetchVehicleData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Fetch Vehicle Data
            const response = await axios.get(`${API_URL}/api/vehicles/${vehicleId}`, { headers });
            const vehicle = response.data;

            if (vehicle.currentLocation && vehicle.currentLocation.coordinates) {
                const lng = vehicle.currentLocation.coordinates[0];
                const lat = vehicle.currentLocation.coordinates[1];

                if (lat !== 0 && lng !== 0) {
                    setCurrentLocation({
                        lat: lat,
                        lng: lng,
                        speed: vehicle.currentLocation.speed || 0,
                        timestamp: new Date(vehicle.currentLocation.timestamp || new Date()),
                    });
                }
            }

            if (vehicle.locationHistory && vehicle.locationHistory.length > 0) {
                // If historyPoints prop is provided, we don't need to overwrite it with live history
                if (!historyPoints) {
                    const history = vehicle.locationHistory
                        .filter((pt: any) => pt.coordinates[1] !== 0 && pt.coordinates[0] !== 0)
                        .map((pt: any) => [pt.coordinates[1], pt.coordinates[0]] as [number, number]);

                    if (history.length > 0) {
                        setLocationHistory(history);
                    }
                }
            }

            // 2. Fetch Active Trip (if tripPoints not provided via props)
            if (!tripPoints) {
                const tripsResponse = await axios.get(`${API_URL}/api/trips`, { headers });
                // Filter for this vehicle and status 'Ongoing'
                const activeTrip = tripsResponse.data.find((t: any) =>
                    (t.vehicleId._id === vehicleId || t.vehicleId === vehicleId) &&
                    t.status === 'Ongoing'
                );

                if (activeTrip && activeTrip.startLocationLat && activeTrip.endLocationLat) {
                    setInternalTripPoints({
                        start: {
                            lat: parseFloat(activeTrip.startLocationLat),
                            lng: parseFloat(activeTrip.startLocationLon),
                            label: activeTrip.startLocation
                        },
                        end: {
                            lat: parseFloat(activeTrip.endLocationLat),
                            lng: parseFloat(activeTrip.endLocationLon),
                            label: activeTrip.endLocation
                        }
                    });
                }
            }

        } catch (err) {
            console.error('Error fetching vehicle data:', err);
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        if (vehicleId && !historyPoints) {
            fetchVehicleData();
            const interval = setInterval(fetchVehicleData, 5000);
            return () => clearInterval(interval);
        } else if (historyPoints && historyPoints.length > 0) {
            // If viewing history, set the map to the last point
            const lastPoint = historyPoints[historyPoints.length - 1];
            setCurrentLocation({
                lat: lastPoint.lat,
                lng: lastPoint.lng,
                speed: 0,
                timestamp: new Date(lastPoint.timestamp)
            });

            // Set history path
            const path = historyPoints.map(pt => [pt.lat, pt.lng] as [number, number]);
            setLocationHistory(path);
        }
    }, [vehicleId, historyPoints]);

    const activeTripPoints = tripPoints || internalTripPoints;

    const vehicleIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    const startIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    const endIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    // Calculate bounds if trip points are present
    const getBounds = (): L.LatLngBoundsExpression | undefined => {
        if (!activeTripPoints) return undefined;

        const points: [number, number][] = [
            [activeTripPoints.start.lat, activeTripPoints.start.lng],
            [activeTripPoints.end.lat, activeTripPoints.end.lng],
            [currentLocation.lat, currentLocation.lng]
        ];

        return points;
    };

    const handleSaveTrip = () => {
        if (!onSaveTrip) return;

        // Calculate total distance from locationHistory
        let totalDistance = 0;
        for (let i = 0; i < locationHistory.length - 1; i++) {
            const p1 = L.latLng(locationHistory[i][0], locationHistory[i][1]);
            const p2 = L.latLng(locationHistory[i + 1][0], locationHistory[i + 1][1]);
            totalDistance += p1.distanceTo(p2);
        }

        // Convert meters to km
        const distanceKm = totalDistance / 1000;

        onSaveTrip({
            startLocation: 'Current Location',
            endLocation: 'Current Location',
            startTime: new Date(),
            distance: distanceKm
        });
    };

    return (
        <div className="space-y-4">
            {/* Status Indicator */}
            <div className={`border rounded-lg p-3 flex items-center justify-between ${isConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2">
                    <Radio className={`h-5 w-5 ${isConnected ? 'text-green-600 animate-pulse' : 'text-red-600'}`} />
                    <div>
                        <p className={`text-sm font-medium ${isConnected ? 'text-green-800' : 'text-red-800'}`}>
                            {isConnected ? 'Live Connection Active' : 'Connecting to Vehicle...'}
                        </p>
                        <p className="text-xs text-gray-600">
                            Viewing real-time location for {vehicleName}
                        </p>
                    </div>
                </div>
                {onSaveTrip && (
                    <button
                        onClick={handleSaveTrip}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium shadow-sm"
                    >
                        <PlayCircle className="h-4 w-4" />
                        <span>Log as Trip</span>
                    </button>
                )}
            </div>

            {/* Vehicle Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                            <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Current Location</p>
                            <p className="font-semibold text-gray-900">
                                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <Gauge className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Current Speed</p>
                            <p className="font-semibold text-gray-900">{currentLocation.speed} km/h</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500 rounded-lg">
                            <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Last Update</p>
                            <p className="font-semibold text-gray-900">
                                {currentLocation.timestamp.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Trip Info */}
            {activeTripPoints && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                        <Navigation className="h-5 w-5" />
                        Active Trip Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1">
                                <div className="h-3 w-3 rounded-full bg-green-500 ring-4 ring-green-100"></div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Start Location</p>
                                <p className="font-medium text-gray-900">{activeTripPoints.start.label}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1">
                                <div className="h-3 w-3 rounded-full bg-blue-500 ring-4 ring-blue-100"></div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</p>
                                <p className="font-medium text-gray-900">{activeTripPoints.end.label}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Map */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Navigation className="h-5 w-5" />
                            <h3 className="font-semibold">Live Map View</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full animate-pulse ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            <span className="text-sm">{isConnected ? 'Online' : 'Offline'}</span>
                        </div>
                    </div>
                </div>

                <div style={{ height: '500px', width: '100%' }}>
                    <MapContainer
                        center={[currentLocation.lat, currentLocation.lng]}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <MapController
                            center={[currentLocation.lat, currentLocation.lng]}
                            bounds={getBounds()}
                        />

                        {/* Start Point Marker */}
                        {activeTripPoints && (
                            <Marker position={[activeTripPoints.start.lat, activeTripPoints.start.lng]} icon={startIcon}>
                                <Popup>
                                    <div className="text-center">
                                        <p className="font-semibold text-green-600">Start Point</p>
                                        <p className="text-sm text-gray-600">{activeTripPoints.start.label}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {/* End Point Marker */}
                        {activeTripPoints && (
                            <Marker position={[activeTripPoints.end.lat, activeTripPoints.end.lng]} icon={endIcon}>
                                <Popup>
                                    <div className="text-center">
                                        <p className="font-semibold text-blue-600">Destination</p>
                                        <p className="text-sm text-gray-600">{activeTripPoints.end.label}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {/* Vehicle Marker */}
                        <Marker position={[currentLocation.lat, currentLocation.lng]} icon={vehicleIcon}>
                            <Popup>
                                <div className="text-center">
                                    <p className="font-semibold">{vehicleName}</p>
                                    <p className="text-sm text-gray-600">Speed: {currentLocation.speed} km/h</p>
                                    <p className="text-xs text-gray-500">
                                        {currentLocation.timestamp.toLocaleTimeString()}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Route History (Traveled Path) */}
                        {locationHistory.length > 1 && (
                            <Polyline
                                positions={locationHistory}
                                color="#94a3b8" // Gray for history
                                weight={4}
                                opacity={0.5}
                            >
                                <Popup>Travelled Path</Popup>
                            </Polyline>
                        )}

                        {/* Remaining Route (Blue Line that shrinks) */}
                        {remainingRouteCoordinates.length > 1 && (
                            <Polyline
                                positions={remainingRouteCoordinates}
                                color="#2563eb" // Blue for remaining
                                weight={6}
                                opacity={0.9}
                            >
                                <Popup>Remaining Route</Popup>
                            </Polyline>
                        )}
                    </MapContainer>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                    <Radio className="h-4 w-4" />
                    Waiting for driver to share location...
                </p>
            </div>
        </div>
    );
}
