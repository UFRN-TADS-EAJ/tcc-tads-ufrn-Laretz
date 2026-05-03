import { FastifyRequest, FastifyReply } from "fastify";
import { makeCriarAlocacaoUseCase } from "@/use-cases/@factories/alocacao/make-criar-alocacao-use-case";
import { createAlocacaoSchema } from "@/schemas";

export async function criarAlocacao(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id_user, id_curso_disciplina, id_turma, id_sala, id_horario, id_horarios } =
    createAlocacaoSchema.parse(request.body);

  try {
    const criarAlocacaoUseCase = makeCriarAlocacaoUseCase();

    // Normalizar para sempre usar array de horários
    const horariosArray = id_horarios || (id_horario ? [id_horario] : []);

    const { alocacoes, conflitos } = await criarAlocacaoUseCase.execute({
      id_user,
      id_curso_disciplina,
      id_turma,
      id_sala,
      id_horarios: horariosArray,
    });

    // Se foi um único horário, tratar retorno único
    if (id_horario) {
      if (alocacoes.length === 0) {
        return reply.status(409).send({
          message: "Conflito detectado. Nenhuma alocação foi criada para o horário informado.",
          conflitos,
        });
      }
      return reply.status(201).send({ alocacao: alocacoes[0], conflitos });
    }

    // Vários horários: criar parcial possível e retornar detalhes dos conflitos
    if (alocacoes.length === 0) {
      return reply.status(409).send({
        message: "Conflitos detectados. Nenhuma alocação foi criada.",
        conflitos,
      });
    }

    return reply.status(201).send({ alocacoes, conflitos });
  } catch (error) {
    const msg = String((error as any)?.message || "");
    let status = 409;
    let code = "ALOCACAO_CONFLITO";

    if (/Turma não encontrada/i.test(msg)) {
      status = 404;
      code = "NOT_FOUND_TURMA";
    } else if (/CursoDisciplina não encontrado/i.test(msg)) {
      status = 404;
      code = "NOT_FOUND_CURSO_DISCIPLINA";
    } else if (/CursoDisciplina não pertence ao curso da turma/i.test(msg)) {
      status = 400;
      code = "COURSE_MISMATCH";
    } else if (/Professor já possui alocação/i.test(msg) || /Conflito temporal: professor/i.test(msg)) {
      status = 409;
      code = "CONFLICT_PROFESSOR";
    } else if (/Sala já está ocupada/i.test(msg) || /Conflito temporal: sala/i.test(msg)) {
      status = 409;
      code = "CONFLICT_SALA";
    } else if (/Turma já possui alocação/i.test(msg) || /Conflito temporal: turma/i.test(msg)) {
      status = 409;
      code = "CONFLICT_TURMA";
    }

    return reply.status(status).send({ code, message: msg });
  }
}
