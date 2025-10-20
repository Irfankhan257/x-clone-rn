export const protectRoute = async (req, res, next) => {
  if (!req.auth().isAuthenticated) {
    return res(401).json({ message: "Unauthorized - Please log In first" });
  }
  next();
};
