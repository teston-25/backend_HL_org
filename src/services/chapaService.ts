import axios from "axios";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import AppError from "./AppError";
import prisma from "../config/prisma";
import { sendDonationConfirmation } from "./donationEmail";

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY!;
const CHAPA_API_URL = "https://api.chapa.co/v1";

// Adds a completed donation's amount to its linked emergency's raised_amount.
// If the goal is reached the emergency is auto-resolved (removed from the
// active emergencies list), mirroring the admin update behavior.
async function creditEmergencyFunding(
  tx: Prisma.TransactionClient,
  donation: { emergency_id: number | null; amount: number },
) {
  if (!donation.emergency_id) return;

  const emergency = await tx.emergency.findUnique({
    where: { id: donation.emergency_id },
  });
  if (!emergency) return;

  const newRaised = (emergency.raised_amount ?? 0) + donation.amount;
  const reachedGoal =
    emergency.goal_amount != null &&
    emergency.goal_amount > 0 &&
    newRaised >= emergency.goal_amount;

  await tx.emergency.update({
    where: { id: emergency.id },
    data: {
      raised_amount: newRaised,
      ...(reachedGoal && emergency.status !== "RESOLVED"
        ? { status: "RESOLVED" }
        : {}),
    },
  });
}

export async function initPayment(data: any) {
  const {
    amount,
    email,
    first_name,
    last_name,
    phone_number,
    title,
    description,
    emergency_id,
    return_url,
  } = data;
  if (!amount || !email) {
    throw new AppError("Amount and email are required", 400);
  }

  const tx_ref =
    "TX-" + Date.now() + "-" + crypto.randomBytes(4).toString("hex");

  // Create donation record in database
  await prisma.donation.create({
    data: {
      amount: parseFloat(amount),
      email,
      first_name,
      last_name,
      phone_number,
      title,
      description,
      emergency_id: emergency_id ? Number(emergency_id) : null,
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

  const existing = await prisma.donation.findUnique({
    where: { tx_ref },
  });
  if (!existing) {
    throw new AppError("Transaction not found", 404);
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

  const wasPending = existing.status === "pending";

  await prisma.$transaction(async (tx) => {
    const donation = await tx.donation.update({
      where: { tx_ref },
      data: { status, ref_id: response.data.data.ref_id },
    });

    if (wasPending && status === "completed") {
      await creditEmergencyFunding(tx, donation);
    }
  });

  return response.data;
}

export async function handleCallback(body: any) {
  const { trx_ref, ref_id, status } = body;

  if (status === "success" && trx_ref) {
    const existing = await prisma.donation.findUnique({
      where: { tx_ref: trx_ref },
    });

    if (existing) {
      if (existing.status !== "completed") {
        await prisma.$transaction(async (tx) => {
          const donation = await tx.donation.update({
            where: { tx_ref: trx_ref },
            data: {
              status: "completed",
              ref_id,
            },
          });

          await creditEmergencyFunding(tx, donation);
        });
      }

      sendDonationConfirmation(
        existing.email,
        existing.first_name,
        existing.amount,
        existing.tx_ref,
      ).catch((err) => console.error("Donation email failed:", err));
    }
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
