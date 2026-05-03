export class ConflitoReservaAlocacaoError extends Error {
  constructor(
    public conflicts: { type: "ALOCACAO" | "RESERVA"; date?: string }[]
  ) {
    super("Conflito de alocação ou reserva.");
    this.name = "ConflitoReservaAlocacaoError";
  }
}
