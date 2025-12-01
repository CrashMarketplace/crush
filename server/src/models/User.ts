import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const UserSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    displayName: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    location: { type: String, default: "" },
    bio: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    lastLoginAt: { type: Date }, // 마지막 로그인 시간
    // 사용자 평가 시스템
    mannerTemperature: { type: Number, default: 36.5, min: 0, max: 100 }, // 매너 온도
    trustScore: { type: Number, default: 0, min: 0, max: 100 }, // 신뢰 지수
    totalReviews: { type: Number, default: 0 }, // 총 리뷰 수
    positiveReviews: { type: Number, default: 0 }, // 긍정 리뷰 수
    negativeReviews: { type: Number, default: 0 }, // 부정 리뷰 수
    completedTransactions: { type: Number, default: 0 }, // 완료된 거래 수
  },
  { timestamps: true }
);
export type UserAttrs = InferSchemaType<typeof UserSchema>;
export type UserDocument = HydratedDocument<UserAttrs>;

export default model("User", UserSchema);
