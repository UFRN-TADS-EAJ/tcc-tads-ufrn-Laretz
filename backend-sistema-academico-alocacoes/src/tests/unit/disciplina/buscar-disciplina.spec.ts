import { expect, describe, it, beforeEach } from "vitest";
import { BuscarDisciplinaUseCase } from "@/use-cases/disciplina/buscar-disciplina";
import { InMemoryDisciplinasRepository } from "@/repositories/in-memory/in-memory-disciplinas-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

let disciplinasRepository: InMemoryDisciplinasRepository;
let sut: BuscarDisciplinaUseCase;

describe('Buscar Disciplina Use Case', () => {
    beforeEach(() => {
        disciplinasRepository = new InMemoryDisciplinasRepository();
        sut = new BuscarDisciplinaUseCase(disciplinasRepository);
    });

    it('deve ser possível buscar uma disciplina pelo id', async () => {
        const disciplinaCriada = await disciplinasRepository.create({
            nome: 'Matemática',
            carga_horaria: 80,
            curso: {
                connect: {
                    id: 'curso-1'
                }
            }
        });

        const { disciplina } = await sut.execute({
            id: disciplinaCriada.id,
        });

        expect(disciplina.id).toEqual(disciplinaCriada.id);
        expect(disciplina.nome).toEqual('Matemática');
        expect(disciplina.carga_horaria).toEqual(80);
    });

    it('não deve ser possível buscar disciplina com id inexistente', async () => {
        await expect(() =>
            sut.execute({
                id: 'id-inexistente',
            })
        ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
    });
});