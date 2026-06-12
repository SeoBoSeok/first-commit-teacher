// Prisma 클라이언트 싱글톤 — Next.js 개발 모드의 핫 리로드마다 새 연결이 생기는 것을 방지.
// (이 패턴이 없으면 dev 중 "too many connections"로 DB가 막힌다 — 공식 권장 패턴)
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
