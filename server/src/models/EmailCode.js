"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/models/EmailCode.ts
const mongoose_1 = require("mongoose");
const EmailCodeSchema = new mongoose_1.Schema({
    email: { type: String, required: true, index: true, unique: true },
    code: { type: String, required: true }, // "123456"
    // index: true 제거 (TTL 인덱스와 중복됨)
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
}, { timestamps: true });
// TTL 인덱스(만료되면 자동 삭제) — 이것만 유지
EmailCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.default = (0, mongoose_1.model)("EmailCode", EmailCodeSchema);
