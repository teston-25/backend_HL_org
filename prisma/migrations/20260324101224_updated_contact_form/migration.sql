-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "phone_number" TEXT,
ALTER COLUMN "email" DROP NOT NULL;
