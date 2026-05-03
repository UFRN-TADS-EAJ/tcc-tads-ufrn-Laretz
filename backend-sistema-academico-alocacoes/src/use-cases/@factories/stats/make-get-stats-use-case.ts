import { GetStatsUseCase } from "@/use-cases/stats/get-stats";

export function makeGetStatsUseCase() {
  return new GetStatsUseCase();
}
