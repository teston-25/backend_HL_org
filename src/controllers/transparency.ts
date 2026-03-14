import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import catchAsync from "../services/catchAsync";

export const uploadTransparencyPDF = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "PDF file is required" });
    }

    // Upload PDF to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "raw",
      folder: "transparency_files",
      public_id: req.file.originalname.split(".")[0], // file name without extension
    });

    res.status(201).json({
      status: "success",
      data: {
        url: result.secure_url,
        name: req.file.originalname,
        type: req.file.mimetype,
      },
    });
  },
);
