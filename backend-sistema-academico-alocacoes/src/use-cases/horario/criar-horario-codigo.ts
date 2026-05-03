import { HorariosRepository } from "../../repositories/horarios-repository";

interface CriarHorarioCodigoUseCaseRequest {
  codigo: string; // Exemplo: "2M12" = Segunda, Manhã, horários 1 e 2
}

interface HorarioInfo {
  dia_semana: string;
  codigo: string;
  horario_inicio: Date;
  horario_fim: Date;
}

export class CriarHorarioCodigoUseCase {
  constructor(private horariosRepository: HorariosRepository) {}

  private decodificarCodigo(codigo: string): HorarioInfo {
    // Exemplo de código: "2M12" = Segunda, Manhã, horários 1 e 2
    // Formato: [DIA][TURNO][HORARIOS]

    if (codigo.length < 3) {
      throw new Error("Código de horário inválido");
    }

    const dia = codigo.charAt(0);
    const turno = codigo.charAt(1).toUpperCase();
    const horarios = codigo.substring(2);

    // Mapear dia da semana
    const diasSemana: { [key: string]: string } = {
      "2": "SEGUNDA",
      "3": "TERCA",
      "4": "QUARTA",
      "5": "QUINTA",
      "6": "SEXTA",
      "7": "SABADO",
    };

    const dia_semana = diasSemana[dia];
    if (!dia_semana) {
      throw new Error("Dia da semana inválido no código");
    }

    // Processar horários (exemplo: "12" = horários 1 e 2)
    const primeiroHorario = parseInt(horarios.charAt(0));
    const ultimoHorario = parseInt(horarios.charAt(horarios.length - 1));

    if (isNaN(primeiroHorario) || isNaN(ultimoHorario)) {
      throw new Error("Horários inválidos no código");
    }

    // Validar horários (1-6 para cada turno)
    if (
      primeiroHorario < 1 ||
      primeiroHorario > 6 ||
      ultimoHorario < 1 ||
      ultimoHorario > 6
    ) {
      throw new Error("Horários devem estar entre 1 e 6");
    }

    // Calcular horário de início e fim considerando intervalos
    const { horario_inicio, horario_fim } = this.calcularHorarios(
      turno,
      primeiroHorario,
      ultimoHorario
    );

    // Criar objetos Date apenas com tempo (sem timezone)
    const inicio = new Date(`1970-01-01T${horario_inicio.hora.toString().padStart(2, '0')}:${horario_inicio.minuto.toString().padStart(2, '0')}:00.000Z`);
    const fim = new Date(`1970-01-01T${horario_fim.hora.toString().padStart(2, '0')}:${horario_fim.minuto.toString().padStart(2, '0')}:00.000Z`);

    // Gerar código do horário (ex: M1, T2, N3)
    const codigoHorario = `${turno}${primeiroHorario}`;
    
    return {
      dia_semana,
      codigo: codigoHorario,
      horario_inicio: inicio,
      horario_fim: fim,
    };
  }

  private calcularHorarios(
    turno: string,
    primeiroHorario: number,
    ultimoHorario: number
  ): {
    horario_inicio: { hora: number; minuto: number };
    horario_fim: { hora: number; minuto: number };
  } {
    // Definir horários por turno considerando intervalos
    const horariosDefinidos: {
      [key: string]: Array<{
        inicio: { hora: number; minuto: number };
        fim: { hora: number; minuto: number };
      }>;
    } = {
      M: [
        // Manhã
        { inicio: { hora: 7, minuto: 0 }, fim: { hora: 7, minuto: 50 } }, // M1
        { inicio: { hora: 7, minuto: 50 }, fim: { hora: 8, minuto: 40 } }, // M2
        { inicio: { hora: 8, minuto: 55 }, fim: { hora: 9, minuto: 45 } }, // M3
        { inicio: { hora: 9, minuto: 45 }, fim: { hora: 10, minuto: 35 } }, // M4
        { inicio: { hora: 10, minuto: 50 }, fim: { hora: 11, minuto: 40 } }, // M5
        { inicio: { hora: 11, minuto: 40 }, fim: { hora: 12, minuto: 30 } }, // M6
      ],
      T: [
        // Tarde
        { inicio: { hora: 13, minuto: 0 }, fim: { hora: 13, minuto: 50 } }, // T1
        { inicio: { hora: 13, minuto: 50 }, fim: { hora: 14, minuto: 40 } }, // T2
        { inicio: { hora: 14, minuto: 55 }, fim: { hora: 15, minuto: 45 } }, // T3
        { inicio: { hora: 15, minuto: 45 }, fim: { hora: 16, minuto: 35 } }, // T4
        { inicio: { hora: 16, minuto: 50 }, fim: { hora: 17, minuto: 40 } }, // T5
        { inicio: { hora: 17, minuto: 40 }, fim: { hora: 18, minuto: 30 } }, // T6
      ],
      N: [
        // Noite
        { inicio: { hora: 18, minuto: 45 }, fim: { hora: 19, minuto: 35 } }, // N1
        { inicio: { hora: 19, minuto: 35 }, fim: { hora: 20, minuto: 25 } }, // N2
        { inicio: { hora: 20, minuto: 35 }, fim: { hora: 21, minuto: 25 } }, // N3
        { inicio: { hora: 21, minuto: 25 }, fim: { hora: 22, minuto: 15 } }, // N4
      ],
    };

    const horariosDoTurno = horariosDefinidos[turno];
    if (!horariosDoTurno) {
      throw new Error("Turno inválido no código");
    }
    if (
      (turno === "N" && ultimoHorario > 4) ||
      (turno !== "N" && ultimoHorario > 6)
    ) {
      throw new Error("Horário inválido para o turno selecionado");
    }
    
    const inicioHorarioObj = horariosDoTurno[primeiroHorario - 1];
    const fimHorarioObj = horariosDoTurno[ultimoHorario - 1];

    if (!inicioHorarioObj || !fimHorarioObj) {
    throw new Error("Horário fora do intervalo válido");
    }

    const horario_inicio = inicioHorarioObj.inicio;
    const horario_fim = fimHorarioObj.fim;


    return {
      horario_inicio,
      horario_fim,
    };
  }

  async execute({ codigo }: CriarHorarioCodigoUseCaseRequest) {
    const horarioInfo = this.decodificarCodigo(codigo);

    // Verificar se já existe um horário igual
    const horarioExistente = await this.horariosRepository.findByDiaEHorario(
      horarioInfo.dia_semana,
      horarioInfo.horario_inicio,
      horarioInfo.horario_fim
    );

    if (horarioExistente) {
      return { horario: horarioExistente };
    }

    // Criar novo horário
    const horario = await this.horariosRepository.create({
      dia_semana: horarioInfo.dia_semana,
      codigo: horarioInfo.codigo,
      horario_inicio: horarioInfo.horario_inicio,
      horario_fim: horarioInfo.horario_fim,
    });

    return { horario };
  }
}
