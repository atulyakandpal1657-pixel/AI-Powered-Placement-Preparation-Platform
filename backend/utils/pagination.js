const getPaginationOptions = (query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const getPaginationResponse = (total, page, limit, dataKey, data) => {
  return {
    [dataKey]: data,
    page,
    limit,
    total,
    totalPages: total ? Math.ceil(total / limit) : 0,
  };
};

module.exports = {
  getPaginationOptions,
  getPaginationResponse,
};
