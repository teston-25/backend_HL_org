import express from "express";
import * as chapaController from "../controllers/chapa";
import { validate } from "../middleware/validate";
import {
  initPaymentSchema,
  verifyPaymentSchema,
  callbackSchema,
  getTransactionSchema,
} from "../validations/paymentValidation";
import { verifyChapaWebhook } from "../middleware/webHook";

const router = express.Router();

// payment endpoints
router.post(
  "/initialize-payment",
  validate(initPaymentSchema),
  chapaController.initPayment,
);
router.get(
  "/verify-payment/:tx_ref",
  validate(verifyPaymentSchema, "params"),
  chapaController.verifyPayment,
);
router.post(
  "/payment-callback",
  verifyChapaWebhook,
  validate(callbackSchema),
  chapaController.paymentCallback,
);
router.get(
  "/transaction-status/:tx_ref",
  validate(getTransactionSchema, "params"),
  chapaController.transactionStatus,
);

export default router;
