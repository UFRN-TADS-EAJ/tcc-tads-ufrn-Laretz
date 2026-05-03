import { PrismaDisciplinasRepository } from "@/repositories/prisma-repositories/prisma-disciplinas-repository";
import { BuscarDisciplinaUseCase } from "@/use-cases/disciplina/buscar-disciplina";

export function makeBuscarDisciplinaUseCase() {
    const disciplinasRepository = new PrismaDisciplinasRepository();
    const buscarDisciplinaUseCase = new BuscarDisciplinaUseCase(disciplinasRepository);
    
    return buscarDisciplinaUseCase;
}
