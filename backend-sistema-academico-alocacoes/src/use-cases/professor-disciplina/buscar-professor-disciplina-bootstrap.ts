import { DisciplinasRepository } from "@/repositories/disciplinas-repository";
import { UsersRepository } from "@/repositories/users-repository";
import type { ProfessorDisciplinaBootstrapResponse } from "@/schemas/professor-disciplina";

export class BuscarProfessorDisciplinaBootstrapUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private disciplinasRepository: DisciplinasRepository,
  ) {}

  async execute(): Promise<ProfessorDisciplinaBootstrapResponse> {
    const pageSize = 20;
    const maxPages = 50;

    const usuarios: any[] = [];
    for (let page = 1; page <= maxPages; page++) {
      const chunk = await this.usersRepository.findMany(page);
      usuarios.push(...chunk);
      if (chunk.length < pageSize) break;
    }

    const professores = usuarios
      .filter((u) => u?.role === "PROFESSOR")
      .map((u) => ({
        id: String(u.id),
        nome: String(u.nome),
        email: String(u.email),
        especializacao: u.especializacao ?? null,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome));

    const disciplinas = await this.disciplinasRepository.findAll();

    const cursosMap = new Map<string, { id: string; nome: string; codigo: string }>();
    disciplinas.forEach((d: any) => {
      const c = d?.curso;
      if (!c?.id) return;
      const id = String(c.id);
      if (!cursosMap.has(id)) {
        cursosMap.set(id, {
          id,
          nome: String(c.nome),
          codigo: String(c.codigo),
        });
      }
    });

    const cursos = Array.from(cursosMap.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome),
    );

    return {
      professores,
      disciplinas: disciplinas.map((d: any) => ({
        id: String(d.id),
        nome: String(d.nome),
        codigo: d.codigo ?? null,
        carga_horaria: Number(d.carga_horaria ?? 0),
        tipo_de_sala: d.tipo_de_sala === "Lab" ? "Lab" : "Sala",
        semestre: Number(d.semestre ?? 0),
        obrigatoria: Boolean(d.obrigatoria ?? true),
        curso: {
          id: String(d.curso?.id || ""),
          nome: String(d.curso?.nome || ""),
          codigo: String(d.curso?.codigo || ""),
        },
      })),
      cursos,
    };
  }
}

