import {z} from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaUsersRepository } from "../../../repositories/prisma-repositories/prisma-users-repository";
import { AuthenticateUseCase } from "../../../use-cases/users/authenticate";
import { CredenciaisInvalidas } from "../../../use-cases/errors/credenciais-invalidas";
import { makeAuthenticateUseCase } from "@/use-cases/@factories/usuario/make-authenticate-use-case";
import { env } from "@/env";
    
export async function autenticar(request: FastifyRequest, reply: FastifyReply) {

    const autenticarBodySchema = z.object({
        email: z.string().email(),
        senha: z.string().min(6),
    });

    const {  email, senha } = autenticarBodySchema.parse(request.body);

    try {
        const authenticateUseCase =  makeAuthenticateUseCase()

        const {user} = await authenticateUseCase.execute({  email, senha});

        const token = await reply.jwtSign(
            {
                role: user.role
            },
            {
                sign: { sub: user.id}
            }
        )

        const refreshToken = await reply.jwtSign(
            {
                role: user.role,
            },
            {
                sign: { sub: user.id, 
                expiresIn: '7d' }
            }
        )

        return reply
        .setCookie('refreshToken', refreshToken, {path: '/', secure: env.NODE_ENV === 'prod', httpOnly: true, sameSite: true})
        .status(200)
        .send({ 
            token,
            refreshToken,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: user.role,
                especializacao: user.especializacao,
                carga_horaria_max: user.carga_horaria_max,
                preferencia: user.preferencia
            }
        });
    } catch (error) {
        if (error instanceof CredenciaisInvalidas){
            return reply.status(401).send({ 
                message: "Credenciais inválidas"
            });
        }
        
        throw error;
    }

}
