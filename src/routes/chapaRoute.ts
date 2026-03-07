import express from "express";
import * as chapaController from "../controllers/chapa";

const router = express.Router();

// payment endpoints
router.post("/initialize-payment", chapaController.initPayment);
router.get("/verify-payment/:tx_ref", chapaController.verifyPayment);
router.post("/payment-callback", chapaController.paymentCallback);
router.get("/transaction-status/:tx_ref", chapaController.transactionStatus);

export default router;
