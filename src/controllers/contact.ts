import { Request, Response } from "express";
import catchAsync from "../services/catchAsync";
import prisma from "../config/prisma";

// controller function for contact form submission
export const createContact = catchAsync(async (req: Request, res: Response) => {
  const { name, email, subject, message, type } = req.body;

  const contact = await prisma.contact.create({
    data: {
      name,
      email,
      subject,
      message,
      type: type || "general",
      created_at: new Date(),
    },
  });

  res.status(201).json({
    status: "success",
    message: "Contact message created successfully",
    data: {
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
        type: contact.type,
        created_at: contact.created_at,
      },
    },
  });
});
