import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

// Express Request에 user 속성 추가
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        userId: string;
        email: string;
        displayName: string;
        isAdmin: boolean;
      };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "로그인이 필요합니다" });
    }

    const secret = process.env.JWT_SECRET || "fallback-secret";
    const decoded = jwt.verify(token, secret) as any;

    // 사용자 정보를 req.user에 저장
    req.user = {
      _id: decoded.id || decoded._id,
      userId: decoded.userId,
      email: decoded.email,
      displayName: decoded.displayName || "",
      isAdmin: decoded.isAdmin || false,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "인증에 실패했습니다" });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "로그인이 필요합니다" });
    }

    const secret = process.env.JWT_SECRET || "fallback-secret";
    const decoded = jwt.verify(token, secret) as any;

    const user = await User.findById(decoded.id || decoded._id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "관리자 권한이 필요합니다" });
    }

    req.user = {
      _id: user._id.toString(),
      userId: user.userId,
      email: user.email,
      displayName: user.displayName || "",
      isAdmin: user.isAdmin,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "인증에 실패했습니다" });
  }
}
