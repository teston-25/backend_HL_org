import { z } from "zod";

export const updateBeneficiaryStatsSchema = z.object({
  total_beneficiaries: z.number().int().nonnegative().optional(),
  countries_count: z.number().int().nonnegative().optional(),
  water_projects: z.number().int().nonnegative().optional(),
});
