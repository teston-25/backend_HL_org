import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../src/app";
import { mockPrisma } from "./setup";

describe("Validation Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Contact Validation", () => {
    it("should pass validation with valid data", async () => {
      const mockContact = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message: "Test Message",
        type: "general inquiry",
      };

      mockPrisma.contact.create.mockResolvedValue(mockContact);

      const response = await request(app)
        .post("/api/v1/contacts")
        .send({
          name: "John Doe",
          email: "john@example.com",
          subject: "Test Subject",
          message: "Test Message",
        });

      expect(response.status).toBe(201);
    });

    it("should fail validation with missing name", async () => {
      const response = await request(app)
        .post("/api/v1/contacts")
        .send({
          email: "john@example.com",
          subject: "Test Subject",
          message: "Test Message",
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("fail");
    });

    it("should fail validation with missing message", async () => {
      const response = await request(app)
        .post("/api/v1/contacts")
        .send({
          name: "John Doe",
          email: "john@example.com",
          subject: "Test Subject",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("Login Validation", () => {
    it("should pass validation with valid credentials", async () => {
      mockPrisma.admin.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/admin/login")
        .send({
          email: "admin@test.com",
          password: "password123",
        });

      // Should fail with 401 (invalid credentials) not 400 (validation error)
      expect(response.status).toBe(401);
    });

    it("should fail validation with invalid email format", async () => {
      const response = await request(app)
        .post("/api/v1/admin/login")
        .send({
          email: "invalid-email",
          password: "password123",
        });

      expect(response.status).toBe(400);
    });

    it("should fail validation with missing password", async () => {
      const response = await request(app)
        .post("/api/v1/admin/login")
        .send({
          email: "admin@test.com",
        });

      expect(response.status).toBe(400);
    });
  });
});
