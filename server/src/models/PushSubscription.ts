import { Schema, model, Types } from "mongoose";

const PushSubscriptionSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },
    subscription: { type: Object, required: true },
  },
  { timestamps: true }
);

export default model("PushSubscription", PushSubscriptionSchema);
