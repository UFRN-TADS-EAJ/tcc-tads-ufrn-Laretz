export class DataIncompativelDiaSemanaError extends Error {
  constructor(
    public diaSelecionado: string,
    public esperado: string
  ) {
    super("A data informada não condiz com o dia da semana do horário.");
    this.name = "DataIncompativelDiaSemanaError";
  }
}
