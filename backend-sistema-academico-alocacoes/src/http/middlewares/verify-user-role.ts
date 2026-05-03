import { FastifyReply, FastifyRequest } from "fastify";


export function verifyUseRole(roleToVerify: 'ADMIN' | 'COORDENADOR' | 'PROFESSOR'){
  return async (request: FastifyRequest, reply: FastifyReply) => {
      
     if (!request.user) {
        return reply.status(401).send({ message: 'Unauthorized. User not authenticated.' });
     }

     const {role} = request.user

     if(role !== roleToVerify && role !== 'ADMIN' && role !== 'COORDENADOR'){
        return reply.status(403).send({ message: `Forbidden. ${roleToVerify} role required.` });
     }
   }
}
