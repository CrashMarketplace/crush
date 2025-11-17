"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const Product_1 = __importDefault(require("../models/Product"));
const authToken_1 = require("../utils/authToken");
const router = (0, express_1.Router)();
const statusUpdateSchema = zod_1.z.object({
    status: zod_1.z.enum(["selling", "reserved", "sold"]),
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
    const item = await Product_1.default.findById(req.params.id);
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
exports.default = router;
