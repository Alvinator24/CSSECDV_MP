import jwt from "jsonwebtoken";

interface JwtUserPayload {
  id: string;
  email: string;
  role: string;
}

const SECRET = process.env.JWT_SECRET as string;

export function signToken(payload: JwtUserPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
}

export function verifyToken(token: string): JwtUserPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtUserPayload;
  } catch {
    return null;
  }
}