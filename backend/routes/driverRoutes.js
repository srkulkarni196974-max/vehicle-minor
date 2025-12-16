const express = require('express');
const router = express.Router();
const { addDriver, getDrivers, assignVehicle, getMyVehicle, updateDriver, deleteDriver } = require('../controllers/driverController');
const auth = require('../middleware/authMiddleware');

router.get('/me/vehicle', auth(['driver']), getMyVehicle);
router.post('/', auth(['admin', 'fleet_owner']), addDriver);
router.get('/', auth(['admin', 'fleet_owner']), getDrivers);
router.put('/:id', auth(['admin', 'fleet_owner']), updateDriver);
router.delete('/:id', auth(['admin', 'fleet_owner']), deleteDriver);
router.post('/assign', auth(['admin', 'fleet_owner']), assignVehicle);

module.exports = router;
