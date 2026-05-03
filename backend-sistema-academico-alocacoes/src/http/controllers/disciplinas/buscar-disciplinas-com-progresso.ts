import { FastifyRequest, FastifyReply } from "fastify";
import { makeBuscarDisciplinasComProgressoUseCase } from "@/use-cases/@factories/disciplina/make-buscar-disciplinas-com-progresso-use-case";
import {
  buscarDisciplinasComProgressoQuerySchema,
  buscarDisciplinasComProgressoResponseSchema,
} from "@/schemas";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

export async function buscarDisciplinasComProgresso(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { turmaId, cursoId } = buscarDisciplinasComProgressoQuerySchema.parse(
      request.query,
    );

    const buscarDisciplinasComProgressoUseCase =
      makeBuscarDisciplinasComProgressoUseCase();

    const filtros = {
      ...(turmaId ? { turmaId } : {}),
      ...(cursoId ? { cursoId } : {}),
    };

    const { disciplinas } =
      await buscarDisciplinasComProgressoUseCase.execute(filtros);

    return reply.status(200).send({
      disciplinas,
    });
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) {
      return reply.status(404).send({
        message: error.message,
      });
    }
    console.error("Erro ao buscar disciplinas com progresso:", {
      turmaId: (request.query as any)?.turmaId,
      cursoId: (request.query as any)?.cursoId,
      error,
    });
    return reply.status(500).send({
      message: "Erro interno do servidor",
    });
  }
}
