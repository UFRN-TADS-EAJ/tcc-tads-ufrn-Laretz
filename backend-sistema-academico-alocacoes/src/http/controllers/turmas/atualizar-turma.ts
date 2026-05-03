import { FastifyReply, FastifyRequest } from "fastify";
import { turmaParamsSchema, updateTurmaSchema } from "@/schemas";
import { RecursoNaoEncontradoError } from "../../../use-cases/errors/recurso-nao-encontrado";
import { makeAtualizarTurmaUseCase } from "@/use-cases/@factories/turma/make-atualizar-turma-use-case";

export async function atualizarTurma(request: FastifyRequest, reply: FastifyReply) {
    const { id } = turmaParamsSchema.parse(request.params);
    const { nome, num_alunos, turno, id_curso, semestre, ativa } = updateTurmaSchema.parse(request.body);

    try {
        const atualizarTurmaUseCase = makeAtualizarTurmaUseCase();

        const params = {
            id,
            ...(nome !== undefined && { nome }),
            ...(num_alunos !== undefined && { num_alunos }),
            ...(turno !== undefined && { turno }),
            ...(id_curso !== undefined && { id_curso }),
            ...(semestre !== undefined && { semestre }),
            ...(ativa !== undefined && { ativa }),
        };

        const { turma } = await atualizarTurmaUseCase.execute(params);

        return reply.status(200).send({ turma });
    } catch (error) {
        if (error instanceof RecursoNaoEncontradoError) {
            return reply.status(404).send({ message: error.message });
        }

        throw error;
    }
}
