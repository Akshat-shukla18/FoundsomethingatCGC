const Report = require('../models/Report');

const SEARCH_WEIGHTS = {
  text: 0.55,
  time: 0.25,
  category: 0.10,
  recency: 0.10
};

/**
 * Normalizes query string safely
 */
const normalizeQuery = (query) => {
  if (!query) return '';
  return query.trim().replace(/[^\w\s]/gi, '').toLowerCase();
};

const searchFoundReports = async (params) => {
  const { query, startTime, endTime, category, limit = 20, cursor } = params;
  
  const pipeline = [];
  
  // 1. Base Match
  const matchStage = {
    reportType: 'FOUND',
    status: 'ACTIVE'
  };

  // 2. Text Search
  const cleanQuery = normalizeQuery(query);
  if (cleanQuery.length > 0) {
    matchStage.$text = { $search: cleanQuery };
  }

  // 3. Time Filter
  if (startTime || endTime) {
    matchStage.eventAt = {};
    if (startTime) matchStage.eventAt.$gte = new Date(startTime);
    if (endTime) matchStage.eventAt.$lte = new Date(endTime);
  }

  // 4. Additional Filters
  if (category) {
    matchStage.category = category;
  }

  // Cursor pagination logic (cursor represents the sort value of the last item)
  // Since we are sorting by score -> createdAt, cursor gets tricky.
  // We'll use skip/limit for search since text score cursor pagination is complex 
  // and search results are usually bounded and user doesn't page infinitely.
  // We will bound search to max 100 results per the spec 'Retrieve bounded result set'.
  
  const skip = cursor ? parseInt(cursor) : 0;
  const safeLimit = Math.min(parseInt(limit), 50);

  pipeline.push({ $match: matchStage });

  // 5. Projection & Ranking
  if (cleanQuery.length > 0) {
    pipeline.push({
      $addFields: {
        textScore: { $meta: 'textScore' }
      }
    });
    
    // Custom ranking could be added here in $addFields using SEARCH_WEIGHTS,
    // but for initial MVP, MongoDB's textScore combined with recency is sufficient.
    pipeline.push({
      $sort: { textScore: -1, createdAt: -1 }
    });
  } else {
    // If no text query, sort by recency
    pipeline.push({
      $sort: { eventAt: -1, createdAt: -1 }
    });
  }

  // 6. Pagination
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: safeLimit + 1 }); // +1 for hasMore

  const results = await Report.aggregate(pipeline);

  // We need to populate createdBy since aggregate doesn't do it automatically
  const populatedResults = await Report.populate(results, { 
    path: 'createdBy', 
    select: 'name collegeEmail department rollNumber classSection' 
  });

  let hasMore = false;
  if (populatedResults.length > safeLimit) {
    hasMore = true;
    populatedResults.pop();
  }

  // For search, our 'cursor' is just the skip offset
  const nextCursor = hasMore ? (skip + safeLimit).toString() : null;

  return {
    items: populatedResults,
    nextCursor,
    hasMore
  };
};

module.exports = {
  searchFoundReports
};
