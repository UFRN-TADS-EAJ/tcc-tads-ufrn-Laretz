export class PossuiDependenciasError extends Error {
  constructor(entidade: string = 'recurso') {
    super(`Não é possível excluir o ${entidade} pois existem vínculos associados a ele.`);
  }
}