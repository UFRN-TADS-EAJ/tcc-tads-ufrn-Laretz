import { AlocacoesRepository } from "../../repositories/alocacoes-repository";

interface GerarHorarioConsolidadoUseCaseRequest {
  disciplinaId: string;
  periodoId: string;
}

interface GerarHorarioConsolidadoUseCaseResponse {
  horarioConsolidado: string;
}

export class GerarHorarioConsolidadoUseCase {
  constructor(private alocacoesRepository: AlocacoesRepository) {}

  private readonly turnoOrder: Record<string, number> = {
    M: 0,
    T: 1,
    N: 2,
  };

  async execute({
    disciplinaId,
    periodoId,
  }: GerarHorarioConsolidadoUseCaseRequest): Promise<GerarHorarioConsolidadoUseCaseResponse> {
    const alocacoes = await this.alocacoesRepository.findByDisciplinaId(
      disciplinaId,
      periodoId,
    );

    if (!alocacoes || alocacoes.length === 0) {
      return { horarioConsolidado: '' };
    }


    const diasMap: { [key: string]: string } = {
       'SEGUNDA': '2',
       'TERCA': '3', 
       'QUARTA': '4',
       'QUINTA': '5',
       'SEXTA': '6',
       'SABADO': '7'
     };


    const alocacoesPorDia = new Map<string, typeof alocacoes>();
    
    for (const alocacao of alocacoes) {
      if (!alocacao.horario) continue;
      
      const dia = alocacao.horario.dia_semana;
      if (!alocacoesPorDia.has(dia)) {
        alocacoesPorDia.set(dia, []);
      }
      const alocacoesDia = alocacoesPorDia.get(dia);
      if (alocacoesDia) {
        alocacoesDia.push(alocacao);
      }
    }


    const padroesPorHorario = new Map<string, string[]>();
    
    for (const [dia, alocacoesDoDia] of alocacoesPorDia) {
      const codigosDia = diasMap[dia];
      if (!codigosDia) continue;

      const codigosHorarios = alocacoesDoDia
        .map((alocacao) => alocacao.horario?.codigo)
        .filter((codigo): codigo is string => Boolean(codigo))
        .sort((a, b) => this.compareHorarioCodigo(a, b));

      if (codigosHorarios.length === 0) continue;

      const gruposDoDia = this.agruparSequenciasConsecutivas(codigosHorarios);

      gruposDoDia.forEach((grupo) => {
        if (!padroesPorHorario.has(grupo)) {
          padroesPorHorario.set(grupo, []);
        }

        const padraoArray = padroesPorHorario.get(grupo);
        if (padraoArray) {
          padraoArray.push(codigosDia);
        }
      });
    }


    const horariosConsolidados = [...padroesPorHorario.entries()]
      .map(([padraoHorario, diasCodigos]) => {
        const diasOrdenados = [...new Set(diasCodigos)].sort(
          (a, b) => parseInt(a, 10) - parseInt(b, 10),
        );
        return `${diasOrdenados.join("")}${padraoHorario}`;
      })
      .sort((a, b) => this.compareHorarioConsolidado(a, b));

    return { horarioConsolidado: horariosConsolidados.join(', ') };
  }

  private agruparSequenciasConsecutivas(codigosHorarios: string[]): string[] {
    const grupos: string[] = [];
    let grupoAtual: string[] = [];

    codigosHorarios.forEach((codigo) => {
      if (grupoAtual.length === 0) {
        grupoAtual = [codigo];
        return;
      }

      const ultimo = grupoAtual[grupoAtual.length - 1];
      const mesmoTurno = ultimo?.charAt(0) === codigo.charAt(0);
      const consecutivo =
        parseInt(codigo.slice(1), 10) === parseInt(ultimo?.slice(1) ?? "0", 10) + 1;

      if (mesmoTurno && consecutivo) {
        grupoAtual.push(codigo);
        return;
      }

      grupos.push(this.formatarGrupo(grupoAtual));
      grupoAtual = [codigo];
    });

    if (grupoAtual.length > 0) {
      grupos.push(this.formatarGrupo(grupoAtual));
    }

    return grupos;
  }

  private formatarGrupo(codigosHorarios: string[]): string {
    const turno = codigosHorarios[0]?.charAt(0) ?? "";
    const numeros = codigosHorarios.map((codigo) => codigo.slice(1)).join("");
    return `${turno}${numeros}`;
  }

  private compareHorarioCodigo(a: string, b: string): number {
    const turnoA = a.charAt(0);
    const turnoB = b.charAt(0);

    if (turnoA !== turnoB) {
      return (this.turnoOrder[turnoA] ?? 99) - (this.turnoOrder[turnoB] ?? 99);
    }

    return parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10);
  }

  private compareHorarioConsolidado(a: string, b: string): number {
    const matchA = a.match(/^(\d+)([A-Z])(\d+)$/);
    const matchB = b.match(/^(\d+)([A-Z])(\d+)$/);

    if (!matchA || !matchB) {
      return a.localeCompare(b, "pt-BR");
    }

    const diasA = matchA[1]!;
    const turnoA = matchA[2]!;
    const numerosA = matchA[3]!;
    const diasB = matchB[1]!;
    const turnoB = matchB[2]!;
    const numerosB = matchB[3]!;
    const primeiroDiaA = parseInt(diasA.charAt(0), 10);
    const primeiroDiaB = parseInt(diasB.charAt(0), 10);

    if (primeiroDiaA !== primeiroDiaB) {
      return primeiroDiaA - primeiroDiaB;
    }

    if (turnoA !== turnoB) {
      return (this.turnoOrder[turnoA] ?? 99) - (this.turnoOrder[turnoB] ?? 99);
    }

    return parseInt(numerosA, 10) - parseInt(numerosB, 10);
  }
}
