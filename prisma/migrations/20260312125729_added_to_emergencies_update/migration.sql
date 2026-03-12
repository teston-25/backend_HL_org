/*
  Warnings:

  - Added the required column `location` to the `Emergency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Emergency` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Emergency" ADD COLUMN     "aid_deployed" DOUBLE PRECISION,
ADD COLUMN     "aid_unit" TEXT,
ADD COLUMN     "goal_amount" DOUBLE PRECISION,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
