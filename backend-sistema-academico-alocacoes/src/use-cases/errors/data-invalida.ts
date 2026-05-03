export class DataInvalidaError extends Error {
  constructor(message = "A data informada é inválida.") {
    super(message);
    this.name = "DataInvalidaError";
  }
}
