import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  console.log("🔐 Checking user authentication...");
  const token = req.header("Authorization");
  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });

  try {
    // Verify token
    const realToken = token.split(" ")[1];
    const verified = jwt.verify(realToken, process.env.JWT_SECRET);
    if (!verified) {
      console.log("❌ Invalid token.");
      return res.status(401).json({ message: "Access denied. Invalid token." });
    }
    req.user = verified;
    next();
  } catch (error) {
    console.log("❌ Invalid token.");
    res.status(400).json({ message: "Invalid token." });
  }
};

export default authMiddleware;
