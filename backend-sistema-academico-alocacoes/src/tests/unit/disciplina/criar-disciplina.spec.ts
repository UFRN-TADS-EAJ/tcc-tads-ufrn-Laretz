import { expect, describe, it, beforeEach } from "vitest";
import { CriarDisciplinaUseCase } from "@/use-cases/disciplina/criar-disciplina";
import { InMemoryDisciplinasRepository } from "@/repositories/in-memory/in-memory-disciplinas-repository";

let disciplinasRepository: InMemoryDisciplinasRepository;
let sut: CriarDisciplinaUseCase;

describe("Criar Disciplina Use Case", () => {
  beforeEach(() => {
    disciplinasRepository = new InMemoryDisciplinasRepository();
    sut = new CriarDisciplinaUseCase(disciplinasRepository);
  });

  it("deve ser possível criar uma nova disciplina", async () => {
    const { disciplina } = await sut.execute({
      nome: "Matemática",
      carga_horaria: 90,
      id_curso: "curso-id-teste",
    });

    expect(disciplina.id).toEqual(expect.any(String));
    expect(disciplina.nome).toEqual("Matemática");
    expect(disciplina.carga_horaria).toEqual(90);
    expect(disciplina.total_aulas).toEqual(108);
  });

  it("deve ser possível criar disciplinas com nomes diferentes", async () => {
    const { disciplina: disciplina1 } = await sut.execute({
      nome: "Matemática",
      carga_horaria: 90,
      id_curso: "curso-id-teste-1",
    });

    const { disciplina: disciplina2 } = await sut.execute({
      nome: "Física",
      carga_horaria: 60,
      id_curso: "curso-id-teste-2",
    });

    expect(disciplina1.nome).toEqual("Matemática");
    expect(disciplina1.carga_horaria).toEqual(90);
    expect(disciplina1.total_aulas).toEqual(108);
    expect(disciplina2.nome).toEqual("Física");
    expect(disciplina2.carga_horaria).toEqual(60);
    expect(disciplina2.total_aulas).toEqual(72);
    expect(disciplina1.id).not.toEqual(disciplina2.id);
  });
});
