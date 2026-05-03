import { randomUUID } from "node:crypto";
import { UserCursoRepository } from "../user-curso-repository";
import type { Prisma } from "@prisma/client";

interface UserCurso {
  id: string;
  id_user: string;
  id_curso: string;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

interface User {
  id: string;
  nome: string;
  email: string;
  role: string;
  especializacao: string | null;
  carga_horaria_max: number | null;
  preferencia: string | null;
}

interface Curso {
  id: string;
  codigo: string;
  nome: string;
  turno: string;
  duracao_semestres: number;
}

export class InMemoryUserCursoRepository implements UserCursoRepository {
  public items: UserCurso[] = [];
  
  constructor(
    private cursosRepository?: { items: Curso[] },
    private usersRepository?: { items: User[] }
  ) {}

  async create(data: Prisma.UserCursoCreateInput): Promise<UserCurso> {
    const userCurso: UserCurso = {
      id: randomUUID(),
      id_user: (typeof data.user === 'object' && 'connect' in data.user && data.user.connect?.id) || '',
      id_curso: (typeof data.curso === 'object' && 'connect' in data.curso && data.curso.connect?.id) || '',
      ativo: data.ativo ?? true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.items.push(userCurso);
    return userCurso;
  }

  async findByUserAndCurso(id_user: string, id_curso: string): Promise<UserCurso | null> {
    const userCurso = this.items.find(
      (item) => item.id_user === id_user && item.id_curso === id_curso
    );

    return userCurso || null;
  }

  async update(id: string, data: Partial<{ ativo: boolean }>): Promise<UserCurso> {
    const userCursoIndex = this.items.findIndex((item) => item.id === id);

    if (userCursoIndex === -1) {
      throw new Error("UserCurso not found");
    }

    const currentUserCurso = this.items[userCursoIndex];
    if (!currentUserCurso) {
      throw new Error("UserCurso not found");
    }
    
    const updatedUserCurso: UserCurso = {
      id: currentUserCurso.id,
      id_user: currentUserCurso.id_user,
      id_curso: currentUserCurso.id_curso,
      ativo: data.ativo !== undefined ? data.ativo : currentUserCurso.ativo,
      created_at: currentUserCurso.created_at,
      updated_at: new Date(),
    };

    this.items[userCursoIndex] = updatedUserCurso;
    return updatedUserCurso;
  }

  async findCursosByUser(id_user: string): Promise<Array<{
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
  }>> {
    const userCursos = this.items.filter(
      (item) => item.id_user === id_user && item.ativo
    );

    return userCursos.map((uc) => {
      if (!this.cursosRepository) throw new Error("Cursos repository not injected");
      const curso = this.cursosRepository.items.find((c) => c.id === uc.id_curso);
      if (!curso) throw new Error("Curso not found");

      return {
        id: curso.id,
        codigo: curso.codigo,
        nome: curso.nome,
        turno: curso.turno,
        duracao_semestres: curso.duracao_semestres,
        vinculo: {
          id: uc.id,
          ativo: uc.ativo,
          created_at: uc.created_at,
        },
      };
    });
  }

  async findUsuariosByCurso(id_curso: string): Promise<Array<{
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
  }>> {
    const userCursos = this.items.filter(
      (item) => item.id_curso === id_curso && item.ativo
    );

    return userCursos.map((uc) => {
      if (!this.usersRepository) throw new Error("Users repository not injected");
      const user = this.usersRepository.items.find((u) => u.id === uc.id_user);
      if (!user) throw new Error("User not found");

      return {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        especializacao: user.especializacao,
        carga_horaria_max: user.carga_horaria_max,
        preferencia: user.preferencia,
        vinculo: {
          id: uc.id,
          ativo: uc.ativo,
          created_at: uc.created_at,
        },
      };
    });
  }

  async delete(id: string): Promise<void> {
    const userCursoIndex = this.items.findIndex((item) => item.id === id);

    if (userCursoIndex === -1) {
      throw new Error("UserCurso not found");
    }

    this.items.splice(userCursoIndex, 1);
  }

}
