/*
  Warnings:

  - You are about to drop the column `created_at` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `deposit_amount` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `AuditLog` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Emergency` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `action` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adminId` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Emergency` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "created_at",
DROP COLUMN "deposit_amount",
DROP COLUMN "reference",
DROP COLUMN "source",
ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "adminId" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "details" TEXT,
ADD COLUMN     "entity" TEXT NOT NULL,
ADD COLUMN     "entityId" INTEGER;

-- AlterTable
ALTER TABLE "Emergency" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Emergency_slug_key" ON "Emergency"("slug");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
