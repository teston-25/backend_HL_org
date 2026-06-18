import { z } from "zod";

export const updateBeneficiaryStatsSchema = z.object({
  total_beneficiaries: z.coerce.number().optional(),
  international_referrals: z.coerce.number().optional(),
  annual_target: z.coerce.number().optional(),
});
