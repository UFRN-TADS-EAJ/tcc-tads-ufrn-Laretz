import { FastifyReply, FastifyRequest } from "fastify";
import { UserJaExisteError } from "../../../use-cases/errors/email-ja-existe";
import { makeRegisterUseCase } from "@/use-cases/@factories/usuario/make-register-use-case";
import { registerUserSchema } from "@/schemas/user";
    
export async function register(request: FastifyRequest, reply: FastifyReply) {
  const { nome, email, senha, role, especializacao, carga_horaria_max, preferencia } =
    registerUserSchema.parse(request.body);

  try {
    const registerUseCase = makeRegisterUseCase();

    const { user } = await registerUseCase.execute({
      nome,
      email,
      senha,
      role,
      especializacao,
      carga_horaria_max,
      preferencia,
    });

    return reply.status(201).send({ usuario: user });
  } catch (error) {
    if (error instanceof UserJaExisteError) {
      return reply.status(409).send({ message: error.message });
    }

    throw error;
  }
}
