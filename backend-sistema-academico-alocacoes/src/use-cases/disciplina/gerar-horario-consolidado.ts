import { AlocacoesRepository } from "../../repositories/alocacoes-repository";

interface GerarHorarioConsolidadoUseCaseRequest {
  disciplinaId: string;
  periodoId: string;
}

interface GerarHorarioConsolidadoUseCaseResponse {
  horarioConsolidado: string;
}

export class GerarHorarioConsolidadoUseCase {
  constructor(private alocacoesRepository: AlocacoesRepository) {}

  async execute({
    disciplinaId,
    periodoId,
  }: GerarHorarioConsolidadoUseCaseRequest): Promise<GerarHorarioConsolidadoUseCaseResponse> {
    const alocacoes = await this.alocacoesRepository.findByDisciplinaId(
      disciplinaId,
      periodoId,
    );

    if (!alocacoes || alocacoes.length === 0) {
      return { horarioConsolidado: '' };
    }

    // Mapear dias da semana para números
    const diasMap: { [key: string]: string } = {
       'SEGUNDA': '2',
       'TERCA': '3', 
       'QUARTA': '4',
       'QUINTA': '5',
       'SEXTA': '6',
       'SABADO': '7'
     };

    // Agrupar alocações por dia da semana
    const alocacoesPorDia = new Map<string, typeof alocacoes>();
    
    for (const alocacao of alocacoes) {
      if (!alocacao.horario) continue;
      
      const dia = alocacao.horario.dia_semana;
      if (!alocacoesPorDia.has(dia)) {
        alocacoesPorDia.set(dia, []);
      }
      const alocacoesDia = alocacoesPorDia.get(dia);
      if (alocacoesDia) {
        alocacoesDia.push(alocacao);
      }
    }

    // Processar cada dia e gerar padrões de horário
    const padroesPorHorario = new Map<string, string[]>();
    
    for (const [dia, alocacoesDoDia] of alocacoesPorDia) {
      // Ordenar por código do horário para garantir sequência
      alocacoesDoDia.sort((a, b) => a.horario.codigo.localeCompare(b.horario.codigo));
      
      const codigosDia = diasMap[dia];
      if (!codigosDia) continue;
      
      const primeiraAlocacao = alocacoesDoDia[0];
      if (!primeiraAlocacao?.horario?.codigo) continue;
      
      const turno = primeiraAlocacao.horario.codigo.charAt(0); // M, T, N
      
      // Obter códigos dos horários e verificar sequencialidade
      const codigosHorarios = alocacoesDoDia.map(alocacao => alocacao.horario.codigo).sort();
      const numerosHorarios = codigosHorarios.map(codigo => parseInt(codigo.charAt(1)));
      
      // Verificar se os números são sequenciais
      const saoSequenciais = this.verificarSequenciais(numerosHorarios.map(n => n.toString()));
      
      let padraoHorario: string;
      
      if (codigosHorarios.length === 1) {
        // Aula isolada - usar apenas o número do horário
        const numeroHorario = numerosHorarios[0];
        padraoHorario = `${turno}${numeroHorario}`;
      } else if (saoSequenciais) {
        // Múltiplas aulas sequenciais - usar todos os números
        const sequenciaNumerica = numerosHorarios.join('');
        padraoHorario = `${turno}${sequenciaNumerica}`;
      } else {
        // Múltiplas aulas não sequenciais - tratar cada uma separadamente
        numerosHorarios.forEach(numero => {
          const padraoIndividual = `${turno}${numero}`;
          if (!padroesPorHorario.has(padraoIndividual)) {
            padroesPorHorario.set(padraoIndividual, []);
          }
          const padraoArray = padroesPorHorario.get(padraoIndividual);
          if (padraoArray) {
            padraoArray.push(codigosDia);
          }
        });
        continue; // Pular o resto do loop para este dia
      }
      
      if (!padroesPorHorario.has(padraoHorario)) {
        padroesPorHorario.set(padraoHorario, []);
      }
      const padraoArray = padroesPorHorario.get(padraoHorario);
      if (padraoArray) {
        padraoArray.push(codigosDia);
      }
    }

    // Gerar horários consolidados agrupando dias consecutivos com mesmo padrão
    const horariosConsolidados: string[] = [];
    
    for (const [padraoHorario, diasCodigos] of padroesPorHorario) {
      if (diasCodigos.length === 1) {
        horariosConsolidados.push(`${diasCodigos[0]}${padraoHorario}`);
      } else {
        // Verificar se os dias são consecutivos
        const diasNumericos = diasCodigos.map(d => parseInt(d)).sort((a, b) => a - b);
        const saoConsecutivos = this.verificarDiasConsecutivos(diasNumericos);
        
        if (saoConsecutivos && diasNumericos.length > 1) {
           const primeiroDay = diasNumericos[0];
           const ultimoDay = diasNumericos[diasNumericos.length - 1];
           horariosConsolidados.push(`${primeiroDay}${ultimoDay}${padraoHorario}`);
         } else {
          // Dias não consecutivos, manter separados
          for (const dia of diasCodigos) {
            horariosConsolidados.push(`${dia}${padraoHorario}`);
          }
        }
      }
    }

    return { horarioConsolidado: horariosConsolidados.join(', ') };
  }

  private verificarSequencialidade(alocacoes: any[]): string[] {
    return alocacoes.map(alocacao => alocacao.horario.codigo);
  }

  private verificarSequenciais(numeros: string[]): boolean {
    if (numeros.length <= 1) return true;
    
    const numerosOrdenados = numeros.map(n => parseInt(n)).sort((a, b) => a - b);
    
    for (let i = 1; i < numerosOrdenados.length; i++) {
      const numeroAtual = numerosOrdenados[i];
      const numeroAnterior = numerosOrdenados[i - 1];
      if (numeroAtual !== undefined && numeroAnterior !== undefined && numeroAtual !== numeroAnterior + 1) {
        return false;
      }
    }
    
    return true;
  }

  private verificarDiasConsecutivos(dias: number[]): boolean {
    if (dias.length <= 1) return true;
    
    for (let i = 1; i < dias.length; i++) {
      const diaAtual = dias[i];
      const diaAnterior = dias[i - 1];
      if (diaAtual !== undefined && diaAnterior !== undefined && diaAtual !== diaAnterior + 1) {
        return false;
      }
    }
    return true;
  }
}
