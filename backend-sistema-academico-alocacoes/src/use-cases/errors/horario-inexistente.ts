export class HorarioInexistenteError extends Error {
  constructor() {
    super("O horário informado não existe.");
    this.name = "HorarioInexistenteError";
  }
}
