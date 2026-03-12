import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import catchAsync from "../services/catchAsync";
import AppError from "../services/AppError";

// News management endpoints (for Super Admin and Admin roles)
export const createNews = catchAsync(async (req: Request, res: Response) => {
  const news = await prisma.news.create({
    data: {
      title: req.body.title,
      slug: req.body.slug
        ? req.body.slug
        : req.body.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
      excerpt: req.body.excerpt,
      content: req.body.content,
      image_url: req.body.image_url,
      category: req.body.category,
      published_at: req.body.published_at
        ? new Date(req.body.published_at)
        : null,
      created_at: new Date(),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      image_url: true,
      category: true,
      published_at: true,
      created_at: true,
    },
  });

  res.status(201).json({
    status: "success",
    message: "News created successfully",
    data: { news },
  });
});

export const getNews = catchAsync(async (req: Request, res: Response) => {
  const news = await prisma.news.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      image_url: true,
      category: true,
      published_at: true,
      created_at: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  res.json({
    status: "success",
    data: { news },
  });
});

export const getNewsById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const news = await prisma.news.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      image_url: true,
      category: true,
      published_at: true,
      created_at: true,
    },
  });

  if (!news) {
    throw new AppError("News not found", 404);
  }

  res.json({
    status: "success",
    data: { news },
  });
});

export const updateNews = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Generate new slug if title is being updated and slug not provided
  let slug = req.body.slug;
  if (req.body.title && !req.body.slug) {
    slug = req.body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  const news = await prisma.news.update({
    where: { id: parseInt(id) },
    data: {
      title: req.body.title,
      slug: slug,
      excerpt: req.body.excerpt,
      content: req.body.content,
      image_url: req.body.image_url,
      category: req.body.category,
      published_at: req.body.published_at
        ? new Date(req.body.published_at)
        : undefined,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      image_url: true,
      category: true,
      published_at: true,
      created_at: true,
    },
  });

  res.json({
    status: "success",
    message: "News updated successfully",
    data: { news },
  });
});

export const deleteNews = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.news.delete({
    where: { id: parseInt(id) },
  });

  res.status(204).json({
    status: "success",
    message: "News deleted successfully",
  });
});
