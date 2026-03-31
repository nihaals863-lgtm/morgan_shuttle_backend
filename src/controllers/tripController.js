const prisma = require('../utils/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Get all trips by date
// @route   GET /api/trips
const getTrips = asyncHandler(async (req, res) => {
  const { date } = req.query; // YYYY-MM-DD
  const trips = await prisma.trip.findMany({
    where: date ? { date } : {},
    orderBy: { time: 'asc' }
  });
  res.json({ success: true, trips });
});

// @desc    Create new trip (Admin Only)
// @route   POST /api/trips
const createTrip = asyncHandler(async (req, res) => {
  const { time, date, origin, destination, seats_total, is_special, tenant_name } = req.body;

  const trip = await prisma.trip.create({
    data: {
      time,
      date,
      origin,
      destination,
      seats_total,
      seats_remaining: seats_total,
      is_special: is_special || false,
      tenant_name: tenant_name || null
    }
  });

  res.status(201).json({ success: true, trip });
});

// @desc    Manage special requests
// @route   POST /api/trips/request
const createRequest = asyncHandler(async (req, res) => {
  const { tenant_name, date, time, origin, destination, passengers, source, notes } = req.body;

  const request = await prisma.tripRequest.create({
    data: {
      tenant_name,
      date,
      time,
      origin,
      destination,
      passengers,
      source: source || 'tenant',
      notes: notes || ''
    }
  });

  res.status(201).json({ success: true, request });
});

// @desc    Get all trip requests (Admin Only)
// @route   GET /api/trips/requests
const getRequests = asyncHandler(async (req, res) => {
  const requests = await prisma.tripRequest.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, requests });
});

// @desc    Update trip status (Driver/Admin)
// @route   PATCH /api/trips/:id
const updateTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, actual_passengers, notes } = req.body;

  const trip = await prisma.trip.update({
    where: { id },
    data: {
      status,
      actual_passengers: actual_passengers || undefined,
      notes: notes || undefined
    }
  });

  res.json({ success: true, trip });
});

// @desc    Delete trip (Admin Only)
// @route   DELETE /api/trips/:id
const deleteTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.trip.delete({ where: { id } });
  res.json({ success: true, message: 'Trip deleted.' });
});

// @desc    Approve trip request (Admin Only)
// @route   POST /api/trips/requests/:id/approve
const approveRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Find the request
  const request = await prisma.tripRequest.findUnique({ where: { id } });
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  // 2. Update request status
  await prisma.tripRequest.update({
    where: { id },
    data: { status: 'approved' }
  });

  // 3. Create a NEW trip based on this request
  const trip = await prisma.trip.create({
    data: {
      time: request.time,
      date: request.date,
      origin: request.origin,
      destination: request.destination,
      seats_total: request.passengers,
      seats_remaining: 0, // It's a special run for this person
      status: 'scheduled',
      is_special: true,
      tenant_name: request.tenant_name
    }
  });

  res.json({ success: true, trip });
});

// @desc    Delete trip request
// @route   DELETE /api/trips/requests/:id
const deleteRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.tripRequest.delete({ where: { id } });
  res.json({ success: true, message: 'Request deleted.' });
});

// @desc    Reject trip request (Admin Only)
// @route   POST /api/trips/requests/:id/reject
const rejectRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const request = await prisma.tripRequest.update({
    where: { id },
    data: { status: 'rejected' }
  });
  res.json({ success: true, request });
});

// @desc    Update live GPS location of a trip (Driver only)
// @route   PATCH /api/trips/:id/location
const updateLocation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.body;

  if (lat === undefined || lng === undefined) {
    res.status(400);
    throw new Error('lat and lng are required');
  }

  const trip = await prisma.trip.update({
    where: { id },
    data: { lat: parseFloat(lat), lng: parseFloat(lng) }
  });

  res.json({ success: true, trip });
});

// @desc    Start a trip (Driver) — sets status to in_progress
// @route   PATCH /api/trips/:id/start
const startTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const trip = await prisma.trip.update({
    where: { id },
    data: { status: 'in_progress', lat: null, lng: null }
  });

  res.json({ success: true, trip });
});

module.exports = { getTrips, createTrip, createRequest, getRequests, updateTrip, deleteTrip, approveRequest, deleteRequest, rejectRequest, updateLocation, startTrip };
