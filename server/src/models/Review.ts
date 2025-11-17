import { Schema, model, Types } from "mongoose";

const ReviewSchema = new Schema(
  {
    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    reviewer: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, reviewer: 1 }, { unique: true });

export type ReviewDocument = {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  reviewer: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
};

export default model("Review", ReviewSchema);

