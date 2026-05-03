import { AlocacoesRepository } from "../../repositories/alocacoes-repository";
import { UsersRepository } from "../../repositories/users-repository";
import { PeriodosLetivosRepository } from "@/repositories/periodos-letivos-repository";

export class BuscarCargaHorariaProfessoresUseCase {
  constructor(
    private alocacoesRepository: AlocacoesRepository,
    private usersRepository: UsersRepository,
    private periodosRepository: PeriodosLetivosRepository,
  ) {}

  async execute() {
    const periodoAtivo = await this.periodosRepository.findActive();
    if (!periodoAtivo) {
      throw new Error("Nenhum período letivo ativo encontrado");
    }

    // Buscar todos os usuários (todas as páginas) e filtrar apenas professores
    let todosUsuarios = [];
    let page = 1;
    let usuariosPagina;

    do {
      usuariosPagina = await this.usersRepository.findMany(page, "");
      todosUsuarios.push(...usuariosPagina);
      page++;
    } while (usuariosPagina.length === 20);

    const professores = todosUsuarios.filter(
      (user) =>
        user.role === "PROFESSOR" ||
        user.role === "ADMIN" ||
        user.role === "COORDENADOR"
    );

    const cargaHoraria: Record<string, number> = {};

    // Para cada professor, contar suas alocações
    for (const professor of professores) {
      try {
        // Buscar todas as alocaçõe
        let todasAlocacoes = [];
        let page = 1;
        let alocacoesPagina;

        do {
          alocacoesPagina = await this.alocacoesRepository.findByUserId(
            professor.id,
            page,
            periodoAtivo.id,
          );
          todasAlocacoes.push(...alocacoesPagina);
          page++;
        } while (alocacoesPagina.length === 20);

        cargaHoraria[professor.id] = todasAlocacoes.length;
      } catch (error) {
        console.error(
          `Erro ao buscar alocações do professor ${professor.id}:`,
          error
        );
        cargaHoraria[professor.id] = 0;
      }
    }

    return {
      cargaHoraria,
    };
  }
}
