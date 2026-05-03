import { FastifyReply, FastifyRequest } from "fastify";
import { makeAuthenticateUseCase } from "@/use-cases/@factories/usuario/make-authenticate-use-case";
import { env } from "@/env";
    
export async function refresh(request: FastifyRequest, reply: FastifyReply) {

    await request.jwtVerify({onlyCookie: true})

    const {role} = request.user

    const token = await reply.jwtSign(
        {role},
        {
            sign: { sub: request.user.sub}
        }
    )

    const refreshToken = await reply.jwtSign(
        {role},
        {
            sign: { sub: request.user.sub, 
            expiresIn: '7d' }
        }
    )

    return reply
    .setCookie('refreshToken', refreshToken, {path: '/', secure: env.NODE_ENV === 'prod', httpOnly: true, sameSite: true})
    .status(200)
    .send({ token });
}
