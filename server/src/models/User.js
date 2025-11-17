"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    displayName: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    location: { type: String, default: "" },
    bio: { type: String, default: "" },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("User", UserSchema);
