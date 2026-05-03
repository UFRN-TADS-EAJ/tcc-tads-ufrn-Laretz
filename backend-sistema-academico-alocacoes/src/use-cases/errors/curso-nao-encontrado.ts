export class CursoNaoEncontradoError extends Error {
  constructor() {
    super("Curso não encontrado");
  }
}
