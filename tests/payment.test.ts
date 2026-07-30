import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../src/app";
import { mockPrisma } from "./setup";

// Mock axios
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import axios from "axios";

describe("Payment Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/v1/donation/initialize-payment", () => {
    it("should initialize payment successfully", async () => {
      const mockDonation = {
        id: 1,
        amount: 1000,
        email: "test@example.com",
        first_name: "John",
        last_name: "Doe",
        tx_ref: "TX-123456",
        status: "pending",
      };

      mockPrisma.donation.create.mockResolvedValue(mockDonation);
      (axios.post as any).mockResolvedValue({
        data: {
          data: {
            checkout_url: "https://checkout.chapa.co/checkout/123",
          },
        },
      });

      const response = await request(app)
        .post("/api/v1/donation/initialize-payment")
        .send({
          amount: 1000,
          email: "test@example.com",
          first_name: "John",
          last_name: "Doe",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.checkout_url).toBeDefined();
      expect(response.body.tx_ref).toBeDefined();
    });

    it("should return 400 with missing required fields", async () => {
      const response = await request(app)
        .post("/api/v1/donation/initialize-payment")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(400);
    });

    it("should return 400 with missing email", async () => {
      const response = await request(app)
        .post("/api/v1/donation/initialize-payment")
        .send({ amount: 1000 });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/v1/donation/verify-payment/:tx_ref", () => {
    it("should verify payment successfully", async () => {
      const mockChapaResponse = {
        data: {
          data: {
            status: "success",
            ref_id: "REF-123",
          },
        },
      };

      (axios.get as any).mockResolvedValue(mockChapaResponse);
      mockPrisma.donation.update.mockResolvedValue({});

      const response = await request(app)
        .get("/api/v1/donation/verify-payment/TX-123456");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return 400 with invalid tx_ref format", async () => {
      const response = await request(app)
        .get("/api/v1/donation/verify-payment/");

      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/v1/donation/transaction-status/:tx_ref", () => {
    it("should get transaction status", async () => {
      const mockDonation = {
        id: 1,
        amount: 1000,
        email: "test@example.com",
        tx_ref: "TX-123456",
        status: "completed",
      };

      mockPrisma.donation.findUnique.mockResolvedValue(mockDonation);

      const response = await request(app)
        .get("/api/v1/donation/transaction-status/TX-123456");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tx_ref).toBe("TX-123456");
    });

    it("should return 404 for non-existent transaction", async () => {
      mockPrisma.donation.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/v1/donation/transaction-status/TX-NONEXISTENT");

      expect(response.status).toBe(404);
    });
  });
});
