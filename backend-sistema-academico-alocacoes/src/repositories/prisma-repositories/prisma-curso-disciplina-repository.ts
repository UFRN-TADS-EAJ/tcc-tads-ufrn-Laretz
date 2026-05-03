import { prisma } from "@/lib/prisma";
import { CursoDisciplinaRepository, CursoDisciplina } from "../curso-disciplina-repository";

export class PrismaCursoDisciplinaRepository implements CursoDisciplinaRepository {
  async findById(id: string): Promise<CursoDisciplina | null> {
    const res = await prisma.cursoDisciplina.findUnique({
      where: { id },
      select: { id: true, id_curso: true, id_disciplina: true },
    });
    return res ?? null;
  }

  async findFirstByCursoAndDisciplina(id_curso: string, id_disciplina: string): Promise<CursoDisciplina | null> {
    const res = await prisma.cursoDisciplina.findFirst({
      where: { id_curso, id_disciplina },
      select: { id: true, id_curso: true, id_disciplina: true },
    });
    return res ?? null;
  }

  async create(data: { id_curso: string; id_disciplina: string }): Promise<CursoDisciplina> {
    const res = await prisma.cursoDisciplina.create({
      data,
      select: { id: true, id_curso: true, id_disciplina: true },
    });
    return res;
  }

  async findManyByCursoId(id_curso: string): Promise<CursoDisciplina[]> {
    const res = await prisma.cursoDisciplina.findMany({
      where: { id_curso },
      select: { id: true, id_curso: true, id_disciplina: true },
    });
    return res ?? [];
  }

  async deleteById(id: string): Promise<void> {
    await prisma.cursoDisciplina.delete({ where: { id } });
  }
}
