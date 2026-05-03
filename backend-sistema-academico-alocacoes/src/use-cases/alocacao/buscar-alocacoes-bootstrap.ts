import type { RegimeHorario } from "@prisma/client";
import type { TurmasRepository } from "@/repositories/turmas-repository";
import type { SalasRepository } from "@/repositories/salas-repository";
import type { UsersRepository } from "@/repositories/users-repository";
import type { HorariosRepository } from "@/repositories/horarios-repository";
import type { DisciplinasRepository } from "@/repositories/disciplinas-repository";
import type { AlocacoesBootstrapQueryRequest, AlocacoesBootstrapResponse } from "@/schemas";

export class BuscarAlocacoesBootstrapUseCase {
  constructor(
    private turmasRepository: TurmasRepository,
    private salasRepository: SalasRepository,
    private usersRepository: UsersRepository,
    private horariosRepository: HorariosRepository,
    private disciplinasRepository: DisciplinasRepository,
  ) {}

  async execute(
    params?: AlocacoesBootstrapQueryRequest,
  ): Promise<AlocacoesBootstrapResponse> {
    const regime: RegimeHorario =
      (params?.regime as RegimeHorario | undefined) ?? "SUPERIOR";

    const fetchAllPages = async <T>(
      fetcher: (page: number) => Promise<T[]>,
      opts?: { pageSize?: number; maxPages?: number },
    ): Promise<T[]> => {
      const pageSize = opts?.pageSize ?? 20;
      const maxPages = opts?.maxPages ?? 50;
      const all: T[] = [];

      for (let page = 1; page <= maxPages; page++) {
        const chunk = await fetcher(page);
        all.push(...chunk);
        if (chunk.length < pageSize) break;
      }

      return all;
    };

    const [turmas, salas, users, horarios, disciplinas] = await Promise.all([
      this.turmasRepository.findAll(),
      fetchAllPages((page) => this.salasRepository.findMany(page)),
      fetchAllPages((page) => this.usersRepository.findMany(page)),
      this.horariosRepository.findMany(undefined, regime),
      this.disciplinasRepository.findAll(),
    ]);

    const professores = users.filter((u: any) => u?.role === "PROFESSOR");

    return {
      turmas: turmas.map((t: any) => ({
        id: String(t.id),
        nome: String(t.nome),
        id_curso: String(t.id_curso),
        turno: String(t.turno || ""),
        semestre: Number(t.semestre ?? 0),
      })),
      salas: salas.map((s: any) => ({
        id: String(s.id),
        nome: String(s.nome),
        capacidade: Number(s.capacidade ?? 0),
        tipo: String(s.tipo || ""),
        computadores: Number(s.computadores ?? 0),
        predio: {
          id: String(s.predio?.id || ""),
          nome: String(s.predio?.nome || ""),
          codigo: String(s.predio?.codigo || ""),
        },
      })),
      professores: professores.map((u: any) => ({
        id: String(u.id),
        nome: String(u.nome),
        email: String(u.email),
        role: u.role,
      })),
      disciplinas: disciplinas.map((d: any) => ({
        id: String(d.id),
        nome: String(d.nome),
        codigo: d.codigo ?? null,
        carga_horaria: Number(d.carga_horaria ?? 0),
        tipo_de_sala: d.tipo_de_sala === "Lab" ? "Lab" : "Sala",
        semestre: Number(d.semestre ?? 0),
        obrigatoria: Boolean(d.obrigatoria ?? true),
        id_curso: String(d.id_curso || ""),
      })),
      horarios: horarios.map((h: any) => ({
        id: String(h.id),
        codigo: String(h.codigo),
        dia_semana: String(h.dia_semana),
        horario_inicio: h.horario_inicio instanceof Date ? h.horario_inicio.toISOString() : String(h.horario_inicio),
        horario_fim: h.horario_fim instanceof Date ? h.horario_fim.toISOString() : String(h.horario_fim),
      })),
    };
  }
}

