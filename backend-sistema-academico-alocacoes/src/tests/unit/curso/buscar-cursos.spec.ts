import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCursosRepository } from "@/repositories/in-memory/in-memory-cursos-repository";
import { BuscarCursosUseCase } from "@/use-cases/curso/buscar-cursos";

let cursosRepository: InMemoryCursosRepository;
let sut: BuscarCursosUseCase;

describe("Buscar Cursos Use Case", () => {
  beforeEach(() => {
    cursosRepository = new InMemoryCursosRepository();
    sut = new BuscarCursosUseCase(cursosRepository);
  });

  it("deve ser possível buscar cursos com paginação", async () => {
    // Criar alguns cursos para teste
    await cursosRepository.create({
      codigo: "CC001",
      nome: "Ciência da Computação",
      turno: "MATUTINO",
      duracao_semestres: 8,
      ativo: true,
    });

    await cursosRepository.create({
      codigo: "ES001",
      nome: "Engenharia de Software",
      turno: "NOTURNO",
      duracao_semestres: 8,
      ativo: true,
    });

    const { cursos } = await sut.execute();

    expect(cursos).toHaveLength(2);
    expect(cursos[0]).toEqual(
      expect.objectContaining({
        codigo: "CC001",
        nome: "Ciência da Computação",
      })
    );
    expect(cursos[1]).toEqual(
      expect.objectContaining({
        codigo: "ES001",
        nome: "Engenharia de Software",
      })
    );
  });

  it("deve retornar array vazio quando não há cursos", async () => {
    const { cursos } = await sut.execute();

    expect(cursos).toHaveLength(0);
    expect(cursos).toEqual([]);
  });

  it("deve funcionar com diferentes páginas", async () => {
    // Criar vários cursos
    for (let i = 1; i <= 5; i++) {
      await cursosRepository.create({
        codigo: `CURSO${i.toString().padStart(3, "0")}`,
        nome: `Curso ${i}`,
        turno: "MATUTINO",
        duracao_semestres: 8,
        ativo: true,
      });
    }

    const { cursos: cursosPage1 } = await sut.execute();

    const { cursos: cursosPage2 } = await sut.execute();

    expect(cursosPage1).toBeDefined();
    expect(cursosPage2).toBeDefined();
    expect(Array.isArray(cursosPage1)).toBe(true);
    expect(Array.isArray(cursosPage2)).toBe(true);
  });

  it("deve retornar cursos com todas as propriedades esperadas", async () => {
    await cursosRepository.create({
      codigo: "TEC001",
      nome: "Tecnólogo em Sistemas",
      turno: "NOTURNO",
      duracao_semestres: 6,
      ativo: true,
    });

    const { cursos } = await sut.execute();

    expect(cursos[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        codigo: "TEC001",
        nome: "Tecnólogo em Sistemas",
        turno: "NOTURNO",
        duracao_semestres: 6,
        ativo: true,
        created_at: expect.any(Date),
      })
    );
  });
});
