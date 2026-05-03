export class CodigoJaExisteError extends Error {
  constructor(entidade: string = 'recurso') {
    super(`Já existe um ${entidade} com este código.`);
  }
}