const express = require('express');
const router = express.Router();
const { login, setupPassword, internalCreate, sendInvitation, forgotPassword } = require('../controllers/authController');

// All endpoints in this file are prefixed with /api/auth
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/setup-password', setupPassword);
router.post('/internal-create', internalCreate);
router.post('/send-invitation', sendInvitation);

module.exports = router;
