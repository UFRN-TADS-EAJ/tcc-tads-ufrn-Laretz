import { FastifyReply, FastifyRequest } from "fastify";
import { makeBuscarProfessorDisciplinaBootstrapUseCase } from "@/use-cases/@factories/professor-disciplina/make-buscar-professor-disciplina-bootstrap-use-case";

export async function buscarProfessorDisciplinaBootstrap(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const useCase = makeBuscarProfessorDisciplinaBootstrapUseCase();
  const result = await useCase.execute();
  return reply.status(200).send(result);
}

