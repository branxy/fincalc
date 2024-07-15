import { FinancePeriod } from "../types";
import { v4 as uuidv4 } from "uuid";

export async function uploadPeriod(
  period: Omit<FinancePeriod, "id">,
): Promise<FinancePeriod> {
  const id = uuidv4();
  const newPeriod: FinancePeriod = { id, ...period };
  return new Promise((resolve) => resolve(newPeriod));
}
