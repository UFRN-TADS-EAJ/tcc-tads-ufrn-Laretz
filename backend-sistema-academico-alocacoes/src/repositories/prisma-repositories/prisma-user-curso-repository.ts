import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { UserCursoRepository } from "../user-curso-repository";

export class PrismaUserCursoRepository implements UserCursoRepository {
  async create(data: Prisma.UserCursoCreateInput) {
    const userCurso = await prisma.userCurso.create({
      data,
    });

    return userCurso;
  }

  async findByUserAndCurso(id_user: string, id_curso: string) {
    const userCurso = await prisma.userCurso.findUnique({
      where: {
        id_user_id_curso: {
          id_user,
          id_curso,
        },
      },
    });

    return userCurso;
  }

  async update(id: string, data: Partial<{ ativo: boolean }>) {
    const userCurso = await prisma.userCurso.update({
      where: { id },
      data,
    });

    return userCurso;
  }

  async findCursosByUser(id_user: string) {
    const userCursos = await prisma.userCurso.findMany({
      where: {
        id_user,
        ativo: true,
      },
      include: {
        curso: true,
      },
    });

    const ativos = userCursos.filter((uc) => uc.curso && uc.curso.isDeleted === null);

    return ativos.map((uc) => ({
      id: uc.curso.id,
      codigo: uc.curso.codigo,
      nome: uc.curso.nome,
      turno: uc.curso.turno,
      duracao_semestres: uc.curso.duracao_semestres,
      vinculo: {
        id: uc.id,
        ativo: uc.ativo,
        created_at: uc.created_at,
      },
    }));
  }

  async findUsuariosByCurso(id_curso: string) {
    const userCursos = await prisma.userCurso.findMany({
      where: {
        id_curso,
        ativo: true,
      },
      include: {
        user: true,
      },
    });

    return userCursos.map((uc) => ({
      id: uc.user.id,
      nome: uc.user.nome,
      email: uc.user.email,
      role: uc.user.role,
      especializacao: uc.user.especializacao,
      carga_horaria_max: uc.user.carga_horaria_max,
      preferencia: uc.user.preferencia,
      vinculo: {
        id: uc.id,
        ativo: uc.ativo,
        created_at: uc.created_at,
      },
    }));
  }

  async delete(id: string) {
    await prisma.userCurso.delete({
      where: { id },
    });
  }
}