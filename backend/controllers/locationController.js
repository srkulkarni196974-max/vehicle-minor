const LiveLocation = require('../models/LiveLocation');
const RouteHistory = require('../models/RouteHistory');
const Trip = require('../models/Trip');

// Update live location
exports.updateLocation = async (req, res) => {
    try {
        const { vehicleId, lat, lng, tripId } = req.body;

        // 1. Update LiveLocation
        await LiveLocation.findOneAndUpdate(
            { vehicleId },
            {
                vehicleId,
                driverId: req.user.id, // Assuming driver is logged in
                lat,
                lng,
                timestamp: Date.now()
            },
            { upsert: true, new: true }
        );

        // 2. Add to RouteHistory if trip is active
        if (tripId) {
            let history = await RouteHistory.findOne({ tripId });
            if (!history) {
                history = new RouteHistory({ tripId, vehicleId, locations: [] });
            }
            history.locations.push({ lat, lng });
            await history.save();
        }

        res.json({ message: 'Location updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get live location
exports.getLiveLocation = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const location = await LiveLocation.findOne({ vehicleId }).populate('vehicleId', 'registrationNumber');
        if (!location) return res.status(404).json({ message: 'Location not found' });
        res.json(location);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get route history by Trip ID
exports.getRouteHistory = async (req, res) => {
    try {
        const { tripId } = req.params;
        const history = await RouteHistory.findOne({ tripId });
        if (!history) return res.status(404).json({ message: 'History not found' });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get route history by Vehicle and Time Range
exports.getVehicleRouteHistory = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { start, end } = req.query;

        const startDate = start ? new Date(start) : new Date(0);
        const endDate = end ? new Date(end) : new Date();

        // Find all history documents for this vehicle that might contain relevant points
        // We check if the document was updated after the start time
        const histories = await RouteHistory.find({
            vehicleId,
            updatedAt: { $gte: startDate }
        }).sort({ createdAt: 1 });

        let allPoints = [];

        histories.forEach(h => {
            if (h.locations) {
                const validPoints = h.locations.filter(pt => {
                    const ptTime = new Date(pt.timestamp);
                    return ptTime >= startDate && ptTime <= endDate;
                });

                validPoints.forEach(pt => {
                    allPoints.push({
                        lat: pt.lat,
                        lng: pt.lng,
                        timestamp: pt.timestamp
                    });
                });
            }
        });

        // Sort by timestamp
        allPoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        res.json(allPoints);
    } catch (error) {
        console.error('Error fetching vehicle history:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
