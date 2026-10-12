const authenticatedRequest = (req, res, next) => {
  console.log(`[DESIGN-SERVICE] Incoming: ${req.method} ${req.originalUrl}`);
  console.log(`[DESIGN-SERVICE] x-user-id header: ${req.headers["x-user-id"]}`);
  console.log(`[DESIGN-SERVICE] All headers:`, JSON.stringify(req.headers, null, 2));

  const userId = req.headers["x-user-id"];

  if (!userId) {
    console.error(`[DESIGN-SERVICE] Auth FAILED — no x-user-id header`);
    return res.status(401).json({
      error: "Access denied! Please login to continue",
    });
  }

  console.log(`[DESIGN-SERVICE] Auth passed for userId: ${userId}`);
  req.user = { userId };
  next();
};

module.exports = authenticatedRequest;
