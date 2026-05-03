import { ProfessorDisciplina, Prisma } from '@prisma/client';
import { ProfessorDisciplinaRepository } from '../professor-disciplina-repository';
import { randomUUID } from 'node:crypto';

export class InMemoryProfessorDisciplinaRepository implements ProfessorDisciplinaRepository {
  public items: ProfessorDisciplina[] = [];
  private usersRepository?: any;
  private disciplinasRepository?: any;

  // metodos auxiliares para simular relacionamentos
  setUsersRepository(usersRepository: any) {
    this.usersRepository = usersRepository;
  }

  setDisciplinasRepository(disciplinasRepository: any) {
    this.disciplinasRepository = disciplinasRepository;
  }

  async create(data: Prisma.ProfessorDisciplinaCreateInput): Promise<ProfessorDisciplina> {
    const professorDisciplina: ProfessorDisciplina = {
      id: randomUUID(),
      id_user: data.user.connect?.id || '',
      id_disciplina: data.disciplina.connect?.id || '',
      ativo: data.ativo ?? true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.items.push(professorDisciplina);
    return professorDisciplina;
  }

  async update(id: string, data: Prisma.ProfessorDisciplinaUpdateInput): Promise<ProfessorDisciplina> {
    const itemIndex = this.items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      throw new Error('Professor-Disciplina não encontrado');
    }

    const currentItem = this.items[itemIndex];
    if (!currentItem) {
      throw new Error('Professor-Disciplina não encontrado');
    }
    
    const updatedItem: ProfessorDisciplina = {
      id: currentItem.id,
      id_user: currentItem.id_user,
      id_disciplina: currentItem.id_disciplina,
      ativo: data.ativo !== undefined ? (data.ativo as boolean) : currentItem.ativo,
      created_at: currentItem.created_at,
      updated_at: new Date(),
    };

    this.items[itemIndex] = updatedItem;
    return updatedItem;
  }

  async findById(id: string): Promise<ProfessorDisciplina | null> {
    const item = this.items.find(item => item.id === id);
    return item || null;
  }

  async findByUserAndDisciplina(id_user: string, id_disciplina: string): Promise<ProfessorDisciplina | null> {
    const item = this.items.find(
      item => item.id_user === id_user && item.id_disciplina === id_disciplina
    );
    return item || null;
  }

  async findDisciplinasByUser(id_user: string): Promise<Array<{
    id: string;
    nome: string;
    carga_horaria: number;
    total_aulas: number;
    carga_horaria_atual: number;
    tipo_de_sala: string;
    codigo: string | null;
    semestre: number;
    obrigatoria: boolean;
    curso: {
      id: string;
      nome: string;
      codigo: string;
    };
    vinculo: {
      id: string;
      ativo: boolean;
      created_at: Date;
    };
  }>> {
    const vinculos = this.items.filter(
      item => item.id_user === id_user && item.ativo
    );

    const result = [];
    for (const vinculo of vinculos) {
      const disciplina = this.disciplinasRepository?.disciplinas?.find((d: any) => d.id === vinculo.id_disciplina);
      if (disciplina) {
        result.push({
          id: disciplina.id,
          nome: disciplina.nome,
          carga_horaria: disciplina.carga_horaria,
          total_aulas: disciplina.total_aulas || 0,
          carga_horaria_atual: disciplina.carga_horaria_atual || 0,
          tipo_de_sala: disciplina.tipo_de_sala || 'NORMAL',
          codigo: disciplina.codigo || null,
          semestre: disciplina.semestre || 1,
          obrigatoria: disciplina.obrigatoria || false,
          curso: {
            id: 'curso-1',
            nome: 'Curso Teste',
            codigo: 'CT001',
          },
          vinculo: {
            id: vinculo.id,
            ativo: vinculo.ativo,
            created_at: vinculo.created_at,
          },
        });
      }
    }
    return result;
  }

  async findProfessoresByDisciplina(id_disciplina: string): Promise<Array<{
    id: string;
    nome: string;
    email: string;
    especializacao: string | null;
    carga_horaria_max: number | null;
    preferencia: string | null;
    vinculo: {
      id: string;
      ativo: boolean;
      created_at: Date;
    };
  }>> {
    const vinculos = this.items.filter(
      item => item.id_disciplina === id_disciplina && item.ativo
    );

    const result = [];
    for (const vinculo of vinculos) {
      const user = this.usersRepository?.items?.find((u: any) => u.id === vinculo.id_user);
      if (user) {
        result.push({
          id: user.id,
          nome: user.nome,
          email: user.email,
          especializacao: user.especializacao || null,
          carga_horaria_max: user.carga_horaria_max || null,
          preferencia: user.preferencia || null,
          vinculo: {
            id: vinculo.id,
            ativo: vinculo.ativo,
            created_at: vinculo.created_at,
          },
        });
      }
    }
    return result;
  }

  async delete(id: string): Promise<void> {
    const itemIndex = this.items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      throw new Error('Professor-Disciplina não encontrado');
    }

    this.items.splice(itemIndex, 1);
  }
}