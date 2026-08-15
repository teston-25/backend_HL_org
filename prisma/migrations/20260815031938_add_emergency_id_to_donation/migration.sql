-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "emergency_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_emergency_id_fkey" FOREIGN KEY ("emergency_id") REFERENCES "Emergency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
