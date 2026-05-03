export class DadosInvalidosError extends Error {
  constructor(message?: string) {
    super(message || 'Os dados fornecidos são inválidos.');
  }
}