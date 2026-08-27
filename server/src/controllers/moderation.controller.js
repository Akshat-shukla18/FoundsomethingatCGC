const ModerationReport = require('../models/ModerationReport');
const Report = require('../models/Report');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { logEvent } = require('../services/audit.service');

// Public endpoints (for authenticated students)
const submitModerationReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    
    const modReport = await ModerationReport.create({
      reportedBy: req.session.userId,
      targetType,
      targetId,
      reason,
      details
    });

    res.status(201).json({
      success: true,
      data: { message: 'Report submitted successfully for review' }
    });
  } catch (err) {
    next(err);
  }
};

// Admin endpoints
const getPendingReports = async (req, res, next) => {
  try {
    const reports = await ModerationReport.find({ status: 'PENDING' })
      .populate('reportedBy', 'name collegeEmail')
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.status(200).json({ success: true, data: { reports } });
  } catch (err) {
    next(err);
  }
};

const updateItemStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ success: false, error: { message: 'Item not found' } });

    const oldStatus = report.status;
    report.status = status;
    await report.save();

    await logEvent({
      actorId: req.session.userId,
      action: 'UPDATE_REPORT_STATUS',
      targetType: 'REPORT',
      targetId: report._id,
      metadata: { oldStatus, newStatus: status, reason }
    });

    res.status(200).json({ success: true, data: { report } });
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    const oldStatus = user.status;
    user.status = status; // ACTIVE or SUSPENDED
    await user.save();

    await logEvent({
      actorId: req.session.userId,
      action: 'UPDATE_USER_STATUS',
      targetType: 'USER',
      targetId: user._id,
      metadata: { oldStatus, newStatus: status, reason }
    });

    res.status(200).json({ success: true, data: { user: { id: user._id, status: user.status } } });
  } catch (err) {
    next(err);
  }
};

const resolveModerationReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body; // RESOLVED or DISMISSED

    const modReport = await ModerationReport.findById(id);
    if (!modReport) return res.status(404).json({ success: false });

    modReport.status = resolution;
    modReport.reviewedBy = req.session.userId;
    modReport.reviewedAt = new Date();
    await modReport.save();

    await logEvent({
      actorId: req.session.userId,
      action: 'RESOLVE_MOD_REPORT',
      targetType: 'SYSTEM',
      targetId: modReport._id,
      metadata: { resolution }
    });

    res.status(200).json({ success: true, data: { modReport } });
  } catch (err) {
    next(err);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('actorId', 'name collegeEmail');
      
    res.status(200).json({ success: true, data: { logs } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitModerationReport,
  getPendingReports,
  updateItemStatus,
  updateUserStatus,
  resolveModerationReport,
  getAuditLogs
};
