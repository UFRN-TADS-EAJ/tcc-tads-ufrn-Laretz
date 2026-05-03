import type { RegimeHorario } from "@prisma/client";
import type { TurmasRepository } from "@/repositories/turmas-repository";
import type { SalasRepository } from "@/repositories/salas-repository";
import type { UsersRepository } from "@/repositories/users-repository";
import type { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";
import type { HorariosRepository } from "@/repositories/horarios-repository";
import type {
  GradeHorariosBootstrapQueryRequest,
  GradeHorariosBootstrapResponse,
} from "@/schemas";

export class BuscarGradeHorariosBootstrapUseCase {
  constructor(
    private turmasRepository: TurmasRepository,
    private salasRepository: SalasRepository,
    private usersRepository: UsersRepository,
    private periodosRepository: PeriodosLetivosRepository,
    private horariosRepository: HorariosRepository,
  ) {}

  async execute(
    params?: GradeHorariosBootstrapQueryRequest,
  ): Promise<GradeHorariosBootstrapResponse> {
    const regime: RegimeHorario = (params?.regime as RegimeHorario | undefined) ?? "SUPERIOR";
    const orderPeriodos = params?.orderPeriodos ?? "asc";

    const codigosCanonicos = [
      "M1",
      "M2",
      "M3",
      "M4",
      "M5",
      "M6",
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "N1",
      "N2",
      "N3",
      "N4",
      "N5",
      "N6",
    ];

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

    const turmas = await this.turmasRepository.findAll();
    const salas = await fetchAllPages((page) => this.salasRepository.findMany(page));
    const users = await fetchAllPages((page) => this.usersRepository.findMany(page));
    const [periodoAtivo, periodos, horarios] = await Promise.all([
      this.periodosRepository.findActive(),
      this.periodosRepository.findMany({ order: orderPeriodos }),
      this.horariosRepository.findMany(undefined, regime),
    ]);

    const professores = users.filter((u: any) => u?.role === "PROFESSOR");

    const inicioMinimoPorCodigo = new Map<string, number>();
    horarios.forEach((h) => {
      if (!h?.codigo || !h?.horario_inicio) return;
      const codigo = String(h.codigo);
      const inicio = h.horario_inicio.getTime();
      const atual = inicioMinimoPorCodigo.get(codigo);
      if (atual === undefined || inicio < atual) {
        inicioMinimoPorCodigo.set(codigo, inicio);
      }
    });

    const codigos = Array.from(inicioMinimoPorCodigo.entries())
      .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
      .map(([codigo]) => codigo);

    const extras = codigos.filter((c) => !codigosCanonicos.includes(c));
    const codigosFinal = [...codigosCanonicos, ...extras];

    return {
      turmas: turmas.map((t: any) => ({ id: String(t.id), nome: String(t.nome) })),
      salas: salas.map((s: any) => ({
        id: String(s.id),
        nome: String(s.nome),
        predio: s.predio
          ? {
              id: String(s.predio.id),
              nome: String(s.predio.nome),
              codigo: String(s.predio.codigo),
              descricao: s.predio.descricao !== undefined ? s.predio.descricao : null,
            }
          : null,
      })),
      professores: professores.map((u: any) => ({
        id: String(u.id),
        nome: String(u.nome),
        email: String(u.email),
        role: u.role,
      })),
      periodoAtivo: periodoAtivo ? { id: periodoAtivo.id, nome: periodoAtivo.nome } : null,
      periodos: periodos.map((p: any) => ({
        id: String(p.id),
        nome: String(p.nome),
        status: p.status,
      })),
      gradeConfig: {
        regime,
        dias: [
          { key: "SEGUNDA", label: "Segunda" },
          { key: "TERCA", label: "Terça" },
          { key: "QUARTA", label: "Quarta" },
          { key: "QUINTA", label: "Quinta" },
          { key: "SEXTA", label: "Sexta" },
          { key: "SABADO", label: "Sábado" },
        ],
        codigos: codigosFinal,
      },
    };
  }
}
