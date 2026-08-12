import { vi } from "vitest";

// Mock Prisma client
const mockPrisma = {
  admin: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  donation: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    aggregate: vi.fn(),
  },
  news: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  contact: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  emergency: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    aggregate: vi.fn(),
  },
  beneficiaryStats: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  transparencyFile: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  auditLog: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

// Mock the prisma module
vi.mock("../src/config/prisma", () => ({
  default: mockPrisma,
}));

// Mock email validation to avoid DNS lookups in tests
vi.mock("../src/validations/emailValidation", () => ({
  isEmailDeliverable: vi.fn().mockResolvedValue(true),
}));

// Mock donation email service
vi.mock("../src/services/donationEmail", () => ({
  sendDonationConfirmation: vi.fn().mockResolvedValue(true),
}));

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key";
process.env.CHAPA_SECRET_KEY = "test-chapa-secret";
process.env.CHAPA_ENCRYPTION_KEY = "test-chapa-encryption";
process.env.BASE_URL = "http://localhost:5001";
process.env.CORS_ORIGIN = "http://localhost:3000";

// Export mock for use in tests
export { mockPrisma };
