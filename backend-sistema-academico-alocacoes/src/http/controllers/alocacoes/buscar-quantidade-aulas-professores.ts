import { FastifyRequest, FastifyReply } from "fastify";
import { makeBuscarCargaHorariaProfessoresUseCase } from "@/use-cases/@factories/alocacao/make-buscar-carga-horaria-professores-use-case";

export async function buscarQuantidadeAulasPorProfessor(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const buscarCargaHorariaProfessoresUseCase =
      makeBuscarCargaHorariaProfessoresUseCase();

    const { cargaHoraria } =
      await buscarCargaHorariaProfessoresUseCase.execute();

    return reply.status(200).send({ cargaHoraria });
  } catch (error) {
    throw error;
  }
}
