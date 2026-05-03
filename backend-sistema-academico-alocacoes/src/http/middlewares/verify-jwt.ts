import { FastifyReply, FastifyRequest } from "fastify";


export async function verifyJWT(request: FastifyRequest, reply: FastifyReply,){
    // Deixe o Error Handler global padronizar as respostas de erro JWT
    await request.jwtVerify()
}
