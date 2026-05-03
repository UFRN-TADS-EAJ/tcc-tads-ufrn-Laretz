import { CursoDisciplinaRepository, CursoDisciplina } from "../curso-disciplina-repository";
import { randomUUID } from "node:crypto";

export class InMemoryCursoDisciplinaRepository implements CursoDisciplinaRepository {
  public items: CursoDisciplina[] = [];

  async findById(id: string): Promise<CursoDisciplina | null> {
    return this.items.find(i => i.id === id) ?? null;
  }

  async findFirstByCursoAndDisciplina(id_curso: string, id_disciplina: string): Promise<CursoDisciplina | null> {
    return this.items.find(i => i.id_curso === id_curso && i.id_disciplina === id_disciplina) ?? null;
  }

  async create(data: { id_curso: string; id_disciplina: string }): Promise<CursoDisciplina> {
    const item: CursoDisciplina = { id: randomUUID(), id_curso: data.id_curso, id_disciplina: data.id_disciplina };
    this.items.push(item);
    return item;
  }

  async findManyByCursoId(id_curso: string): Promise<CursoDisciplina[]> {
    return this.items.filter((i) => i.id_curso === id_curso);
  }

  async deleteById(id: string): Promise<void> {
    this.items = this.items.filter((i) => i.id !== id);
  }
}
