import { ProfessorDisciplina, Prisma } from '@prisma/client'

export interface ProfessorDisciplinaRepository {
  create(data: Prisma.ProfessorDisciplinaCreateInput): Promise<ProfessorDisciplina>
  update(id: string, data: Prisma.ProfessorDisciplinaUpdateInput): Promise<ProfessorDisciplina>
  findById(id: string): Promise<ProfessorDisciplina | null>
  findByUserAndDisciplina(id_user: string, id_disciplina: string): Promise<ProfessorDisciplina | null>
  findDisciplinasByUser(id_user: string): Promise<Array<{
    id: string
    nome: string
    carga_horaria: number
    total_aulas: number
    carga_horaria_atual: number
    tipo_de_sala: string
    codigo: string | null
    semestre: number
    obrigatoria: boolean
    curso: {
      id: string
      nome: string
      codigo: string
    }
    vinculo: {
      id: string
      ativo: boolean
      created_at: Date
    }
  }>>
  findProfessoresByDisciplina(id_disciplina: string): Promise<Array<{
    id: string
    nome: string
    email: string
    especializacao: string | null
    carga_horaria_max: number | null
    preferencia: string | null
    vinculo: {
      id: string
      ativo: boolean
      created_at: Date
    }
  }>>
  delete(id: string): Promise<void>
}