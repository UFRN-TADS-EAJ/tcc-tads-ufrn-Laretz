import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { makeAtualizarProgressoDisciplinasUseCase } from "@/use-cases/@factories/disciplina/make-atualizar-progresso-disciplinas-use-case";

const atualizarProgressoDisciplinasQuerySchema = z.object({
  disciplinaId: z.string().uuid().optional(),
  turmaId: z.string().uuid().optional(),
});

export async function atualizarProgressoDisciplinas(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { disciplinaId, turmaId } =
    atualizarProgressoDisciplinasQuerySchema.parse(request.query);

  try {
    const atualizarProgressoDisciplinasUseCase =
      makeAtualizarProgressoDisciplinasUseCase();

    const { disciplinasAtualizadas } =
      await atualizarProgressoDisciplinasUseCase.execute({
        ...(disciplinaId ? { disciplinaId } : {}),
        ...(turmaId ? { turmaId } : {}),
      });

    return reply.status(200).send({
      message: "Progresso das disciplinas atualizado com sucesso",
      disciplinasAtualizadas,
    });
  } catch (err) {
    console.error("Erro ao atualizar progresso das disciplinas:", err);
    return reply.status(500).send({
      message: "Erro interno do servidor",
    });
  }
}
