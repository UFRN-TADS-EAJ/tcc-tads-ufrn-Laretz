import { ProfessorDisciplina, Prisma } from '@prisma/client'
import { ProfessorDisciplinaRepository } from '../professor-disciplina-repository'
import { prisma } from '@/lib/prisma'

export class PrismaProfessorDisciplinaRepository implements ProfessorDisciplinaRepository {
  async create(data: Prisma.ProfessorDisciplinaCreateInput): Promise<ProfessorDisciplina> {
    const professorDisciplina = await prisma.professorDisciplina.create({
      data,
    })

    return professorDisciplina
  }

  async update(id: string, data: Prisma.ProfessorDisciplinaUpdateInput): Promise<ProfessorDisciplina> {
    const professorDisciplina = await prisma.professorDisciplina.update({
      where: { id },
      data,
    })

    return professorDisciplina
  }

  async findById(id: string): Promise<ProfessorDisciplina | null> {
    const professorDisciplina = await prisma.professorDisciplina.findUnique({
      where: { id },
    })

    return professorDisciplina
  }

  async findByUserAndDisciplina(id_user: string, id_disciplina: string): Promise<ProfessorDisciplina | null> {
    const professorDisciplina = await prisma.professorDisciplina.findUnique({
      where: {
        id_user_id_disciplina: {
          id_user,
          id_disciplina,
        },
      },
    })

    return professorDisciplina
  }

  async findDisciplinasByUser(id_user: string) {
    const result = await prisma.professorDisciplina.findMany({
      where: {
        id_user,
        ativo: true,
      },
      include: {
        disciplina: {
          include: {
            curso: {
              select: {
                id: true,
                nome: true,
                codigo: true,
              },
            },
          },
        },
      },
    })

    return result.map((item) => ({
      id: item.disciplina.id,
      nome: item.disciplina.nome,
      carga_horaria: item.disciplina.carga_horaria,
      total_aulas: item.disciplina.total_aulas,
      carga_horaria_atual: item.disciplina.carga_horaria_atual,
      tipo_de_sala: item.disciplina.tipo_de_sala,
      codigo: item.disciplina.codigo,
      semestre: item.disciplina.semestre,
      obrigatoria: item.disciplina.obrigatoria,
      curso: item.disciplina.curso,
      vinculo: {
        id: item.id,
        ativo: item.ativo,
        created_at: item.created_at,
      },
    }))
  }

  async findProfessoresByDisciplina(id_disciplina: string) {
    const result = await prisma.professorDisciplina.findMany({
      where: {
        id_disciplina,
        ativo: true,
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            especializacao: true,
            carga_horaria_max: true,
            preferencia: true,
          },
        },
      },
    })

    return result.map((item) => ({
      id: item.user.id,
      nome: item.user.nome,
      email: item.user.email,
      especializacao: item.user.especializacao,
      carga_horaria_max: item.user.carga_horaria_max,
      preferencia: item.user.preferencia,
      vinculo: {
        id: item.id,
        ativo: item.ativo,
        created_at: item.created_at,
      },
    }))
  }

  async delete(id: string): Promise<void> {
    await prisma.professorDisciplina.delete({
      where: { id },
    })
  }
}