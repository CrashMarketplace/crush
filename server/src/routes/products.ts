import { Router } from "express";
import { z } from "zod";
import Product from "../models/Product";
import Review from "../models/Review";
import { readUserFromReq } from "../utils/authToken";

const router = Router();

// ------------------------------
// Zod Schemas
// ------------------------------
const statusUpdateSchema = z.object({
  status: z.enum(["selling", "reserved", "sold"]),
});

const reviewBodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
});

// ------------------------------
// 상품 등록
// ------------------------------
router.post("/", async (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

  const Body = z.object({
    title: z.string().min(1),
    description: z.string().optional().default(""),
    price: z.number().nonnegative(),
    category: z.string().optional().default("기타"),
    location: z.string().optional().default("미정"),

    // 🔥 여기 고쳤음: url() 제거 (Railway 절대 URL + Netlify 상대 URL 모두 허용)
    images: z.array(z.string()).optional().default([]),

    usedAvailable: z.boolean().optional().default(false),
  });

  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.message });
  }

  const doc = await Product.create({ ...parsed.data, seller: user.id });
  return res.status(201).json({ ok: true, product: doc });
});

// ------------------------------
// 목록 조회
// ------------------------------
router.get("/", async (_req, res) => {
  const list = await Product.find().sort({ createdAt: -1 }).limit(200);
  return res.json({ ok: true, products: list });
});

// ------------------------------
// 단일 조회
// ------------------------------
router.get("/:id", async (req, res) => {
  const item = await Product.findById(req.params.id).populate(
    "seller",
    "displayName userId location avatarUrl"
  );

  if (!item) return res.status(404).json({ ok: false, error: "not_found" });
  return res.json({ ok: true, product: item });
});

// ------------------------------
// 삭제 (본인만)
// ------------------------------
router.delete("/:id", async (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ ok: false, error: "not_found" });

  if (String(item.seller) !== String(user.id)) {
    return res.status(403).json({ ok: false, error: "forbidden" });
  }

  await item.deleteOne();
  return res.json({ ok: true, deleted: true });
});

// ------------------------------
// 상태 업데이트
// ------------------------------
router.patch("/:id/status", async (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

  const parsed = statusUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ ok: false, error: parsed.error.issues[0]?.message });
  }

  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ ok: false, error: "not_found" });

  if (String(item.seller) !== String(user.id)) {
    return res.status(403).json({ ok: false, error: "forbidden" });
  }

  item.status = parsed.data.status;
  await item.save();

  return res.json({ ok: true, product: item });
});

// ------------------------------
// 좋아요 등록
// ------------------------------
router.post("/:id/likes", async (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ ok: false, error: "not_found" });

  const alreadyLiked = item.likes.some(
    (like) => String(like) === String(user.id)
  );

  if (!alreadyLiked) {
    item.likes.push(user.id as any);
    await item.save();
  }

  return res.json({
    ok: true,
    liked: true,
    likesCount: item.likes.length,
  });
});

// ------------------------------
// 좋아요 취소
// ------------------------------
router.delete("/:id/likes", async (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ ok: false, error: "not_found" });

  const nextLikes = item.likes.filter(
    (like) => String(like) !== String(user.id)
  );

  if (nextLikes.length !== item.likes.length) {
    item.likes = nextLikes as typeof item.likes;
    await item.save();
  }

  return res.json({
    ok: true,
    liked: false,
    likesCount: item.likes.length,
  });
});

// ------------------------------
// 리뷰 목록
// ------------------------------
router.get("/:id/reviews", async (req, res) => {
  const product = await Product.findById(req.params.id).select("_id");
  if (!product) return res.status(404).json({ ok: false, error: "not_found" });

  const reviews = await Review.find({ product: product._id })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({ ok: true, reviews });
});

// ------------------------------
// 리뷰 작성/수정
// ------------------------------
router.post("/:id/reviews", async (req, res) => {
  const user = readUserFromReq(req);
  if (!user) return res.status(401).json({ ok: false, error: "unauthorized" });

  const parsed = reviewBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ ok: false, error: parsed.error.issues[0]?.message });
  }

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ ok: false, error: "not_found" });

  if (product.status !== "sold") {
    return res.status(400).json({
      ok: false,
      error: "reviews_allowed_only_after_sale",
    });
  }

  const existing = await Review.findOne({
    product: product._id,
    reviewer: user.id,
  });

  if (existing) {
    existing.rating = parsed.data.rating;
    existing.comment = parsed.data.comment;
    await existing.save();
    return res.json({ ok: true, review: existing, updated: true });
  }

  const review = await Review.create({
    product: product._id,
    reviewer: user.id,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  });

  return res.status(201).json({ ok: true, review });
});

export default router;
