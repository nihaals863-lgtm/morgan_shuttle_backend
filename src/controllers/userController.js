const prisma = require('../utils/prisma');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

// @desc    Get all users (Admin Only)
// @route   GET /api/users
const getUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const users = await prisma.user.findMany({
    where: role ? { role } : {},
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      password_set: true,
      invitation_sent: true,
      source: true,
      createdAt: true
    }
  });
  res.json({ success: true, users });
});

// @desc    Update user profile
// @route   PATCH /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  const data = { name, email };
  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data
  });

  res.json({ success: true, user });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id } });
  res.json({ success: true, message: 'User deleted.' });
});

// DESTINATIONS
// @desc    Get all destinations
// @route   GET /api/destinations
const getDestinations = asyncHandler(async (req, res) => {
  const destinations = await prisma.destination.findMany({
    orderBy: { name: 'asc' }
  });
  res.json({ success: true, destinations: destinations.map(d => d.name) });
});

// @desc    Add destination
// @route   POST /api/destinations
const addDestination = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const destination = await prisma.destination.create({ data: { name } });
  res.json({ success: true, destination });
});

// @desc    Delete destination
// @route   DELETE /api/destinations
const deleteDestination = asyncHandler(async (req, res) => {
  const { name } = req.body;
  await prisma.destination.delete({ where: { name } });
  res.json({ success: true, message: 'Destination removed.' });
});

module.exports = { getUsers, updateUser, deleteUser, getDestinations, addDestination, deleteDestination };
