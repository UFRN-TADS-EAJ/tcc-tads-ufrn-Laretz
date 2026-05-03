import { expect, describe, it, beforeEach } from "vitest";
import { ExcluirDisciplinaUseCase } from "@/use-cases/disciplina/excluir-disciplina";
import { InMemoryDisciplinasRepository } from "@/repositories/in-memory/in-memory-disciplinas-repository";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

let disciplinasRepository: InMemoryDisciplinasRepository;
let sut: ExcluirDisciplinaUseCase;

describe('Excluir Disciplina Use Case', () => {
    beforeEach(() => {
        disciplinasRepository = new InMemoryDisciplinasRepository();
        sut = new ExcluirDisciplinaUseCase(disciplinasRepository);
    });

    it('deve ser possível excluir uma disciplina', async () => {
        const disciplinaCriada = await disciplinasRepository.create({
            nome: 'Matemática',
            carga_horaria: 80,
            curso: {
                connect: {
                    id: 'curso-1'
                }
            }
        });

        await sut.execute({
            id: disciplinaCriada.id,
        });

        // Verifica se a disciplina foi realmente excluída
        const disciplinaExcluida = await disciplinasRepository.findById(disciplinaCriada.id);
        expect(disciplinaExcluida).toBeNull();
    });

    it('não deve ser possível excluir disciplina com id inexistente', async () => {
        await expect(() =>
            sut.execute({
                id: 'id-inexistente',
            })
        ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
    });

    it('deve ser possível excluir uma disciplina e manter outras intactas', async () => {
        const disciplina1 = await disciplinasRepository.create({
            nome: 'Matemática',
            carga_horaria: 80,
            curso: {
                connect: {
                    id: 'curso-1'
                }
            }
        });

        const disciplina2 = await disciplinasRepository.create({
            nome: 'Física',
            carga_horaria: 60,
            curso: {
                connect: {
                    id: 'curso-1'
                }
            }
        });

        await sut.execute({
            id: disciplina1.id,
        });

        // Verifica se apenas a disciplina1 foi excluída
        const disciplina1Excluida = await disciplinasRepository.findById(disciplina1.id);
        const disciplina2Mantida = await disciplinasRepository.findById(disciplina2.id);

        expect(disciplina1Excluida).toBeNull();
        expect(disciplina2Mantida).not.toBeNull();
        expect(disciplina2Mantida?.nome).toEqual('Física');
    });
});