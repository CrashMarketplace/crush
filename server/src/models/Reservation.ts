import { Schema, model, Types } from "mongoose";

const ReservationSchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: "Product", required: true, index: true },
    buyer: { type: Types.ObjectId, ref: "User", required: true, index: true },
    seller: { type: Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      index: true,
    },
    reservedDate: { type: Date, default: Date.now },
    meetingLocation: { type: String, default: "" },
    meetingTime: { type: Date },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default model("Reservation", ReservationSchema);
