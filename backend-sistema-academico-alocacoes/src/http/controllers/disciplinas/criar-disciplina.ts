import { FastifyReply, FastifyRequest } from "fastify";
import { TipoDeSala } from "@prisma/client";
import { makeCriarDisciplinaUseCase } from "@/use-cases/@factories/disciplina/make-criar-disciplina-use-case";
import { criarDisciplinaBodySchema } from "@/schemas/disciplina";

export async function criarDisciplina(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const {
    nome,
    carga_horaria,
    id_curso,
    tipo_de_sala,
    data_inicio,
    data_fim_prevista,
    periodo_letivo,
    codigo,
    semestre,
    obrigatoria,
  } = criarDisciplinaBodySchema.parse(request.body);

  try {
    const criarDisciplinaUseCase = makeCriarDisciplinaUseCase();

    const payload = {
      nome,
      carga_horaria,
      id_curso,
      tipo_de_sala: tipo_de_sala as TipoDeSala,
      semestre,
      obrigatoria,
      ...(periodo_letivo !== undefined ? { periodo_letivo } : {}),
      ...(codigo !== undefined ? { codigo } : {}),
      ...(data_inicio ? { data_inicio: new Date(data_inicio) } : {}),
      ...(data_fim_prevista ? { data_fim_prevista: new Date(data_fim_prevista) } : {}),
    };

    const { disciplina } = await criarDisciplinaUseCase.execute(payload);

    return reply.status(201).send({ disciplina, message: "Disciplina criada com sucesso" });
  } catch (error) {
    throw error;
  }
}
