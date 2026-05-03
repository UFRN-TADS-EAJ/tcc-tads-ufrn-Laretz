import { describe, it, expect } from 'vitest';
import { PossuiDependenciasError } from '@/use-cases/errors/possui-dependencias';

describe('Erros — PossuiDependenciasError (teste direto)', () => {
  it('deve instanciar e lançar PossuiDependenciasError corretamente', async () => {
    const error = new PossuiDependenciasError('disciplina');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('Error');
    expect(typeof error.message).toBe('string');

    try {
      throw error;
    } catch (e: any) {
      expect(e).toBeInstanceOf(PossuiDependenciasError);
      expect(e.stack).toEqual(expect.any(String));
    }
  });
});
