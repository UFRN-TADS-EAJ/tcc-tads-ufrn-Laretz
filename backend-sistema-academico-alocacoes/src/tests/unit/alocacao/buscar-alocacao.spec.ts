import { expect, describe, it, beforeEach } from "vitest";
import { BuscarAlocacaoUseCase } from "@/use-cases/alocacao/buscar-alocacao";
import { InMemoryAlocacoesRepository } from "@/repositories/in-memory/in-memory-alocacoes-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";
import { InMemoryPeriodosLetivosRepository } from "@/repositories/in-memory/in-memory-periodos-letivos-repository";

let alocacoesRepository: InMemoryAlocacoesRepository;
let periodosRepository: InMemoryPeriodosLetivosRepository;
let sut: BuscarAlocacaoUseCase;

describe('Buscar Alocação Use Case', () => {
    beforeEach(() => {
        alocacoesRepository = new InMemoryAlocacoesRepository();
        periodosRepository = new InMemoryPeriodosLetivosRepository();
        periodosRepository.items.push({
            id: "periodo-1",
            nome: "2026.1",
            data_inicio: new Date("2026-02-01T00:00:00.000Z"),
            data_fim: new Date("2026-07-31T00:00:00.000Z"),
            ativo: true,
            created_at: new Date(),
            updated_at: new Date(),
        });
        sut = new BuscarAlocacaoUseCase(alocacoesRepository, periodosRepository);
    });

    it('deve ser possível buscar uma alocação pelo id', async () => {
        const alocacaoCriada = await alocacoesRepository.createWithCustomData({
            id: 'alocacao-1',
            id_user: 'user-1',
            id_disciplina: 'disciplina-1',
            id_turma: 'turma-1',
            id_sala: 'sala-1',
            id_horario: 'horario-1',
        });

        const { alocacao } = await sut.execute({
            id: alocacaoCriada.id,
        });

        expect(alocacao.id).toEqual(alocacaoCriada.id);
        expect(alocacao.id_user).toEqual('user-1');
        expect(alocacao.id_disciplina).toEqual('disciplina-1');
        expect(alocacao.id_turma).toEqual('turma-1');
        expect(alocacao.id_sala).toEqual('sala-1');
        expect(alocacao.id_horario).toEqual('horario-1');
    });

    it('não deve ser possível buscar alocação com id inexistente', async () => {
        await expect(() =>
            sut.execute({
                id: 'id-inexistente',
            })
        ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
    });
});
