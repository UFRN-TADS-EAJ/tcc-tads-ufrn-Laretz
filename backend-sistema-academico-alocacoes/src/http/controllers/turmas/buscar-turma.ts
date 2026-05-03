import { FastifyReply, FastifyRequest } from "fastify";
import { turmaParamsSchema } from "@/schemas";
import { RecursoNaoEncontradoError } from "../../../use-cases/errors/recurso-nao-encontrado";
import { makeBuscarTurmaUseCase } from "@/use-cases/@factories/turma/make-buscar-turma-use-case";

export async function buscarTurma(request: FastifyRequest, reply: FastifyReply) {
    const { id } = turmaParamsSchema.parse(request.params);

    try {
        const buscarTurmaUseCase = makeBuscarTurmaUseCase();

        const { turma } = await buscarTurmaUseCase.execute({ id });

        return reply.status(200).send({ turma });
    } catch (error) {
        if (error instanceof RecursoNaoEncontradoError) {
            return reply.status(404).send({ message: error.message });
        }

        throw error;
    }
}
