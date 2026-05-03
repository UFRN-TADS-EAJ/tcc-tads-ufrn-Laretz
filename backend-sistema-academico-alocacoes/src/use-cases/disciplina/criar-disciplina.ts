import { DisciplinasRepository } from "../../repositories/disciplinas-repository";
import { TipoDeSala } from "@prisma/client";

interface CriarDisciplinaUseCaseRequest {
    nome: string;
    carga_horaria: number;
    id_curso: string;
    tipo_de_sala?: TipoDeSala;
    data_inicio?: Date;
    data_fim_prevista?: Date;
    periodo_letivo?: string;
    codigo?: string;
    semestre?: number;
    obrigatoria?: boolean;
}

// Função auxiliar para calcular número de aulas baseado na carga horária
function calcularTotalAulas(cargaHoraria: number): number {
    // Considerando aulas de 50 minutos
    return Math.ceil((cargaHoraria * 60) / 50);
}

export class CriarDisciplinaUseCase {
    constructor(private disciplinasRepository: DisciplinasRepository) {}

    async execute({ 
        nome, 
        carga_horaria, 
        id_curso, 
        tipo_de_sala = 'Sala', 
        data_inicio, 
        data_fim_prevista,
        periodo_letivo,
        codigo,
        semestre = 1,
        obrigatoria = true
    }: CriarDisciplinaUseCaseRequest) {
        const total_aulas = calcularTotalAulas(carga_horaria);
        
        const disciplina = await this.disciplinasRepository.create({
            nome,
            carga_horaria,
            total_aulas,
            aulas_ministradas: 0,
            carga_horaria_atual: 0,
            curso: {
                connect: { id: id_curso }
            },
            tipo_de_sala,
            data_inicio: data_inicio || null,
            data_fim_prevista: data_fim_prevista || null,
            periodo_letivo: periodo_letivo || null,
            codigo: codigo || null,
            semestre,
            obrigatoria,
        });

        return { disciplina };
    }
}