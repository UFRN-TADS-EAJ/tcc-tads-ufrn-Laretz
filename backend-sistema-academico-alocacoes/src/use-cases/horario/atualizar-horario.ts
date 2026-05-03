import { HorariosRepository } from "../../repositories/horarios-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface AtualizarHorarioUseCaseRequest {
  id: string;
  codigo?: string | undefined;
  dia_semana?: string | undefined;
  horario_inicio?: Date | undefined;
  horario_fim?: Date | undefined;
}

export class AtualizarHorarioUseCase {
    constructor(private horariosRepository: HorariosRepository) {}

    async execute({ id, codigo, dia_semana, horario_inicio, horario_fim }: AtualizarHorarioUseCaseRequest) {
        const horarioExiste = await this.horariosRepository.findById(id);

        if (!horarioExiste) {
            throw new RecursoNaoEncontradoError();
        }

        // Cria um objeto com apenas os campos que foram fornecidos
        const updateData: Partial<{
            codigo: string;
            dia_semana: string;
            horario_inicio: Date;
            horario_fim: Date;
        }> = {};
        if (codigo !== undefined) updateData.codigo = codigo;
        if (dia_semana !== undefined) updateData.dia_semana = dia_semana;
        if (horario_inicio !== undefined) updateData.horario_inicio = horario_inicio;
    if (horario_fim !== undefined) updateData.horario_fim = horario_fim;
        
        const horario = await this.horariosRepository.update(id, updateData);

        return { horario };
    }
}