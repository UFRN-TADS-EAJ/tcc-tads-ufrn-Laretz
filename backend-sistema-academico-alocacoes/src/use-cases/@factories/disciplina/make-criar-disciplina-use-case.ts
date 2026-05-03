import { PrismaDisciplinasRepository } from "@/repositories/prisma-repositories/prisma-disciplinas-repository";
import { CriarDisciplinaUseCase } from "@/use-cases/disciplina/criar-disciplina";

export function makeCriarDisciplinaUseCase() {
    const disciplinasRepository = new PrismaDisciplinasRepository();
    const criarDisciplinaUseCase = new CriarDisciplinaUseCase(disciplinasRepository);
    
    return criarDisciplinaUseCase;
}
