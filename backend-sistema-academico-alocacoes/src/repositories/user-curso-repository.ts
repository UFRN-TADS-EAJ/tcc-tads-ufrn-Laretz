import { Prisma } from "@prisma/client";

export interface UserCursoRepository {
  create(data: Prisma.UserCursoCreateInput): Promise<{
    id: string;
    id_user: string;
    id_curso: string;
    ativo: boolean;
    created_at: Date;
    updated_at: Date;
  }>;

  findByUserAndCurso(id_user: string, id_curso: string): Promise<{
    id: string;
    id_user: string;
    id_curso: string;
    ativo: boolean;
    created_at: Date;
    updated_at: Date;
  } | null>;

  update(id: string, data: Partial<{
    ativo: boolean;
  }>): Promise<{
    id: string;
    id_user: string;
    id_curso: string;
    ativo: boolean;
    created_at: Date;
    updated_at: Date;
  }>;

  findCursosByUser(id_user: string): Promise<Array<{
    id: string;
    codigo: string;
    nome: string;
    turno: string;
    duracao_semestres: number;
    vinculo: {
      id: string;
      ativo: boolean;
      created_at: Date;
    };
  }>>;

  findUsuariosByCurso(id_curso: string): Promise<Array<{
    id: string;
    nome: string;
    email: string;
    role: string;
    especializacao: string | null;
    carga_horaria_max: number | null;
    preferencia: string | null;
    vinculo: {
      id: string;
      ativo: boolean;
      created_at: Date;
    };
  }>>;

  delete(id: string): Promise<void>;
}