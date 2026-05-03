export interface CursoDisciplina {
  id: string;
  id_curso: string;
  id_disciplina: string;
}

export interface CursoDisciplinaRepository {
  findById(id: string): Promise<CursoDisciplina | null>;
  findFirstByCursoAndDisciplina(id_curso: string, id_disciplina: string): Promise<CursoDisciplina | null>;
  findManyByCursoId(id_curso: string): Promise<CursoDisciplina[]>;
  create(data: { id_curso: string; id_disciplina: string }): Promise<CursoDisciplina>;
  deleteById(id: string): Promise<void>;
}
