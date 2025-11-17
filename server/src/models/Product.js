"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
    seller: { type: mongoose_1.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: "기타", index: true },
    location: { type: String, default: "미정", index: true },
    images: { type: [String], default: [] }, // 업로드된 이미지 URL 배열
    status: {
        type: String,
        enum: ["selling", "reserved", "sold"],
        default: "selling",
        index: true,
    },
    // 중고 상품 대여 가능 여부
    usedAvailable: { type: Boolean, default: false, index: true },
    likes: {
        type: [mongoose_1.Types.ObjectId],
        ref: "User",
        default: [],
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Product", ProductSchema);
