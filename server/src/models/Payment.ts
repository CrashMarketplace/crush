import { Schema, model, Types } from "mongoose";

const PaymentSchema = new Schema(
  {
    reservation: { type: Types.ObjectId, ref: "Reservation", required: true, index: true },
    buyer: { type: Types.ObjectId, ref: "User", required: true, index: true },
    seller: { type: Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "held", "completed", "refunded", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "bank_transfer", "virtual_account", "escrow"],
      required: true,
    },
    // 에스크로 정보
    escrowHeldAt: { type: Date }, // 에스크로 보관 시작
    escrowReleasedAt: { type: Date }, // 판매자에게 지급
    // 결제 게이트웨이 정보
    transactionId: { type: String, unique: true, sparse: true }, // 외부 결제 시스템 ID
    paymentGateway: { type: String, default: "internal" }, // 예: "toss", "iamport", "internal"
    // 환불 정보
    refundReason: { type: String, default: "" },
    refundedAt: { type: Date },
    refundAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model("Payment", PaymentSchema);
