import { Schema, model, Types } from "mongoose";

const ProductSchema = new Schema(
  {
    seller: { type: Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: "기타", index: true },
    location: { type: String, default: "미정", index: true },
    images: { type: [String], default: [] }, // 업로드된 이미지 URL 배열
    status: {
      type: String,
      enum: ["selling", "reserved", "sold"],
      default: "selling",
      index: true,
    },
    // 중고 상품 대여 가능 여부
    usedAvailable: { type: Boolean, default: false, index: true },
    likes: {
      type: [Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  { timestamps: true }
);

export default model("Product", ProductSchema);
