import axios from "axios";
import crypto from "crypto";
import AppError from "./AppError";
import prisma from "../config/prisma";
import { sendDonationConfirmation } from "./donationEmail";

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY!;
const CHAPA_API_URL = "https://api.chapa.co/v1";

export async function initPayment(data: any) {
  const {
    amount,
    email,
    first_name,
    last_name,
    phone_number,
    title,
    description,
    return_url,
  } = data;
  if (!amount || !email) {
    throw new AppError("Amount and email are required", 400);
  }

  const tx_ref =
    "TX-" + Date.now() + "-" + crypto.randomBytes(4).toString("hex");

  // Create donation record in database
  const donation = await prisma.donation.create({
    data: {
      amount: parseFloat(amount),
      email,
      first_name,
      last_name,
      phone_number,
      title,
      description,
      tx_ref,
      status: "pending",
    },
  });

  const transactionData: any = {
    amount: amount.toString(),
    currency: "ETB",
    email,
    first_name,
    last_name,
    phone_number,
    tx_ref,
    callback_url: `${process.env.BASE_URL}/api/v1/donation/payment-callback`,
    return_url: return_url || `${process.env.BASE_URL}/payment-success`,
    "customization[title]": title || "Payment for services",
    "customization[description]": description || "Complete your payment",
  };

  const response = await axios.post(
    `${CHAPA_API_URL}/transaction/initialize`,
    transactionData,
    {
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  return {
    checkout_url: response.data.data.checkout_url,
    // checkout_url: "https://mock-checkout-url.com",
    tx_ref,
  };
}

export async function verifyPayment(tx_ref: string) {
  if (!tx_ref) {
    throw new AppError("Transaction reference is required", 400);
  }

  const response = await axios.get(
    `${CHAPA_API_URL}/transaction/verify/${tx_ref}`,
    { headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` } },
  );

  if (!response.data.data) {
    throw new AppError("Transaction not found", 404);
  }

  // Update donation status based on verification
  const status =
    response.data.data.status === "success" ? "completed" : "failed";
  await prisma.donation.update({
    where: { tx_ref },
    data: { status, ref_id: response.data.data.ref_id },
  });

  return response.data;
}

export async function handleCallback(body: any) {
  const { trx_ref, ref_id, status } = body;

  if (status === "success" && trx_ref) {
    const donation = await prisma.donation.update({
      where: { tx_ref: trx_ref },
      data: {
        status: "completed",
        ref_id,
      },
    });

    sendDonationConfirmation(
      donation.email,
      donation.first_name,
      donation.amount,
      donation.tx_ref,
    ).catch((err) => console.error("Donation email failed:", err));
  }
}

export async function getTransaction(tx_ref: string) {
  const donation = await prisma.donation.findUnique({
    where: { tx_ref },
  });
  if (!donation) {
    throw new AppError("Transaction not found", 404);
  }
  return donation;
}
