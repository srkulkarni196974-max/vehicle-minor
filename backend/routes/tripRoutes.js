const express = require('express');
const router = express.Router();
const { startTrip, endTrip, getTrips, createTrip, updateTrip, deleteTrip } = require('../controllers/tripController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth(['driver', 'fleet_owner', 'admin']), createTrip);
router.put('/:id', auth(['driver', 'fleet_owner', 'admin']), updateTrip);
router.delete('/:id', auth(['driver', 'fleet_owner', 'admin']), deleteTrip);

router.post('/start', auth(['driver']), startTrip);
router.post('/end', auth(['driver']), endTrip);
router.get('/', auth(['driver', 'fleet_owner', 'admin']), getTrips);

module.exports = router;
