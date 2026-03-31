const express = require('express');
const router = express.Router();
const { getTrips, createTrip, createRequest, getRequests, updateTrip, deleteTrip, approveRequest, deleteRequest, rejectRequest, updateLocation, startTrip } = require('../controllers/tripController');

// Standard Routes
router.get('/', getTrips);
router.post('/', createTrip);
router.patch('/:id', updateTrip);
router.patch('/:id/start', startTrip);           // Driver starts trip → in_progress
router.patch('/:id/location', updateLocation);   // Driver sends GPS ping
router.delete('/:id', deleteTrip);

// Requests Routes
router.post('/request', createRequest);
router.get('/requests', getRequests);
router.post('/requests/:id/approve', approveRequest);
router.post('/requests/:id/reject', rejectRequest);
router.delete('/requests/:id', deleteRequest);

module.exports = router;
