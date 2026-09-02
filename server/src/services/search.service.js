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

const autobotSearchFoundReports = async (queryText, userId) => {
  const cleanQuery = queryText.trim();
  const regex = new RegExp(cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  // Search ACTIVE found reports matching the query
  const matches = await Report.find({
    reportType: 'FOUND',
    status: 'ACTIVE',
    $or: [
      { itemName: regex },
      { description: regex },
      { category: regex },
      { color: regex },
      { brand: regex },
      { 'location.label': regex },
      { normalizedItemName: regex },
      { normalizedSearchText: regex }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(10)
  .populate('createdBy', 'name collegeEmail department');

  const count = matches.length;
  const embeddedNames = Array.from(new Set(matches.map(m => m.itemName)));

  let replyText = '';
  if (count === 0) {
    replyText = `I searched all recent found item posts for "${cleanQuery}", but couldn't find an exact match yet. Somebody might post it soon, or you can create a "Lost" report so others can contact you if found!`;
  } else if (count === 1) {
    replyText = `Great news! I found 1 matching post for "${cleanQuery}": "${matches[0].itemName}" found at ${matches[0].location?.label || 'campus'}. Check the details below!`;
  } else {
    replyText = `I found ${count} matching posts for "${cleanQuery}" (including ${embeddedNames.slice(0, 3).map(n => `"${n}"`).join(', ')}). Check them out below:`;
  }

  return {
    query: cleanQuery,
    matchCount: count,
    replyText,
    embeddedNames,
    items: matches.map(item => ({
      _id: item._id,
      itemName: item.itemName,
      description: item.description,
      location: item.location?.label || 'Campus',
      eventAt: item.eventAt,
      createdAt: item.createdAt,
      images: item.images || []
    }))
  };
};

module.exports = {
  searchFoundReports,
  autobotSearchFoundReports
};
