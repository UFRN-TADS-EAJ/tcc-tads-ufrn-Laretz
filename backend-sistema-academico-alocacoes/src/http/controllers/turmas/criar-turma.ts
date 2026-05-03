import { FastifyReply, FastifyRequest } from "fastify";
import { createTurmaSchema } from "@/schemas";
import { makeCriarTurmaUseCase } from "@/use-cases/@factories/turma/make-criar-turma-use-case";

export async function criarTurma(request: FastifyRequest, reply: FastifyReply) {
    const { nome, num_alunos, turno, id_curso, semestre, ativa } = createTurmaSchema.parse(request.body);

    try {
        const criarTurmaUseCase = makeCriarTurmaUseCase();

        const { turma } = await criarTurmaUseCase.execute({
            nome,
            num_alunos,
            turno,
            id_curso,
            semestre,
            ativa: ativa !== undefined ? ativa : true,
        });

        return reply.status(201).send({ turma });
    } catch (error) {
        throw error;
    }
}
