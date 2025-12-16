import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import VehicleTracker from './VehicleTracker';
import { MapPin, Car, Clock, X } from 'lucide-react';

interface Vehicle {
    _id: string;
    registrationNumber: string;
    make?: string;
    model?: string;
    type: string;
    currentDriver?: {
        _id: string;
        licenseNumber: string;
        userId: {
            _id: string;
            name: string;
            email?: string;
        };
    };
    currentLocation?: {
        coordinates: [number, number];
        timestamp: Date;
        speed?: number;
    };
}

export default function LiveTracking() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [activeTrip, setActiveTrip] = useState<any>(null);
    const [debugTrips, setDebugTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVehicles();
        // Refresh vehicle list every 30 seconds
        const interval = setInterval(fetchVehicles, 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch active trip when vehicle is selected
    useEffect(() => {
        if (selectedVehicle) {
            fetchActiveTrip(selectedVehicle._id);
        }
    }, [selectedVehicle]);

    const fetchActiveTrip = async (vehicleId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/trips`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('All trips:', response.data);

            // Debug: Store all trips for this vehicle
            const vehicleTrips = response.data.filter((t: any) => {
                const tVehicleId = t.vehicleId?._id || t.vehicleId;
                return String(tVehicleId) === String(vehicleId);
            });

            // Sort by date descending (newest first)
            vehicleTrips.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

            setDebugTrips(vehicleTrips);

            // 1. Try to find an Ongoing trip
            let trip = vehicleTrips.find((t: any) => t.status === 'Ongoing');

            // 2. If no Ongoing trip, fallback to the most recent trip (Completed)
            if (!trip && vehicleTrips.length > 0) {
                trip = vehicleTrips[0];
                console.log('No ongoing trip found, falling back to latest trip:', trip);
            }

            console.log('Selected trip:', trip);
            setActiveTrip(trip || null);
        } catch (error) {
            console.error('Error fetching active trip:', error);
            setActiveTrip(null);
            setDebugTrips([]);
        }
    };

    const fetchVehicles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/vehicles`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVehicles(response.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLastUpdateTime = (vehicle: Vehicle) => {
        if (!vehicle.currentLocation?.timestamp) return 'Never';
        const date = new Date(vehicle.currentLocation.timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
        return `${Math.floor(diffMinutes / 1440)}d ago`;
    };

    const isLocationRecent = (vehicle: Vehicle) => {
        if (!vehicle.currentLocation?.timestamp) return false;
        const date = new Date(vehicle.currentLocation.timestamp);
        const now = new Date();
        const diffMinutes = (now.getTime() - date.getTime()) / 60000;
        return diffMinutes < 5; // Consider recent if updated within 5 minutes
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading vehicles...</p>
                </div>
            </div>
        );
    }

    if (selectedVehicle) {
        // Prepare trip points if active trip exists
        const tripPoints = activeTrip ? {
            start: {
                lat: parseFloat(activeTrip.startLocationLat) || 0,
                lng: parseFloat(activeTrip.startLocationLon) || 0,
                label: activeTrip.startLocation || 'Start'
            },
            end: {
                lat: parseFloat(activeTrip.endLocationLat) || 0,
                lng: parseFloat(activeTrip.endLocationLon) || 0,
                label: activeTrip.endLocation || 'Destination'
            }
        } : undefined;

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => {
                            setSelectedVehicle(null);
                            setActiveTrip(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                        <X className="h-4 w-4" />
                        Back to Vehicles
                    </button>

                    {activeTrip && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${activeTrip.status === 'Ongoing'
                                ? 'bg-green-100 text-green-800 animate-pulse'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {activeTrip.status === 'Ongoing' ? '● Live Trip' : '● Last Trip (Completed)'}
                        </span>
                    )}
                </div>

                <VehicleTracker
                    vehicleId={selectedVehicle._id}
                    vehicleName={`${selectedVehicle.registrationNumber} - ${selectedVehicle.make || ''} ${selectedVehicle.model || ''}`}
                    driverName={selectedVehicle.currentDriver?.userId?.name}
                    tripPoints={tripPoints}
                />

                {/* Debug Info */}
                <div className="mt-8 p-4 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-60 border border-gray-300">
                    <p className="font-bold mb-2">Debug Info (For Developer):</p>
                    <p>Selected Vehicle ID: {selectedVehicle._id}</p>
                    <p>Active Trip Found: {activeTrip ? 'Yes' : 'No'}</p>
                    <p>Total Trips for Vehicle: {debugTrips.length}</p>

                    {debugTrips.length > 0 && (
                        <div className="mt-2">
                            <p className="font-semibold">Vehicle Trips Summary:</p>
                            <ul className="list-disc pl-4">
                                {debugTrips.map((t, i) => (
                                    <li key={i}>
                                        ID: {t._id} | Status: {t.status} | Start: {t.startLocation}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600">Full Debug Data</summary>
                        <pre>{JSON.stringify(debugTrips, null, 2)}</pre>
                    </details>
                </div>
            </div>
        );
    }

    const vehiclesWithDrivers = vehicles.filter(v => v.currentDriver);
    const activeVehicles = vehiclesWithDrivers.filter(isLocationRecent);
    const inactiveVehicles = vehiclesWithDrivers.filter(v => !isLocationRecent(v));

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Live Vehicle Tracking</h2>
                <p className="text-gray-600">
                    Select a vehicle to view its real-time location on the map
                </p>
            </div>

            {/* Active Vehicles */}
            {activeVehicles.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            Active Now ({activeVehicles.length})
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeVehicles.map((vehicle) => (
                            <VehicleCard
                                key={vehicle._id}
                                vehicle={vehicle}
                                isActive={true}
                                onClick={() => setSelectedVehicle(vehicle)}
                                lastUpdate={getLastUpdateTime(vehicle)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Inactive Vehicles */}
            {inactiveVehicles.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            Inactive ({inactiveVehicles.length})
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inactiveVehicles.map((vehicle) => (
                            <VehicleCard
                                key={vehicle._id}
                                vehicle={vehicle}
                                isActive={false}
                                onClick={() => setSelectedVehicle(vehicle)}
                                lastUpdate={getLastUpdateTime(vehicle)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {vehiclesWithDrivers.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        No Vehicles with Assigned Drivers
                    </h3>
                    <p className="text-gray-600">
                        Assign drivers to your vehicles to enable live tracking
                    </p>
                </div>
            )}
        </div>
    );
}

interface VehicleCardProps {
    vehicle: Vehicle;
    isActive: boolean;
    onClick: () => void;
    lastUpdate: string;
}

function VehicleCard({ vehicle, isActive, onClick, lastUpdate }: VehicleCardProps) {
    return (
        <button
            onClick={onClick}
            className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${isActive
                ? 'border-green-200 bg-green-50 hover:bg-green-100'
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
                        <Car className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{vehicle.registrationNumber}</p>
                        <p className="text-sm text-gray-600">
                            {vehicle.make} {vehicle.model}
                        </p>
                    </div>
                </div>
                {isActive && (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        LIVE
                    </span>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Driver:</span>
                    <span>{vehicle.currentDriver?.userId?.name || 'Unassigned'}</span>
                </div>

                {vehicle.currentLocation && (
                    <>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Clock className="h-4 w-4" />
                            <span>Last update: {lastUpdate}</span>
                        </div>
                        {vehicle.currentLocation.speed !== undefined && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <span className="font-medium">Speed:</span>
                                <span>{vehicle.currentLocation.speed} km/h</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm font-medium text-blue-600">Click to view on map →</p>
            </div>
        </button>
    );
}
