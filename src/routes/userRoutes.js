const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  updateUser, 
  deleteUser, 
  getDestinations, 
  addDestination, 
  deleteDestination,
  getNotifications,
  markNotificationRead
} = require('../controllers/userController');

// Destinations (Move specific routes BEFORE generic ones!)
router.get('/places', getDestinations);
router.post('/places', addDestination);
router.delete('/places', deleteDestination);

// Notifications
router.get('/:id/notifications', getNotifications);
router.patch('/notifications/:id', markNotificationRead);

// User Management
router.get('/', getUsers);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

