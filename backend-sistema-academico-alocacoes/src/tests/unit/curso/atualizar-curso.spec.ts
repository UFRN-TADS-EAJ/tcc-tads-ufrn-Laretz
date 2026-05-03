import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCursosRepository } from "@/repositories/in-memory/in-memory-cursos-repository";
import { AtualizarCursoUseCase } from "@/use-cases/curso/atualizar-curso";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

let cursosRepository: InMemoryCursosRepository;
let sut: AtualizarCursoUseCase;

describe("Atualizar Curso Use Case", () => {
  beforeEach(() => {
    cursosRepository = new InMemoryCursosRepository();
    sut = new AtualizarCursoUseCase(cursosRepository);
  });

  it("deve ser possível atualizar o nome de um curso", async () => {
    const cursoCriado = await cursosRepository.create({
      codigo: "CC001",
      nome: "Ciência da Computação",
      turno: "MATUTINO",
      duracao_semestres: 8,
      ativo: true,
    });

    const { curso } = await sut.execute({
      id: cursoCriado.id,
      nome: "Ciência da Computação Atualizada",
      turno: undefined,
    });

    expect(curso.nome).toEqual("Ciência da Computação Atualizada");
    expect(curso.turno).toEqual("MATUTINO"); // Deve manter o turno original
    expect(curso.codigo).toEqual("CC001"); // Deve manter o código original
  });

  it("deve ser possível atualizar o turno de um curso", async () => {
    const cursoCriado = await cursosRepository.create({
      codigo: "ES001",
      nome: "Engenharia de Software",
      turno: "MATUTINO",
      duracao_semestres: 8,
      ativo: true,
    });

    const { curso } = await sut.execute({
      id: cursoCriado.id,
      nome: undefined,
      turno: "NOTURNO",
    });

    expect(curso.turno).toEqual("NOTURNO");
    expect(curso.nome).toEqual("Engenharia de Software"); // Deve manter o nome original
  });

  it("deve ser possível atualizar nome e turno simultaneamente", async () => {
    const cursoCriado = await cursosRepository.create({
      codigo: "TEC001",
      nome: "Tecnólogo em Sistemas",
      turno: "VESPERTINO",
      duracao_semestres: 6,
      ativo: true,
    });

    const { curso } = await sut.execute({
      id: cursoCriado.id,
      nome: "Tecnólogo em Análise e Desenvolvimento",
      turno: "INTEGRAL",
    });

    expect(curso.nome).toEqual("Tecnólogo em Análise e Desenvolvimento");
    expect(curso.turno).toEqual("INTEGRAL");
    expect(curso.codigo).toEqual("TEC001"); // Deve manter o código original
    expect(curso.duracao_semestres).toEqual(6); // Deve manter a duração original
  });

  it("não deve ser possível atualizar um curso inexistente", async () => {
    await expect(() =>
      sut.execute({
        id: "id-inexistente",
        nome: "Nome Qualquer",
        turno: "MATUTINO",
      })
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it("deve manter os dados originais quando não há campos para atualizar", async () => {
    const cursoCriado = await cursosRepository.create({
      codigo: "ADM001",
      nome: "Administração",
      turno: "NOTURNO",
      duracao_semestres: 8,
      ativo: true,
    });

    const { curso } = await sut.execute({
      id: cursoCriado.id,
      nome: undefined,
      turno: undefined,
    });

    expect(curso.nome).toEqual("Administração");
    expect(curso.turno).toEqual("NOTURNO");
    expect(curso.codigo).toEqual("ADM001");
    expect(curso.duracao_semestres).toEqual(8);
  });

  it("deve atualizar apenas os campos fornecidos", async () => {
    const cursoCriado = await cursosRepository.create({
      codigo: "DIR001",
      nome: "Direito",
      turno: "MATUTINO",
      duracao_semestres: 10,
      ativo: true,
    });

    // Atualizar apenas o nome
    const { curso: cursoComNomeAtualizado } = await sut.execute({
      id: cursoCriado.id,
      nome: "Direito Empresarial",
      turno: undefined,
    });

    expect(cursoComNomeAtualizado.nome).toEqual("Direito Empresarial");
    expect(cursoComNomeAtualizado.turno).toEqual("MATUTINO");

    // Atualizar apenas o turno
    const { curso: cursoComTurnoAtualizado } = await sut.execute({
      id: cursoCriado.id,
      nome: undefined,
      turno: "VESPERTINO",
    });

    expect(cursoComTurnoAtualizado.nome).toEqual("Direito Empresarial"); // Nome já atualizado anteriormente
    expect(cursoComTurnoAtualizado.turno).toEqual("VESPERTINO");
  });
});
