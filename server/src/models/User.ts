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
  },
  { timestamps: true }
);
export type UserAttrs = InferSchemaType<typeof UserSchema>;
export type UserDocument = HydratedDocument<UserAttrs>;

export default model("User", UserSchema);
