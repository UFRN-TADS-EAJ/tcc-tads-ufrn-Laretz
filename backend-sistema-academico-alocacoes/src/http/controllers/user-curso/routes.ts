import { FastifyTypedInstance } from "@/@types/fastify-instances";
import { verifyJWT } from "@/http/middlewares/verify-jwt";
import { verifyUseRole } from "@/http/middlewares/verify-user-role";
import { z } from "zod";
import {
  userCursoUserParamsSchema,
  userCursoCursoParamsSchema,
  vincularUserCursoSchema,
  desvincularUserCursoSchema,
  userCursoQuerySchema,
  userCursoResponseSchema,
  cursosUsuarioListResponseSchema,
  usuariosCursoListResponseSchema,
} from "@/schemas/user-curso";
import {
  notFoundResponseSchema,
  internalServerErrorResponseSchema,
  validationErrorResponseSchema,
  errorResponseSchema,
} from "@/schemas/curso";

// Importar controllers
import { vincularUserCurso } from "./vincular-user-curso";
import { desvincularUserCurso } from "./desvincular-user-curso";
import { buscarCursosUsuario } from "./buscar-cursos-usuario";
import { buscarUsuariosCurso } from "./buscar-usuarios-curso";

export const routesUserCurso = async (app: FastifyTypedInstance) => {
  // POST /user-curso/vincular - Vincular usuário a curso
  app.post(
    "/user-curso/vincular",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para vincular um usuário a um curso",
        tags: ["User-Curso 🔗"],
        body: vincularUserCursoSchema,
        response: {
          201: userCursoResponseSchema,
          400: validationErrorResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    vincularUserCurso
  );

  // DELETE /user-curso/desvincular - Desvincular usuário de curso
  app.delete(
    "/user-curso/desvincular",
    {
      onRequest: [verifyJWT, verifyUseRole("ADMIN")],
      schema: {
        description: "Essa rota serve para desvincular um usuário de um curso",
        tags: ["User-Curso 🔗"],
        body: desvincularUserCursoSchema,
        response: {
          200: z.object({ message: z.string() }),
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    desvincularUserCurso
  );

  // GET /user-curso/cursos/:id_user - Buscar cursos do usuário
  app.get(
    "/user-curso/cursos/:id_user",
    {
      onRequest: [verifyJWT],
      schema: {
        description: "Essa rota serve para buscar todos os cursos de um usuário",
        tags: ["User-Curso 🔗"],
        params: userCursoUserParamsSchema,
        querystring: userCursoQuerySchema,
        response: {
          200: cursosUsuarioListResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarCursosUsuario
  );

  // GET /user-curso/usuarios/:id_curso - Buscar usuários do curso
  app.get(
    "/user-curso/usuarios/:id_curso",
    {
      onRequest: [verifyJWT],
      schema: {
        description: "Essa rota serve para buscar todos os usuários de um curso",
        tags: ["User-Curso 🔗"],
        params: userCursoCursoParamsSchema,
        querystring: userCursoQuerySchema,
        response: {
          200: usuariosCursoListResponseSchema,
          400: validationErrorResponseSchema,
          404: notFoundResponseSchema,
          500: internalServerErrorResponseSchema,
        },
      },
    },
    buscarUsuariosCurso
  );
};