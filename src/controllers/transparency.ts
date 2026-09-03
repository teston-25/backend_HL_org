import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import catchAsync from "../services/catchAsync";
import prisma from "../config/prisma";
import AppError from "../services/AppError";
import { createAuditLog } from "../services/auditLog";

interface AuthRequest extends Request {
  admin?: {
    id: number;
    email: string;
    role: string;
  };
}

export const getAllTransparencyFiles = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { year, file_type } = req.query;

    // Optional filtering
    const filters: any = {};

    if (year) {
      filters.year = Number(year);
    }

    if (file_type) {
      filters.file_type = file_type;
    }

    const files = await prisma.transparencyFile.findMany({
      where: filters,
      orderBy: {
        year: "desc",
      },
    });

    res.status(200).json({
      status: "success",
      results: files.length,
      data: files,
    });
  },
);

export const getTransparencyFile = catchAsync(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    const file = await prisma.transparencyFile.findUnique({
      where: { id },
    });

    if (!file) {
      throw new AppError("File not found", 404);
    }

    res.status(200).json({
      status: "success",
      data: file,
    });
  },
);

export const uploadTransparencyPDF = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        status: "fail",
        message: "PDF file is required",
      });
    }

    const { title, file_type, year } = req.body;
    if (!title || !file_type || !year) {
      return res.status(400).json({
        status: "fail",
        message: "title, file_type and year are required",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "raw",
      folder: "transparency_files",
      public_id: `Report_${Date.now()}`,
    });

    const file = await prisma.transparencyFile.create({
      data: {
        title,
        file_url: result.secure_url,
        file_type,
        year: Number(year),
      },
    });

    if (req.admin) {
      await createAuditLog(
        req.admin.id,
        "CREATE",
        "TRANSPARENCY_FILE",
        file.id,
        `Uploaded transparency file: ${title}`,
      );
    }

    res.status(201).json({
      status: "success",
      data: file,
    });
  },
);

export const updateTransparencyFile = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const { title, file_type, year } = req.body;
    const file = req.file;

    // Check if file exists
    const existingFile = await prisma.transparencyFile.findUnique({
      where: { id },
    });

    if (!existingFile) {
      throw new AppError("File not found", 404);
    }

    // Prepare update data
    const updateData: any = {};

    // Update text fields if provided
    if (title) updateData.title = title;
    if (file_type) updateData.file_type = file_type;
    if (year) updateData.year = parseInt(year, 10);

    // If new file is uploaded
    if (file) {
      try {
        // Delete old file from Cloudinary
        const oldUrlParts = existingFile.file_url.split("/");
        const uploadIndex = oldUrlParts.indexOf("upload");
        const oldPublicId = oldUrlParts
          .slice(uploadIndex + 2)
          .join("/")
          .replace(/\.[^/.]+$/, "");

        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: "raw",
        });

        // Upload new file to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "raw",
          folder: "transparency_files",
          use_filename: true,
          unique_filename: true,
        });

        // Update file_url with new file
        updateData.file_url = result.secure_url;
      } catch (cloudinaryError) {
        console.error("Cloudinary error:", cloudinaryError);
        throw new AppError("Error updating file on Cloudinary", 500);
      }
    }

    const updatedFile = await prisma.transparencyFile.update({
      where: { id },
      data: updateData,
    });

    if (req.admin) {
      await createAuditLog(
        req.admin.id,
        "UPDATE",
        "TRANSPARENCY_FILE",
        updatedFile.id,
        `Updated transparency file: ${updatedFile.title}`,
      );
    }

    res.status(200).json({
      status: "success",
      message: "File updated successfully",
      data: updatedFile,
    });
  },
);

export const deleteTransparencyFile = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id, 10);

    const file = await prisma.transparencyFile.findUnique({
      where: { id },
    });

    if (!file) {
      return res.status(404).json({
        status: "fail",
        message: "File not found",
      });
    }

    // Delete from Cloudinary (best-effort — never block deletion of the DB
    // row if Cloudinary cleanup fails, e.g. for legacy image-typed uploads).
    try {
      const urlParts = file.file_url.split("/");
      const publicId = urlParts
        .slice(-2)
        .join("/")
        .replace(/\.[^/.]+$/, "");

      await cloudinary.uploader.destroy(publicId, {
        resource_type: "raw",
      });
    } catch (cloudinaryError) {
      console.error("Cloudinary delete failed (ignored):", cloudinaryError);
    }

    await prisma.transparencyFile.delete({
      where: { id },
    });

    if (req.admin) {
      await createAuditLog(
        req.admin.id,
        "DELETE",
        "TRANSPARENCY_FILE",
        id,
        `Deleted transparency file: ${file.title}`,
      );
    }

    res.status(204).json({
      status: "success",
      message: "File deleted successfully",
    });
  },
);
