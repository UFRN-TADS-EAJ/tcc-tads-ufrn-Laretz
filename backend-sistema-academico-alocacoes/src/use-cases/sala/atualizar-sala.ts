import { SalasRepository } from "../../repositories/salas-repository";
import { RecursoNaoEncontradoError } from "../errors/recurso-nao-encontrado";

interface AtualizarSalaUseCaseRequest {
    id: string;
    nome: string | undefined;
    predioId: string | undefined;
    capacidade: number | undefined;
    tipo: string | undefined;
}

export class AtualizarSalaUseCase {
    constructor(private salasRepository: SalasRepository) {}

    async execute({ id, nome, predioId, capacidade, tipo }: AtualizarSalaUseCaseRequest) {
        const salaExiste = await this.salasRepository.findById(id);

        if (!salaExiste) {
            throw new RecursoNaoEncontradoError();
        }

        // Cria um objeto com apenas os campos que foram fornecidos
        const updateData: Partial<{
            nome: string;
            predioId: string;
            capacidade: number;
            tipo: string;
        }> = {};
        if (nome !== undefined) updateData.nome = nome;
        if (predioId !== undefined) updateData.predioId = predioId;
        if (capacidade !== undefined) updateData.capacidade = capacidade;
        if (tipo !== undefined) updateData.tipo = tipo;
        
        const sala = await this.salasRepository.update(id, updateData);

        return { sala };
    }
}