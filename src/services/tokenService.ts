import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma";

const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";

interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

export const generateTokens = (payload: TokenPayload) => ({
  accessToken: jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL }),
  refreshToken: jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TTL }),
});

export const hashToken = (token: string) => bcrypt.hash(token, 10);

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
};

export const saveRefreshToken = async (adminId: number, refreshToken: string) => {
  const hash = await hashToken(refreshToken);
  await prisma.admin.update({
    where: { id: adminId },
    data: { refreshTokenHash: hash },
  });
};

export const rotateRefreshToken = async (oldRefreshToken: string) => {
  const payload = verifyRefreshToken(oldRefreshToken);
  const admin = await prisma.admin.findUnique({ where: { id: payload.id } });

  if (!admin?.refreshTokenHash) {
    throw new Error("Invalid refresh token");
  }

  const valid = await bcrypt.compare(oldRefreshToken, admin.refreshTokenHash);
  if (!valid) {
    throw new Error("Invalid refresh token");
  }

  const tokens = generateTokens({ id: admin.id, email: admin.email, role: admin.role });
  await saveRefreshToken(admin.id, tokens.refreshToken);
  return tokens;
};

export const invalidateRefreshToken = async (adminId: number) => {
  await prisma.admin.update({
    where: { id: adminId },
    data: { refreshTokenHash: null },
  });
};
