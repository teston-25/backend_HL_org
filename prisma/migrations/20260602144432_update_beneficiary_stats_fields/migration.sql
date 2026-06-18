/*
  Warnings:

  - You are about to drop the column `countries_count` on the `BeneficiaryStats` table. All the data in the column will be lost.
  - You are about to drop the column `water_projects` on the `BeneficiaryStats` table. All the data in the column will be lost.
  - Added the required column `annual_target` to the `BeneficiaryStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `international_referrals` to the `BeneficiaryStats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BeneficiaryStats" DROP COLUMN "countries_count",
DROP COLUMN "water_projects",
ADD COLUMN     "annual_target" INTEGER NOT NULL,
ADD COLUMN     "international_referrals" INTEGER NOT NULL;
