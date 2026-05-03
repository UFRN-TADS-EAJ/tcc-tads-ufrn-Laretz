import { AlocacoesRepository } from "../../repositories/alocacoes-repository";
import { DisciplinasRepository } from "../../repositories/disciplinas-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";
import { GerarHorarioConsolidadoUseCase } from "../disciplina/gerar-horario-consolidado";
import { TurmasRepository } from "../../repositories/turmas-repository";
import { CursoDisciplinaRepository } from "../../repositories/curso-disciplina-repository";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

interface AtualizarAlocacaoUseCaseRequest {
    id: string;
    id_user?: string | undefined;
    id_curso_disciplina?: string | undefined;
    id_turma?: string | undefined;
    id_sala?: string | undefined;
    id_horario?: string | undefined;
}

export class AtualizarAlocacaoUseCase {
    constructor(
        private alocacoesRepository: AlocacoesRepository,
        private disciplinasRepository: DisciplinasRepository,
        private turmasRepository: TurmasRepository,
        private cursoDisciplinaRepository: CursoDisciplinaRepository,
        private periodosRepository: PeriodosLetivosRepository,
    ) {}

    async execute({ id, id_user, id_curso_disciplina, id_turma, id_sala, id_horario }: AtualizarAlocacaoUseCaseRequest) {
        const periodoAtivo = await this.periodosRepository.findActive();
        if (!periodoAtivo) {
            throw new Error("Nenhum período letivo ativo encontrado");
        }

        const alocacaoExiste = await this.alocacoesRepository.findById(id, periodoAtivo.id);

        if (!alocacaoExiste) {
            throw new RecursoNaoEncontradoError();
        }

        // Cria um objeto com apenas os campos que foram fornecidos
        const updateData: {
            user?: { connect: { id: string } };
            disciplina?: { connect: { id: string } };
            cursoDisciplina?: { connect: { id: string } };
            turma?: { connect: { id: string } };
            sala?: { connect: { id: string } };
            horario?: { connect: { id: string } };
        } = {};
        
        if (id_user !== undefined) {
            updateData.user = {
                connect: { id: id_user }
            };
        }
        
        let disciplinaIdParaConsolidar: string | undefined = undefined;

        if (id_curso_disciplina !== undefined) {
            // Validar compatibilidade com turma (se id_turma foi fornecido, usar o novo; senão, usar o existente)
            const turmaIdParaValidar = id_turma ?? alocacaoExiste.id_turma;
            const turma = await this.turmasRepository.findById(turmaIdParaValidar);
            if (!turma) {
                throw new Error("Turma não encontrada");
            }

            const cursoDisciplina = await this.cursoDisciplinaRepository.findById(id_curso_disciplina);
            if (!cursoDisciplina) {
                throw new Error("CursoDisciplina não encontrado");
            }
            if (cursoDisciplina.id_curso !== turma.id_curso) {
                throw new Error("CursoDisciplina não pertence ao curso da turma");
            }

            disciplinaIdParaConsolidar = cursoDisciplina.id_disciplina;

            updateData.cursoDisciplina = {
                connect: { id: id_curso_disciplina }
            };
            updateData.disciplina = {
                connect: { id: cursoDisciplina.id_disciplina }
            };
        }
        
        if (id_turma !== undefined) {
            updateData.turma = {
                connect: { id: id_turma }
            };
        }
        
        if (id_sala !== undefined) {
            updateData.sala = {
                connect: { id: id_sala }
            };
        }
        
        if (id_horario !== undefined) {
            updateData.horario = {
                connect: { id: id_horario }
            };
        }
        
        const alocacao = await this.alocacoesRepository.update(
            id,
            updateData,
            periodoAtivo.id,
        );

        // Gerar horário consolidado automaticamente após atualizar alocação
        const disciplinaId = disciplinaIdParaConsolidar || alocacaoExiste.id_disciplina;
        if (disciplinaId) {
            const gerarHorarioUseCase = new GerarHorarioConsolidadoUseCase(this.alocacoesRepository);
            const { horarioConsolidado } = await gerarHorarioUseCase.execute({
                disciplinaId,
                periodoId: periodoAtivo.id,
            });
            
            // Atualizar disciplina com o horário consolidado
            await this.disciplinasRepository.update(disciplinaId, {
                horario_consolidado: horarioConsolidado || null,
            });
        }

        return { alocacao };
    }
}
