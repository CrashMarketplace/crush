import { Schema, model, Types } from "mongoose";

const PaymentSchema = new Schema(
  {
    reservation: { type: Types.ObjectId, ref: "Reservation", required: true, index: true },
    buyer: { type: Types.ObjectId, ref: "User", required: true, index: true },
    seller: { type: Types.ObjectId, ref: "User", required: true, index: true },
    productAmount: { type: Number, required: true }, // 상품 금액
    platformFee: { type: Number, required: true }, // 플랫폼 수수료 (20%)
    amount: { type: Number, required: true }, // 총 금액 (상품 + 수수료)
    status: {
      type: String,
      enum: ["pending", "held", "completed", "refunded", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["in_person", "card", "bank_transfer", "virtual_account", "escrow"],
      default: "in_person",
      required: true,
    },
    // 현장 결제 정보
    paidAt: { type: Date }, // 결제 완료 시간
    // 에스크로 정보 (미사용)
    escrowHeldAt: { type: Date },
    escrowReleasedAt: { type: Date },
    // 결제 게이트웨이 정보 (미사용)
    transactionId: { type: String, unique: true, sparse: true },
    paymentGateway: { type: String, default: "in_person" },
    // 환불 정보
    refundReason: { type: String, default: "" },
    refundedAt: { type: Date },
    refundAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model("Payment", PaymentSchema);
