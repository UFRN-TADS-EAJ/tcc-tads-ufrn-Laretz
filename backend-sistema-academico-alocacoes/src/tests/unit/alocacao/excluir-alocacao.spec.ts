import { expect, describe, it, beforeEach } from "vitest";
import { ExcluirAlocacaoUseCase } from "@/use-cases/alocacao/excluir-alocacao";
import { InMemoryAlocacoesRepository } from "@/repositories/in-memory/in-memory-alocacoes-repository";
import { InMemoryDisciplinasRepository } from "@/repositories/in-memory/in-memory-disciplinas-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";
import { InMemoryPeriodosLetivosRepository } from "@/repositories/in-memory/in-memory-periodos-letivos-repository";

let alocacoesRepository: InMemoryAlocacoesRepository;
let disciplinasRepository: InMemoryDisciplinasRepository;
let periodosRepository: InMemoryPeriodosLetivosRepository;
let sut: ExcluirAlocacaoUseCase;

describe('Excluir Alocação Use Case', () => {
    beforeEach(() => {
        alocacoesRepository = new InMemoryAlocacoesRepository();
        disciplinasRepository = new InMemoryDisciplinasRepository();
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
        sut = new ExcluirAlocacaoUseCase(
            alocacoesRepository,
            disciplinasRepository,
            periodosRepository,
        );
    });

    it('deve ser possível excluir uma alocação', async () => {
        // Criar disciplina primeiro
        await disciplinasRepository.create({
            id: 'disciplina-1',
            nome: 'Matemática',
            carga_horaria: 80,
            curso: {
                connect: {
                    id: 'curso-1',
                },
            },
        });

        const alocacaoCriada = await alocacoesRepository.createWithCustomData({
            id: 'alocacao-1',
            id_user: 'user-1',
            id_disciplina: 'disciplina-1',
            id_turma: 'turma-1',
            id_sala: 'sala-1',
            id_horario: 'horario-1',
        });

        await sut.execute({
            id: alocacaoCriada.id,
        });

        // Verifica se a alocação foi realmente excluída
        const alocacaoExcluida = await alocacoesRepository.findById(
            alocacaoCriada.id,
            "periodo-1",
        );
        expect(alocacaoExcluida).toBeNull();
    });

    it('não deve ser possível excluir alocação com id inexistente', async () => {
        await expect(() =>
            sut.execute({
                id: 'id-inexistente',
            })
        ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
    });

    it('deve ser possível excluir uma alocação e manter outras intactas', async () => {
        // Criar disciplinas primeiro
        await disciplinasRepository.create({
            id: 'disciplina-1',
            nome: 'Matemática',
            carga_horaria: 80,
            curso: {
                connect: {
                    id: 'curso-1',
                },
            },
        });

        await disciplinasRepository.create({
            id: 'disciplina-2',
            nome: 'Física',
            carga_horaria: 60,
            curso: {
                connect: {
                    id: 'curso-2',
                },
            },
        });

        const alocacao1 = await alocacoesRepository.createWithCustomData({
            id: 'alocacao-1',
            id_user: 'user-1',
            id_disciplina: 'disciplina-1',
            id_turma: 'turma-1',
            id_sala: 'sala-1',
            id_horario: 'horario-1',
        });

        const alocacao2 = await alocacoesRepository.createWithCustomData({
            id: 'alocacao-2',
            id_user: 'user-2',
            id_disciplina: 'disciplina-2',
            id_turma: 'turma-2',
            id_sala: 'sala-2',
            id_horario: 'horario-2',
        });

        await sut.execute({
            id: alocacao1.id,
        });

        // Verifica se apenas a alocacao1 foi excluída
        const alocacao1Excluida = await alocacoesRepository.findById(
            alocacao1.id,
            "periodo-1",
        );
        const alocacao2Mantida = await alocacoesRepository.findById(
            alocacao2.id,
            "periodo-1",
        );

        expect(alocacao1Excluida).toBeNull();
        expect(alocacao2Mantida).not.toBeNull();
        expect(alocacao2Mantida?.id_user).toEqual('user-2');
    });
});
