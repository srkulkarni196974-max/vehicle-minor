const express = require('express');
const router = express.Router();
const { addVehicle, getVehicles, getVehicleById, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const auth = require('../middleware/authMiddleware');

// All routes require authentication
// Only Admin and Owner can manage vehicles
router.post('/', auth(['admin', 'fleet_owner']), addVehicle);
router.get('/', auth(['admin', 'fleet_owner', 'driver']), getVehicles); // Drivers might need to see vehicles too?
router.get('/:id', auth(['admin', 'fleet_owner', 'driver']), getVehicleById);
router.put('/:id', auth(['admin', 'fleet_owner']), updateVehicle);
router.delete('/:id', auth(['admin', 'fleet_owner']), deleteVehicle);

module.exports = router;
