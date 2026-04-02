const prisma = require('../utils/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Reserve a seat on a trip
// @route   POST /api/bookings
const createBooking = asyncHandler(async (req, res) => {
  const { trip_id, user_id, seats } = req.body;

  // Find trip first
  const trip = await prisma.trip.findUnique({
    where: { id: trip_id }
  });

  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }

  // Check if user already has a confirmed booking for this trip
  const existingBooking = await prisma.booking.findFirst({
    where: {
      trip_id,
      user_id,
      status: 'confirmed'
    }
  });

  if (existingBooking) {
    res.status(400);
    throw new Error('You already have a confirmed booking for this trip.');
  }

  if (trip.seats_remaining < seats) {
    res.status(400);
    throw new Error('Not enough seats remaining');
  }


  // Create booking and decrease seats remaining in a transaction
  const [booking, updatedTrip] = await prisma.$transaction([
    prisma.booking.create({
      data: {
        trip_id,
        user_id,
        time: trip.time,
        date: trip.date,
        origin: trip.origin,
        destination: trip.destination,
        seats,
        status: 'confirmed'
      }
    }),
    prisma.trip.update({
      where: { id: trip_id },
      data: {
        seats_remaining: {
          decrement: seats
        }
      }
    })
  ]);

  res.status(201).json({ success: true, booking, updatedTrip });
});

// @desc    Get user's confirmed bookings
// @route   GET /api/bookings/:userId
const getUserBookings = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const bookings = await prisma.booking.findMany({
    where: { user_id: userId, status: 'confirmed' },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, bookings });
});

// @desc    Cancel a booking
// @route   DELETE /api/bookings/:id
const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id }
  });

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Soft delete (cancel) and restore seats in a transaction
  const [updatedBooking, updatedTrip] = await prisma.$transaction([
    prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' }
    }),
    prisma.trip.update({
      where: { id: booking.trip_id },
      data: {
        seats_remaining: {
          increment: booking.seats
        }
      }
    })
  ]);

  res.json({ success: true, updatedBooking, updatedTrip });
});

module.exports = { createBooking, getUserBookings, cancelBooking };
