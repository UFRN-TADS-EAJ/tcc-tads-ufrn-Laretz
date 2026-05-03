export class UserCursoAlreadyExistsError extends Error {
  constructor() {
    super("Vínculo entre usuário e curso já existe.");
  }
}