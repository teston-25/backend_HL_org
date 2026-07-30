import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import app from "../src/app";
import { mockPrisma } from "./setup";

describe("Auth Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/v1/admin/login", () => {
    it("should login successfully with valid credentials", async () => {
      const hashedPassword = await bcrypt.hash("password123", 12);
      mockPrisma.admin.findUnique.mockResolvedValue({
        id: 1,
        email: "admin@test.com",
        password_hash: hashedPassword,
        role: "ADMIN",
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const response = await request(app)
        .post("/api/v1/admin/login")
        .send({ email: "admin@test.com", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.data.admin.email).toBe("admin@test.com");
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should return 401 with invalid email", async () => {
      mockPrisma.admin.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/admin/login")
        .send({ email: "wrong@test.com", password: "password123" });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe("fail");
    });

    it("should return 401 with invalid password", async () => {
      const hashedPassword = await bcrypt.hash("password123", 12);
      mockPrisma.admin.findUnique.mockResolvedValue({
        id: 1,
        email: "admin@test.com",
        password_hash: hashedPassword,
        role: "ADMIN",
      });

      const response = await request(app)
        .post("/api/v1/admin/login")
        .send({ email: "admin@test.com", password: "wrongpassword" });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe("fail");
    });

    it("should return 400 with missing fields", async () => {
      const response = await request(app)
        .post("/api/v1/admin/login")
        .send({ email: "admin@test.com" });

      expect(response.status).toBe(400);
    });
  });

  describe("Authentication Middleware", () => {
    it("should access protected route with valid token", async () => {
      const token = jwt.sign(
        { id: 1, email: "admin@test.com", role: "ADMIN" },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );

      mockPrisma.admin.findMany.mockResolvedValue([
        { id: 1, email: "admin@test.com", role: "ADMIN" },
      ]);

      const response = await request(app)
        .get("/api/v1/admin")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/v1/admin");

      expect(response.status).toBe(401);
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .get("/api/v1/admin")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });
  });

  describe("Role-Based Access Control", () => {
    it("should allow SUPER_ADMIN to create admin", async () => {
      const token = jwt.sign(
        { id: 1, email: "super@test.com", role: "SUPER_ADMIN" },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );

      mockPrisma.admin.findFirst.mockResolvedValue(null);
      mockPrisma.admin.create.mockResolvedValue({
        id: 2,
        email: "new@test.com",
        role: "ADMIN",
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const response = await request(app)
        .post("/api/v1/admin")
        .set("Authorization", `Bearer ${token}`)
        .send({ email: "new@test.com", password: "Password@123", role: "ADMIN" });

      expect(response.status).toBe(201);
      expect(response.body.data.admin.email).toBe("new@test.com");
    });

    it("should return 403 when ADMIN tries to create admin", async () => {
      const token = jwt.sign(
        { id: 1, email: "admin@test.com", role: "ADMIN" },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );

      const response = await request(app)
        .post("/api/v1/admin")
        .set("Authorization", `Bearer ${token}`)
        .send({ email: "new@test.com", password: "password123" });

      expect(response.status).toBe(403);
    });
  });
});
