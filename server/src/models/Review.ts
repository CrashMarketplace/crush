import { Schema, model, Types } from "mongoose";

const ReviewSchema = new Schema(
  {
    reservation: { type: Types.ObjectId, ref: "Reservation", required: true, index: true },
    reviewer: { type: Types.ObjectId, ref: "User", required: true, index: true },
    reviewee: { type: Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 }, // 1-5 별점
    reviewType: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      required: true,
    },
    comment: { type: String, default: "" },
    tags: [{ type: String }], // 예: ["친절해요", "시간약속을 잘 지켜요", "응답이 빨라요"]
    // 매너 평가 항목
    punctuality: { type: Number, min: 1, max: 5 }, // 시간 약속
    kindness: { type: Number, min: 1, max: 5 }, // 친절도
    communication: { type: Number, min: 1, max: 5 }, // 의사소통
    productCondition: { type: Number, min: 1, max: 5 }, // 상품 상태 (판매자만)
  },
  { timestamps: true }
);

// 한 예약당 한 번만 리뷰 가능
ReviewSchema.index({ reservation: 1, reviewer: 1 }, { unique: true });

export default model("Review", ReviewSchema);
