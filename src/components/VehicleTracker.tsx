import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Gauge, Clock, Smartphone, AlertTriangle, Radio, Share2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

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

// Component to auto-center map on vehicle
function MapController({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 15);
    }, [center, map]);
    return null;
}

interface VehicleTrackerProps {
    vehicleId: string;
    vehicleName: string;
    onSaveTrip?: (tripData: { distance: number; startTime: Date; endTime: Date; startLocation: string; endLocation: string }) => void;
}

export default function VehicleTracker({ vehicleId, vehicleName, onSaveTrip }: VehicleTrackerProps) {
    const [currentLocation, setCurrentLocation] = useState<VehicleLocation>({
        lat: 18.5204, // Default: Pune, India
        lng: 73.8567,
        speed: 0,
        timestamp: new Date(),
    });
    const [locationHistory, setLocationHistory] = useState<[number, number][]>([]);
    const [isTracking, setIsTracking] = useState(false);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
    const [error, setError] = useState<string>('');
    const [watchId, setWatchId] = useState<number | null>(null);
    const [totalDistance, setTotalDistance] = useState(0);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const socketRef = useRef<Socket | null>(null);

    // Initialize Socket.io
    useEffect(() => {
        // Dynamically connect to the backend on the same IP as the frontend
        const socketUrl = `http://${window.location.hostname}:5000`;
        console.log('Connecting to socket at:', socketUrl);

        socketRef.current = io(socketUrl);

    }, [vehicleId]);

    // Calculate distance between two points in km (Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    // Real-time GPS tracking using mobile phone's Geolocation API (Driver Mode)
    useEffect(() => {
        if (!isBroadcasting) {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                setWatchId(null);
            }
            return;
        }

        if (!startTime) {
            setStartTime(new Date());
        }

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setPermissionStatus('denied');
            return;
        }

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const newLat = position.coords.latitude;
                const newLng = position.coords.longitude;
                const newSpeed = position.coords.speed
                    ? Math.round(position.coords.speed * 3.6) // Convert m/s to km/h
                    : 0;

                const newLocation = {
                    lat: newLat,
                    lng: newLng,
                    speed: newSpeed,
                    timestamp: new Date(),
                };

                // Update local state
                setCurrentLocation((prev) => {
                    const dist = calculateDistance(prev.lat, prev.lng, newLat, newLng);
                    if (dist > 0.005) {
                        setTotalDistance((d) => d + dist);
                    }
                    return newLocation;
                });

                setPermissionStatus('granted');
                setError('');

                // Broadcast location to server
                if (socketRef.current && vehicleId) {
                    socketRef.current.emit('send_location', {
                        vehicleId,
                        location: newLocation
                    });
                }

                setLocationHistory((history) => {
                    const newHistory: [number, number][] = [...history, [newLat, newLng]];
                    return newHistory.slice(-100);
                });
            },
            (error) => {
                setPermissionStatus('denied');
                setError('Location access denied or unavailable.');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );

        setWatchId(id);

        return () => {
            navigator.geolocation.clearWatch(id);
        };
    }, [isBroadcasting, vehicleId]);

    // Initialize tracking on mount
    useEffect(() => {
        setLocationHistory([[currentLocation.lat, currentLocation.lng]]);
    }, []);

    const handleSaveTrip = () => {
        if (onSaveTrip && startTime) {
            onSaveTrip({
                distance: parseFloat(totalDistance.toFixed(2)),
                startTime: startTime,
                endTime: new Date(),
                startLocation: `${locationHistory[0][0].toFixed(4)}, ${locationHistory[0][1].toFixed(4)}`,
                endLocation: `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
            });
        }
    };

    const customIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    return (
        <div className="space-y-4">
            {/* Permission/Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-red-900">Location Access Required</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Mode Status Indicator */}
            <div className={`border rounded-lg p-3 flex items-center justify-between ${isBroadcasting ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center gap-2">
                    {isBroadcasting ? (
                        <Share2 className="h-5 w-5 text-green-600 animate-pulse" />
                    ) : (
                        <Radio className="h-5 w-5 text-blue-600" />
                    )}
                    <div>
                        <p className={`text-sm font-medium ${isBroadcasting ? 'text-green-800' : 'text-blue-800'}`}>
                            {isBroadcasting ? 'Broadcasting Live Location' : 'Remote Tracking Mode'}
                        </p>
                        <p className="text-xs text-gray-600">
                            {isBroadcasting
                                ? 'You are sharing your location with the admin.'
                                : 'Waiting for driver to share location...'}
                        </p>
                    </div>
                </div>
                {isBroadcasting && (
                    <div className="text-sm font-bold text-green-800">
                        Dist: {totalDistance.toFixed(2)} km
                    </div>
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

            {/* Map */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Navigation className="h-5 w-5" />
                            <h3 className="font-semibold">Live Tracking: {vehicleName}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full animate-pulse ${isBroadcasting ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                            <span className="text-sm">{isBroadcasting ? 'Broadcasting' : 'Live Remote'}</span>
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

                        <MapController center={[currentLocation.lat, currentLocation.lng]} />

                        {/* Vehicle Marker */}
                        <Marker position={[currentLocation.lat, currentLocation.lng]} icon={customIcon}>
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

                        {/* Route History */}
                        {locationHistory.length > 1 && (
                            <Polyline
                                positions={locationHistory}
                                color="#7c3aed"
                                weight={3}
                                opacity={0.7}
                            />
                        )}
                    </MapContainer>
                </div>
            </div>

            {/* Tracking Controls */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${isBroadcasting ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium text-gray-700">
                        {isBroadcasting ? 'Broadcasting Active' : 'Remote Tracking Active'}
                    </span>
                </div>
                <div className="flex gap-3">
                    {totalDistance > 0 && isBroadcasting && (
                        <button
                            onClick={handleSaveTrip}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm flex items-center gap-2"
                        >
                            <Navigation className="h-4 w-4" />
                            Save Trip
                        </button>
                    )}
                    <button
                        onClick={() => setIsBroadcasting(!isBroadcasting)}
                        className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${isBroadcasting
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                    >
                        {isBroadcasting ? (
                            <>Stop Sharing Location</>
                        ) : (
                            <>
                                <Share2 className="h-4 w-4" />
                                Start Sharing Location (Driver)
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>📡 Remote Tracking System:</strong>
                    <ul className="list-disc list-inside mt-1 ml-1">
                        <li><strong>Driver:</strong> Click "Start Sharing Location" on your mobile to broadcast your GPS position.</li>
                        <li><strong>Admin:</strong> Open this page to see the vehicle moving in real-time on the map.</li>
                    </ul>
                </p>
            </div>
        </div>
    );
}
