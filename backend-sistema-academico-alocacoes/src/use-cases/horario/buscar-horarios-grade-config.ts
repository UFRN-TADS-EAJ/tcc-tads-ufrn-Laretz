import type { HorariosRepository } from "@/repositories/horarios-repository";
import type { HorariosGradeConfigResponse } from "@/schemas/horarios";
import type { RegimeHorario } from "@prisma/client";

export class BuscarHorariosGradeConfigUseCase {
  constructor(private horariosRepository: HorariosRepository) {}

  async execute(params?: {
    regime?: RegimeHorario;
  }): Promise<HorariosGradeConfigResponse> {
    const regime = params?.regime ?? "SUPERIOR";
    const horarios = await this.horariosRepository.findMany(undefined, regime);
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

    return {
      regime,
      dias: [
        { key: "SEGUNDA", label: "Segunda" },
        { key: "TERCA", label: "Terça" },
        { key: "QUARTA", label: "Quarta" },
        { key: "QUINTA", label: "Quinta" },
        { key: "SEXTA", label: "Sexta" },
        { key: "SABADO", label: "Sábado" },
      ],
      codigos,
    };
  }
}
