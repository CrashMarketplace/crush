import { Schema, model, Types } from "mongoose";

const NotificationSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["reservation", "reservation_confirmed", "reservation_cancelled", "reservation_completed"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedProduct: { type: Types.ObjectId, ref: "Product" },
    relatedReservation: { type: Types.ObjectId, ref: "Reservation" },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default model("Notification", NotificationSchema);
