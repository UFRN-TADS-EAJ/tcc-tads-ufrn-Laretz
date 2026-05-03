import { FastifyReply, FastifyRequest } from "fastify";

export async function verifyToken(request: FastifyRequest, reply: FastifyReply) {
    try {
        // Verificar se o token é válido
        await request.jwtVerify();
        
        // Se chegou até aqui, o token é válido
        return reply.status(200).send({ 
            valid: true,
            user: {
                id: request.user.sub,
                role: request.user.role
            }
        });
    } catch (error) {
        // Token inválido ou expirado
        return reply.status(401).send({ 
            valid: false,
            message: 'Token inválido ou expirado'
        });
    }
}