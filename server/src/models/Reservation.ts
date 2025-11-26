import { Schema, model, Types } from "mongoose";

const ReservationSchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: "Product", required: true, index: true },
    buyer: { type: Types.ObjectId, ref: "User", required: true, index: true },
    seller: { type: Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "payment_pending", "payment_completed"],
      default: "pending",
      index: true,
    },
    reservedDate: { type: Date, default: Date.now },
    meetingLocation: { type: String, default: "" },
    meetingTime: { type: Date },
    notes: { type: String, default: "" },
    // 결제 정보
    paymentRequired: { type: Boolean, default: false },
    paymentAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["none", "pending", "completed", "refunded"],
      default: "none",
    },
    paymentMethod: { type: String, default: "" }, // 결제 수단
    // 리뷰 완료 여부
    buyerReviewed: { type: Boolean, default: false },
    sellerReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("Reservation", ReservationSchema);
