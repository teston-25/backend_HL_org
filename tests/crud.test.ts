import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app";
import { mockPrisma } from "./setup";

describe("News Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/news", () => {
    it("should return all news", async () => {
      const mockNews = [
        {
          id: 1,
          title: "Test News",
          slug: "test-news",
          excerpt: "Test excerpt",
          content: "Test content",
          category: "general",
        },
      ];

      mockPrisma.news.findMany.mockResolvedValue(mockNews);

      const response = await request(app).get("/api/v1/news");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.news).toHaveLength(1);
    });
  });

  describe("GET /api/v1/news/:id", () => {
    it("should return news by id", async () => {
      const mockNews = {
        id: 1,
        title: "Test News",
        slug: "test-news",
        excerpt: "Test excerpt",
        content: "Test content",
        category: "general",
      };

      mockPrisma.news.findUnique.mockResolvedValue(mockNews);

      const response = await request(app).get("/api/v1/news/1");

      expect(response.status).toBe(200);
      expect(response.body.data.news.title).toBe("Test News");
    });

    it("should return 404 for non-existent news", async () => {
      mockPrisma.news.findUnique.mockResolvedValue(null);

      const response = await request(app).get("/api/v1/news/999");

      expect(response.status).toBe(404);
    });
  });
});

describe("Contact Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/v1/contacts", () => {
    it("should create contact successfully", async () => {
      const mockContact = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phone_number: "+251911111111",
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
          phone_number: "+251911111111",
          subject: "Test Subject",
          message: "Test Message",
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.contact.name).toBe("John Doe");
    });

    it("should return 400 with missing required fields", async () => {
      const response = await request(app)
        .post("/api/v1/contacts")
        .send({ name: "John Doe" });

      expect(response.status).toBe(400);
    });
  });
});
