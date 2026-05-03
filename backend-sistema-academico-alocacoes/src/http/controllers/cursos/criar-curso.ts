import { FastifyReply, FastifyRequest } from "fastify";
import { makeCriarCursoUseCase } from "@/use-cases/@factories/curso/make-criar-curso-use-case";
import { criarCursoBodySchema } from "@/schemas/curso";

export async function criarCurso(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { codigo, nome, turno, duracao_semestres } = criarCursoBodySchema.parse(request.body);

  try {
    const criarCursoUseCase = makeCriarCursoUseCase();

    const { curso } = await criarCursoUseCase.execute({
      codigo,
      nome,
      turno,
      duracao_semestres,
    });

    return reply.status(201).send({ curso, message: "Curso criado com sucesso" });
  } catch (error) {
    throw error;
  }
}
