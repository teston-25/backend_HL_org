/*
  Warnings:

  - A unique constraint covering the columns `[tx_ref]` on the table `Donation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tx_ref` to the `Donation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Donation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "ref_id" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "tx_ref" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Donation_tx_ref_key" ON "Donation"("tx_ref");
