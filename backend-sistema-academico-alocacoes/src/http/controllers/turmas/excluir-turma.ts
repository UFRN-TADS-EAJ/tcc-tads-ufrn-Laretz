import { FastifyReply, FastifyRequest } from "fastify";
import { turmaParamsSchema } from "@/schemas";
import { RecursoNaoEncontradoError } from "../../../use-cases/errors/recurso-nao-encontrado";
import { makeExcluirTurmaUseCase } from "@/use-cases/@factories/turma/make-excluir-turma-use-case";

export async function excluirTurma(request: FastifyRequest, reply: FastifyReply) {
    const { id } = turmaParamsSchema.parse(request.params);

    try {
        const excluirTurmaUseCase = makeExcluirTurmaUseCase();

        await excluirTurmaUseCase.execute({ id });

        return reply.status(204).send();
    } catch (error) {
        if (error instanceof RecursoNaoEncontradoError) {
            return reply.status(404).send({ message: error.message });
        }

        throw error;
    }
}
