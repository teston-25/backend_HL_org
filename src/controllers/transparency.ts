import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import catchAsync from "../services/catchAsync";
import prisma from "../config/prisma";
import AppError from "../services/AppError";

export const uploadTransparencyPDF = catchAsync(
  async (req: Request, res: Response) => {
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

    res.status(201).json({
      status: "success",
      data: file,
    });
  },
);

export const updateTransparencyFile = catchAsync(
  async (req: Request, res: Response) => {
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

    res.status(200).json({
      status: "success",
      message: "File updated successfully",
      data: updatedFile,
    });
  },
);

export const deleteTransparencyFile = catchAsync(
  async (req: Request, res: Response) => {
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

    // Delete from Cloudinary
    const urlParts = file.file_url.split("/");
    const publicId = urlParts
      .slice(-2)
      .join("/")
      .replace(/\.[^/.]+$/, "");

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });

    await prisma.transparencyFile.delete({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      message: "File deleted successfully",
    });
  },
);
