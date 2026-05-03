export class PeriodoEncerradoError extends Error {
  constructor() {
    super("Período letivo encerrado. Não é permitido ativar este período.");
  }
}

