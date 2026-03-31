const prisma = require('../utils/prisma');
const asyncHandler = require('express-async-handler');

// @desc    Log fuel activity
// @route   POST /api/logs/fuel
const createFuelLog = asyncHandler(async (req, res) => {
  const { date, vehicle, gallons, amount, odometer } = req.body;
  const log = await prisma.fuelLog.create({
    data: { date, vehicle, gallons: parseFloat(gallons), amount: parseFloat(amount), odometer: parseFloat(odometer) }
  });
  res.status(201).json({ success: true, log });
});

// @desc    Log maintenance activity
// @route   POST /api/logs/maintenance
const createMaintLog = asyncHandler(async (req, res) => {
  const { date, vehicle, description, cost } = req.body;
  const log = await prisma.maintenanceLog.create({
    data: { date, vehicle, description, cost: parseFloat(cost) }
  });
  res.status(201).json({ success: true, log });
});

// @desc    Get all logs for Admin
// @route   GET /api/logs
const getLogs = asyncHandler(async (req, res) => {
  const fuelLogs = await prisma.fuelLog.findMany({ orderBy: { createdAt: 'desc' } });
  const maintLogs = await prisma.maintenanceLog.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, fuelLogs, maintLogs });
});

// @desc    Delete fuel log
// @route   DELETE /api/logs/fuel/:id
const deleteFuelLog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.fuelLog.delete({ where: { id } });
  res.json({ success: true, message: 'Fuel log deleted.' });
});

// @desc    Delete maintenance log
// @route   DELETE /api/logs/maintenance/:id
const deleteMaintLog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.maintenanceLog.delete({ where: { id } });
  res.json({ success: true, message: 'Maintenance log deleted.' });
});

module.exports = { createFuelLog, createMaintLog, getLogs, deleteFuelLog, deleteMaintLog };
