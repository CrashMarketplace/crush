"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReviewSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Types.ObjectId,
        ref: "Product",
        required: true,
        index: true,
    },
    reviewer: {
        type: mongoose_1.Types.ObjectId,
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
}, { timestamps: true });
ReviewSchema.index({ product: 1, reviewer: 1 }, { unique: true });
exports.default = (0, mongoose_1.model)("Review", ReviewSchema);
