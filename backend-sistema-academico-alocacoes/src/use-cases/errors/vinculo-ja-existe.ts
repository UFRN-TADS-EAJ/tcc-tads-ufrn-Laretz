export class VinculoJaExisteError extends Error {
  constructor() {
    super("Vínculo já existe");
  }
}
