const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser, getDestinations, addDestination, deleteDestination } = require('../controllers/userController');

// User Management
router.get('/', getUsers);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

// Destinations
router.get('/places', getDestinations);
router.post('/places', addDestination);
router.delete('/places', deleteDestination);

module.exports = router;
