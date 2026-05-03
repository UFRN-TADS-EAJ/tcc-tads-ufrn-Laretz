import { HorariosRepository } from "../../repositories/horarios-repository";

interface CriarHorarioUseCaseRequest {
  codigo: string;
  dia_semana: string;
  horario_inicio: Date;
  horario_fim: Date;
}

export class CriarHorarioUseCase {
    constructor(private horariosRepository: HorariosRepository) {}

    async execute({ codigo, dia_semana, horario_inicio, horario_fim }: CriarHorarioUseCaseRequest) {
        const horario = await this.horariosRepository.create({
      codigo,
      dia_semana,
      horario_inicio,
      horario_fim,
    });

        return { horario };
    }
}