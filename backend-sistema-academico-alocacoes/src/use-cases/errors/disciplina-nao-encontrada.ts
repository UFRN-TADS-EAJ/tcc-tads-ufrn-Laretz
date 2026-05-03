export class DisciplinaNaoEncontradaError extends Error {
  constructor() {
    super("Disciplina não encontrada");
  }
}
