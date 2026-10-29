import mongoose from 'mongoose';
import Plot from '../models/Plot.js';
import AuditLog from '../models/AuditLog.js';
import { Parser } from 'json2csv';
import { calculateExtraCharges, initialPlots } from '../data/plotsData.js';

function filterFallbackPlots({ status, facing, minArea, maxArea, search, page, limit, all }) {
  let filtered = [...initialPlots];
  if (status) filtered = filtered.filter(p => p.status === status);
  if (facing) filtered = filtered.filter(p => p.facing.toLowerCase().includes(facing.toLowerCase()));
  if (minArea) filtered = filtered.filter(p => p.areaSqYds >= Number(minArea));
  if (maxArea) filtered = filtered.filter(p => p.areaSqYds <= Number(maxArea));
  if (search) {
    const searchNum = Number(search);
    if (!isNaN(searchNum)) {
      filtered = filtered.filter(p => p.plotNumber === searchNum);
    } else {
      const s = search.toLowerCase();
      filtered = filtered.filter(p =>
        (p.customerName && p.customerName.toLowerCase().includes(s)) ||
        (p.customerPhone && p.customerPhone.includes(s)) ||
        (p.facing && p.facing.toLowerCase().includes(s))
      );
    }
  }

  if (all === 'true') {
    return {
      success: true,
      count: filtered.length,
      plots: filtered
    };
  }

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const skip = (pageNum - 1) * limitNum;

  return {
    success: true,
    total: filtered.length,
    page: pageNum,
    totalPages: Math.ceil(filtered.length / limitNum),
    plots: filtered.slice(skip, skip + limitNum)
  };
}

function getFallbackStats() {
  const total = initialPlots.length;
  const available = initialPlots.filter(p => p.status === 'available').length;
  const booked = initialPlots.filter(p => p.status === 'booked').length;
  const sold = initialPlots.filter(p => p.status === 'sold').length;

  return {
    success: true,
    stats: {
      total,
      available,
      booked,
      sold
    }
  };
}

export async function getPlots(req, res) {
  try {
    const { status, facing, minArea, maxArea, search, page, limit, all } = req.query;

    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return res.json(filterFallbackPlots(req.query));
    }

    const totalInDb = await Plot.countDocuments();
    if (totalInDb === 0) {
      console.log('[Plot Controller] MongoDB plots collection empty, auto-seeding all 96 layout plots...');
      for (const p of initialPlots) {
        await Plot.findOneAndUpdate(
          { plotNumber: p.plotNumber },
          { ...p, updatedBy: 'system-seed' },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    const query = {};

    if (status) query.status = status;
    if (facing) query.facing = facing;
    if (minArea || maxArea) {
      query.areaSqYds = {};
      if (minArea) query.areaSqYds.$gte = Number(minArea);
      if (maxArea) query.areaSqYds.$lte = Number(maxArea);
    }
    if (search) {
      const searchNum = Number(search);
      if (!isNaN(searchNum)) {
        query.plotNumber = searchNum;
      } else {
        query.$or = [
          { customerName: new RegExp(search, 'i') },
          { customerPhone: new RegExp(search, 'i') },
          { facing: new RegExp(search, 'i') }
        ];
      }
    }

    // If client asks for all (e.g. 2D/3D visualizer), return full array without pagination
    if (all === 'true') {
      const plots = await Plot.find(query).sort({ plotNumber: 1 });
      return res.json({
        success: true,
        count: plots.length,
        plots
      });
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [plots, total] = await Promise.all([
      Plot.find(query).sort({ plotNumber: 1 }).skip(skip).limit(limitNum),
      Plot.countDocuments(query)
    ]);

    return res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      plots
    });
  } catch (err) {
    console.warn('MongoDB query failed in getPlots, using fallback master plan:', err.message);
    return res.json(filterFallbackPlots(req.query));
  }
}

export async function getPlotDetail(req, res) {
  try {
    const { plotNumber } = req.params;

    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      const plot = initialPlots.find(p => p.plotNumber === Number(plotNumber));
      if (!plot) {
        return res.status(404).json({
          success: false,
          error: `Plot #${plotNumber} not found.`
        });
      }
      return res.json({ success: true, plot });
    }

    const plot = await Plot.findOne({ plotNumber: Number(plotNumber) });

    if (!plot) {
      const fallbackPlot = initialPlots.find(p => p.plotNumber === Number(plotNumber));
      if (fallbackPlot) {
        return res.json({ success: true, plot: fallbackPlot });
      }
      return res.status(404).json({
        success: false,
        error: `Plot #${plotNumber} not found.`
      });
    }

    return res.json({
      success: true,
      plot
    });
  } catch (err) {
    console.warn(`MongoDB query failed in getPlotDetail for #${req.params.plotNumber}:`, err.message);
    const plot = initialPlots.find(p => p.plotNumber === Number(req.params.plotNumber));
    if (plot) {
      return res.json({ success: true, plot });
    }
    return res.status(404).json({ success: false, error: `Plot #${req.params.plotNumber} not found.` });
  }
}

export async function getPlotStats(req, res) {
  try {
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return res.json(getFallbackStats());
    }

    const [total, available, booked, sold] = await Promise.all([
      Plot.countDocuments(),
      Plot.countDocuments({ status: 'available' }),
      Plot.countDocuments({ status: 'booked' }),
      Plot.countDocuments({ status: 'sold' })
    ]);

    return res.json({
      success: true,
      stats: {
        total,
        available,
        booked,
        sold
      }
    });
  } catch (err) {
    console.warn('MongoDB query failed in getPlotStats, using baseline stats:', err.message);
    return res.json(getFallbackStats());
  }
}

export async function createPlot(req, res) {
  try {
    const data = req.body;
    const existing = await Plot.findOne({ plotNumber: data.plotNumber });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Plot #${data.plotNumber} already exists.`
      });
    }

    const extra = calculateExtraCharges(data.facing, data.isCorner, data.roadWidth);
    data.extraChargesPerSqYd = extra.totalPerSqYd;
    data.extraChargesBreakdown = extra.breakdown;
    data.areaSqFt = data.areaSqYds * 9;
    data.totalPrice = data.areaSqYds * ((data.basePricePerSqYd || 12500) + data.extraChargesPerSqYd);
    data.updatedBy = req.user.username;

    const newPlot = await Plot.create(data);

    await AuditLog.create({
      adminUserId: req.user._id,
      adminEmail: req.user.email,
      action: 'PLOT_CREATED',
      resource: 'Plot',
      resourceId: newPlot._id.toString(),
      changes: newPlot,
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: `Plot #${newPlot.plotNumber} created successfully.`,
      plot: newPlot
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updatePlot(req, res) {
  try {
    const { plotNumber } = req.params;
    const plot = await Plot.findOne({ plotNumber: Number(plotNumber) });

    if (!plot) {
      return res.status(404).json({ success: false, error: `Plot #${plotNumber} not found.` });
    }

    const before = plot.toObject();
    Object.assign(plot, req.body);

    if (req.body.facing || req.body.isCorner !== undefined || req.body.roadWidth) {
      const extra = calculateExtraCharges(plot.facing, plot.isCorner, plot.roadWidth);
      plot.extraChargesPerSqYd = extra.totalPerSqYd;
      plot.extraChargesBreakdown = extra.breakdown;
    }

    if (plot.areaSqYds) {
      plot.areaSqFt = plot.areaSqYds * 9;
      plot.totalPrice = plot.areaSqYds * ((plot.basePricePerSqYd || 12500) + (plot.extraChargesPerSqYd || 0));
    }

    plot.updatedBy = req.user.username;
    await plot.save();

    await AuditLog.create({
      adminUserId: req.user._id,
      adminEmail: req.user.email,
      action: 'PLOT_UPDATED',
      resource: 'Plot',
      resourceId: plot._id.toString(),
      changes: { before, after: plot },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: `Plot #${plot.plotNumber} updated successfully.`,
      plot
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updatePlotStatus(req, res) {
  try {
    const { plotNumber } = req.params;
    const { status } = req.body;

    const valid = ['available', 'booked', 'sold'];
    if (!valid.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${valid.join(', ')}`
      });
    }

    const plot = await Plot.findOne({ plotNumber: Number(plotNumber) });
    if (!plot) {
      return res.status(404).json({ success: false, error: `Plot #${plotNumber} not found.` });
    }

    const oldStatus = plot.status;
    plot.status = status;
    // If status is reverted to available, clean customer booking info
    if (status === 'available') {
      plot.customerName = '';
      plot.customerPhone = '';
      plot.customerEmail = '';
      plot.bookingAmount = 0;
      plot.bookingDate = '';
      plot.paymentStatus = 'unpaid';
    }
    plot.updatedBy = req.user.username;
    await plot.save();

    await AuditLog.create({
      adminUserId: req.user._id,
      adminEmail: req.user.email,
      action: 'PLOT_STATUS_CHANGED',
      resource: 'Plot',
      resourceId: plot._id.toString(),
      changes: { plotNumber: plot.plotNumber, from: oldStatus, to: status },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: `Plot #${plot.plotNumber} status updated to ${status}.`,
      plot
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function bookPlot(req, res) {
  try {
    const { plotNumber } = req.params;
    const {
      customerName,
      customerPhone,
      customerEmail,
      bookingAmount,
      bookingDate,
      paymentStatus,
      notes
    } = req.body;

    if (!customerName || !customerPhone) {
      return res.status(400).json({
        success: false,
        error: 'Customer Name and Phone Number are required to book a plot.'
      });
    }

    const plot = await Plot.findOne({ plotNumber: Number(plotNumber) });
    if (!plot) {
      return res.status(404).json({ success: false, error: `Plot #${plotNumber} not found.` });
    }

    const before = plot.toObject();
    plot.status = 'booked';
    plot.customerName = customerName.trim();
    plot.customerPhone = customerPhone.trim();
    plot.customerEmail = customerEmail ? customerEmail.trim() : '';
    plot.bookingAmount = (bookingAmount !== undefined && bookingAmount !== '') ? Number(bookingAmount) : 0;
    plot.bookingDate = bookingDate || new Date().toISOString().split('T')[0];
    if (paymentStatus) plot.paymentStatus = paymentStatus;
    if (notes !== undefined) plot.notes = notes;
    plot.updatedBy = req.user?.username || 'admin';

    await plot.save();

    await AuditLog.create({
      adminUserId: req.user?._id,
      adminEmail: req.user?.email || 'admin@skandhagroup.com',
      action: 'PLOT_BOOKED_FOR_CUSTOMER',
      resource: 'Plot',
      resourceId: plot._id.toString(),
      changes: {
        plotNumber: plot.plotNumber,
        customerName: plot.customerName,
        customerPhone: plot.customerPhone,
        customerEmail: plot.customerEmail,
        bookingAmount: plot.bookingAmount,
        bookingDate: plot.bookingDate,
        paymentStatus: plot.paymentStatus
      },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: `Plot #${plot.plotNumber} successfully booked for ${plot.customerName}.`,
      plot
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function deletePlot(req, res) {
  try {
    const { plotNumber } = req.params;
    const plot = await Plot.findOneAndDelete({ plotNumber: Number(plotNumber) });

    if (!plot) {
      return res.status(404).json({ success: false, error: `Plot #${plotNumber} not found.` });
    }

    await AuditLog.create({
      adminUserId: req.user._id,
      adminEmail: req.user.email,
      action: 'PLOT_DELETED',
      resource: 'Plot',
      resourceId: plot._id.toString(),
      changes: { plotNumber: plot.plotNumber },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: `Plot #${plotNumber} deleted successfully.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function exportPlotsCsv(req, res) {
  try {
    const plots = await Plot.find().sort({ plotNumber: 1 });
    const fields = ['plotNumber', 'block', 'areaSqYds', 'areaSqFt', 'dimensions', 'facing', 'isCorner', 'roadWidth', 'status', 'basePricePerSqYd', 'extraChargesPerSqYd', 'totalPrice', 'notes'];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(plots);

    res.header('Content-Type', 'text/csv');
    res.attachment('skandha_plots_inventory.csv');
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function importPlotsCsv(req, res) {
  try {
    const { plotsData } = req.body;
    if (!Array.isArray(plotsData) || plotsData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or empty plotsData array.'
      });
    }

    let inserted = 0;
    let updated = 0;
    const errors = [];

    for (const item of plotsData) {
      const num = Number(item.plotNumber);
      if (!num || isNaN(num)) {
        errors.push(`Invalid plot number: ${item.plotNumber}`);
        continue;
      }

      const existing = await Plot.findOne({ plotNumber: num });
      if (existing) {
        Object.assign(existing, item);
        existing.updatedBy = req.user.username;
        await existing.save();
        updated++;
      } else {
        const extra = calculateExtraCharges(item.facing || 'East', item.isCorner || false, item.roadWidth || '33ft');
        item.extraChargesPerSqYd = extra.totalPerSqYd;
        item.extraChargesBreakdown = extra.breakdown;
        item.updatedBy = req.user.username;
        await Plot.create(item);
        inserted++;
      }
    }

    await AuditLog.create({
      adminUserId: req.user._id,
      adminEmail: req.user.email,
      action: 'PLOTS_CSV_IMPORTED',
      resource: 'Plot',
      changes: { inserted, updated, errorsCount: errors.length },
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: `CSV import completed: ${inserted} inserted, ${updated} updated.`,
      inserted,
      updated,
      errors
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
