"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const Product_1 = __importDefault(require("../models/Product"));
const Review_1 = __importDefault(require("../models/Review"));
const authToken_1 = require("../utils/authToken");
const router = (0, express_1.Router)();
const statusUpdateSchema = zod_1.z.object({
    status: zod_1.z.enum(["selling", "reserved", "sold"]),
});
const reviewBodySchema = zod_1.z.object({
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().min(5).max(1000),
});
/** 등록 */
router.post("/", async (req, res) => {
    const user = (0, authToken_1.readUserFromReq)(req);
    if (!user)
        return res.status(401).json({ ok: false, error: "unauthorized" });
    const Body = zod_1.z.object({
        title: zod_1.z.string().min(1),
        description: zod_1.z.string().optional().default(""),
        price: zod_1.z.number().nonnegative(),
        category: zod_1.z.string().optional().default("기타"),
        location: zod_1.z.string().optional().default("미정"),
        images: zod_1.z.array(zod_1.z.string().url()).optional().default([]),
        usedAvailable: zod_1.z.boolean().optional().default(false),
    });
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ ok: false, error: parsed.error.message });
    }
    const doc = await Product_1.default.create({ ...parsed.data, seller: user.id });
    return res.status(201).json({ ok: true, product: doc });
});
/** 목록 (최신순) */
router.get("/", async (_req, res) => {
    const list = await Product_1.default.find().sort({ createdAt: -1 }).limit(200);
    return res.json({ ok: true, products: list });
});
/** 단건 조회 */
router.get("/:id", async (req, res) => {
    const item = await Product_1.default.findById(req.params.id).populate("seller", "displayName userId location avatarUrl");
    if (!item)
        return res.status(404).json({ ok: false, error: "not_found" });
    return res.json({ ok: true, product: item });
});
/** 삭제 (본인만) */
router.delete("/:id", async (req, res) => {
    const user = (0, authToken_1.readUserFromReq)(req);
    if (!user)
        return res.status(401).json({ ok: false, error: "unauthorized" });
    const item = await Product_1.default.findById(req.params.id);
    if (!item)
        return res.status(404).json({ ok: false, error: "not_found" });
    // 본인 소유 체크
    if (String(item.seller) !== String(user.id)) {
        return res.status(403).json({ ok: false, error: "forbidden" });
    }
    await item.deleteOne();
    return res.json({ ok: true, deleted: true });
});
/** 상태 업데이트 (판매완료 등) */
router.patch("/:id/status", async (req, res) => {
    const user = (0, authToken_1.readUserFromReq)(req);
    if (!user)
        return res.status(401).json({ ok: false, error: "unauthorized" });
    const parsed = statusUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res
            .status(400)
            .json({ ok: false, error: parsed.error.issues[0]?.message });
    }
    const item = await Product_1.default.findById(req.params.id);
    if (!item)
        return res.status(404).json({ ok: false, error: "not_found" });
    if (String(item.seller) !== String(user.id)) {
        return res.status(403).json({ ok: false, error: "forbidden" });
    }
    item.status = parsed.data.status;
    await item.save();
    return res.json({ ok: true, product: item });
});
/** 좋아요 등록 */
router.post("/:id/likes", async (req, res) => {
    const user = (0, authToken_1.readUserFromReq)(req);
    if (!user)
        return res.status(401).json({ ok: false, error: "unauthorized" });
    const item = await Product_1.default.findById(req.params.id);
    if (!item)
        return res.status(404).json({ ok: false, error: "not_found" });
    const alreadyLiked = item.likes.some((like) => String(like) === String(user.id));
    if (!alreadyLiked) {
        item.likes.push(user.id);
        await item.save();
    }
    return res.json({
        ok: true,
        liked: true,
        likesCount: item.likes.length,
    });
});
/** 좋아요 취소 */
router.delete("/:id/likes", async (req, res) => {
    const user = (0, authToken_1.readUserFromReq)(req);
    if (!user)
        return res.status(401).json({ ok: false, error: "unauthorized" });
    const item = await Product_1.default.findById(req.params.id);
    if (!item)
        return res.status(404).json({ ok: false, error: "not_found" });
    const nextLikes = item.likes.filter((like) => String(like) !== String(user.id));
    if (nextLikes.length !== item.likes.length) {
        item.likes = nextLikes;
        await item.save();
    }
    return res.json({
        ok: true,
        liked: false,
        likesCount: item.likes.length,
    });
});
/** 판매 완료 상품 거래 후기 목록 */
router.get("/:id/reviews", async (req, res) => {
    const product = await Product_1.default.findById(req.params.id).select("_id");
    if (!product)
        return res.status(404).json({ ok: false, error: "not_found" });
    const reviews = await Review_1.default.find({ product: product._id })
        .sort({ createdAt: -1 })
        .lean();
    return res.json({ ok: true, reviews });
});
/** 거래 후기 작성/수정 */
router.post("/:id/reviews", async (req, res) => {
    const user = (0, authToken_1.readUserFromReq)(req);
    if (!user)
        return res.status(401).json({ ok: false, error: "unauthorized" });
    const parsed = reviewBodySchema.safeParse(req.body);
    if (!parsed.success) {
        return res
            .status(400)
            .json({ ok: false, error: parsed.error.issues[0]?.message });
    }
    const product = await Product_1.default.findById(req.params.id);
    if (!product)
        return res.status(404).json({ ok: false, error: "not_found" });
    if (product.status !== "sold") {
        return res.status(400).json({
            ok: false,
            error: "reviews_allowed_only_after_sale",
        });
    }
    const existing = await Review_1.default.findOne({
        product: product._id,
        reviewer: user.id,
    });
    if (existing) {
        existing.rating = parsed.data.rating;
        existing.comment = parsed.data.comment;
        await existing.save();
        return res.json({ ok: true, review: existing, updated: true });
    }
    const review = await Review_1.default.create({
        product: product._id,
        reviewer: user.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
    });
    return res.status(201).json({ ok: true, review });
});
exports.default = router;
