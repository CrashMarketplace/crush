// 관리자 권한 설정 스크립트
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import mongoose from "mongoose";
import User from "../models/User";

async function setAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI가 설정되지 않았습니다.");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB 연결 성공");

    const userId = "junsu";
    const user = await User.findOne({ userId });

    if (!user) {
      console.error(`❌ 사용자 '${userId}'를 찾을 수 없습니다.`);
      console.log("먼저 회원가입을 진행해주세요.");
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();

    console.log(`✅ '${userId}' 사용자에게 관리자 권한이 부여되었습니다.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  }
}

setAdmin();
