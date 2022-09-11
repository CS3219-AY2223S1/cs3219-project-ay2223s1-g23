import jwt from "jsonwebtoken";
import "dotenv/config";

export function verifyJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token === null) {
    return res
      .status(401)
      .json({ message: `A token is required for authentication!` });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: `Invalid token provided!` });
    }

    req.user = decoded.user;
    next();
  });
}
