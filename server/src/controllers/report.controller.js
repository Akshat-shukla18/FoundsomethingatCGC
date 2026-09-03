const Report = require('../models/Report');
const IdempotencyRecord = require('../models/IdempotencyRecord');

const createReport = async (req, res, next) => {
  try {
    const idempotencyKey = req.headers['idempotency-key'];
    
    // 1. Check for Idempotency if key is provided
    if (idempotencyKey) {
      const existingRecord = await IdempotencyRecord.findOne({ 
        key: idempotencyKey, 
        userId: req.session.userId 
      });
      if (existingRecord) {
        return res.status(existingRecord.responseStatus).json(existingRecord.responseBody);
      }
    }

    // 2. Prepare Data
    const data = { ...req.body };
    data.createdBy = req.session.userId;
    data.normalizedItemName = data.itemName.toLowerCase();
    data.normalizedSearchText = data.description.toLowerCase();

    // 3. Create Report
    let report = await Report.create(data);
    report = await report.populate('createdBy', 'name collegeEmail department rollNumber classSection');

    const responseStatus = 201;
    const responseBody = {
      success: true,
      data: { report }
    };

    // 4. Save Idempotency Record
    if (idempotencyKey) {
      await IdempotencyRecord.create({
        key: idempotencyKey,
        path: req.originalUrl,
        userId: req.session.userId,
        responseStatus,
        responseBody
      });
    }

    res.status(responseStatus).json(responseBody);
  } catch (error) {
    next(error);
  }
};

const getReports = (reportType) => async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const cursor = req.query.cursor;
    
    const query = { reportType, status: 'ACTIVE' };
    
    // Cursor logic: cursor is the ID of the last fetched item
    if (cursor) {
      // Since default sort is createdAt DESC, we want older items
      const lastReport = await Report.findById(cursor);
      if (lastReport) {
        query.createdAt = { $lt: lastReport.createdAt };
      }
    }

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1) // +1 to check if there is more
      .populate('createdBy', 'name collegeEmail department rollNumber classSection');

    let hasMore = false;
    if (reports.length > limit) {
      hasMore = true;
      reports.pop(); // remove the extra item
    }

    const nextCursor = hasMore ? reports[reports.length - 1]._id : null;

    res.status(200).json({
      success: true,
      data: {
        items: reports,
        nextCursor,
        hasMore
      }
    });
  } catch (error) {
    next(error);
  }
};

const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('createdBy', 'name collegeEmail department rollNumber classSection');
      
    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'REPORT_NOT_FOUND', message: 'Report not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: { report }
    });
  } catch (error) {
    next(error);
  }
};

const updateReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'REPORT_NOT_FOUND', message: 'Report not found' }
      });
    }

    // Ownership Check
    if (report.createdBy.toString() !== req.session.userId.toString() && req.session.role !== 'MODERATOR' && req.session.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'REPORT_UNAUTHORIZED', message: 'You are not authorized to update this report' }
      });
    }

    const updates = { ...req.body };
    if (updates.itemName) updates.normalizedItemName = updates.itemName.toLowerCase();
    if (updates.description) updates.normalizedSearchText = updates.description.toLowerCase();

    Object.assign(report, updates);
    await report.save();

    res.status(200).json({
      success: true,
      data: { report }
    });
  } catch (error) {
    next(error);
  }
};

const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'REPORT_NOT_FOUND', message: 'Report not found' }
      });
    }

    // Ownership Check
    if (report.createdBy.toString() !== req.session.userId.toString() && req.session.role !== 'MODERATOR' && req.session.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'REPORT_UNAUTHORIZED', message: 'You are not authorized to delete this report' }
      });
    }

    // Soft deletion per spec
    report.status = 'REMOVED';
    await report.save();

    res.status(200).json({
      success: true,
      data: { message: 'Report removed successfully' }
    });
  } catch (error) {
    next(error);
  }
};

const getMyReports = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = {
      createdBy: req.session.userId,
      status: { $in: ['ACTIVE', 'RESOLVED', 'CLAIM_PENDING'] }
    };
    if (type) query.reportType = type;

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name collegeEmail department rollNumber classSection');

    res.status(200).json({
      success: true,
      data: {
        items: reports
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getLostReports: getReports('LOST'),
  getFoundReports: getReports('FOUND'),
  getMyReports,
  getReportById,
  updateReport,
  deleteReport
};

