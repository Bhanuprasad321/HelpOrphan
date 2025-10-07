const admin = require("./firebaseAdmin");

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(403).json({ error: "Unauthorized: Invalid token" });
  }
}

module.exports = verifyToken;
