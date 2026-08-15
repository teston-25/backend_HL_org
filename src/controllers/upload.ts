import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import catchAsync from "../services/catchAsync";

interface AuthRequest extends Request {
  admin?: {
    id: number;
    email: string;
    role: string;
  };
}

export const uploadImage = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.file) {
      return res.status(400).json({
        status: "fail",
        message: "Image file is required",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "image",
      folder: "admin_uploads",
      use_filename: true,
      unique_filename: true,
    });

    res.status(201).json({
      status: "success",
      data: {
        image_url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  },
);
