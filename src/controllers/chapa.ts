import { Request, Response } from "express";
import catchAsync from "../services/catchAsync";
import * as chapaService from "../services/chapaService";

// controller functions for Chapa routes
export const initPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await chapaService.initPayment(req.body);
  res.json({ success: true, ...result });
});

export const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await chapaService.verifyPayment(req.params.tx_ref);
  res.json({ success: true, data: result });
});

export const paymentCallback = catchAsync(
  async (req: Request, res: Response) => {
    chapaService.handleCallback(req.body);
    res.status(200).send("Callback received");
  },
);

export const transactionStatus = catchAsync(
  async (req: Request, res: Response) => {
    const transaction = chapaService.getTransaction(req.params.tx_ref);
    res.json({ success: true, data: transaction });
  },
);
