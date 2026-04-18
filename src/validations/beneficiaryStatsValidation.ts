import { z } from "zod";

export const updateBeneficiaryStatsSchema = z.object({
  total_beneficiaries: z.coerce.number().optional(),
  countries_count: z.coerce.number().optional(),
  water_projects: z.coerce.number().optional(),
});
