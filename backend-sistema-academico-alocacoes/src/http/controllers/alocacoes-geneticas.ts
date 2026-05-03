import { FastifyRequest, FastifyReply } from 'fastify';
import { AllocationService } from '../../algorithms/allocation/allocation-service';
import { z } from 'zod';

// Schema de validação para requisição de alocação genética
const executeGeneticAllocationBodySchema = z.object({
  turmaId: z.string().uuid('ID da turma deve ser um UUID válido'),
  params: z.object({
    populationSize: z.number().int().min(10).max(1000).optional().default(100),
    generations: z.number().int().min(10).max(2000).optional().default(500),
    mutationRate: z.number().min(0).max(1).optional().default(0.1),
    crossoverRate: z.number().min(0).max(1).optional().default(0.8),
    elitismRate: z.number().min(0).max(1).optional().default(0.1),
    maxStagnation: z.number().int().min(10).max(500).optional().default(50)
  }).optional().default({})
});

const getTurmaParamsSchema = z.object({
  turmaId: z.string().uuid('ID da turma deve ser um UUID válido')
});

/**
 * Controller para executar algoritmo genético de alocação
 */
export async function executeGeneticAllocation(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Validar dados da requisição
    const { turmaId, params } = executeGeneticAllocationBodySchema.parse(request.body);
    
    // Criar instância do serviço de alocação
    const allocationService = new AllocationService();
    
    // Executar algoritmo genético
    const result = await allocationService.execute({
      turmaId,
      params
    });
    
    if (!result.success) {
      return reply.status(400).send({
        error: 'Erro na execução do algoritmo genético',
        message: result.error,
        details: result.details
      });
    }
    
    return reply.status(200).send({
      success: true,
      message: 'Alocação genética executada com sucesso',
      data: {
        turmaId: result.turmaId,
        alocacoes: result.alocacoes,
        fitness: result.fitness,
        conflitos: result.conflitos,
        relatorio: result.relatorio,
        estatisticas: {
          geracoes: result.geracoes,
          tempoExecucao: result.tempoExecucao,
          melhorFitness: result.melhorFitness,
          convergencia: result.convergencia
        }
      }
    });
    
  } catch (error) {
    console.error('Erro no controller de alocação genética:', error);
    
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Dados de entrada inválidos',
        details: error.errors.map(err => ({
          campo: err.path.join('.'),
          mensagem: err.message
        }))
      });
    }
    
    return reply.status(500).send({
      error: 'Erro interno do servidor',
      message: 'Falha na execução do algoritmo genético'
    });
  }
}

/**
 * Controller para obter status de uma alocação genética
 */
export async function getGeneticAllocationStatus(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { turmaId } = getTurmaParamsSchema.parse(request.params);
    
    const allocationService = new AllocationService();
    const status = await allocationService.getStatus(turmaId);
    
    return reply.status(200).send({
      success: true,
      data: status
    });
    
  } catch (error) {
    console.error('Erro ao obter status da alocação genética:', error);
    
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Parâmetros inválidos',
        details: error.errors
      });
    }
    
    return reply.status(500).send({
      error: 'Erro interno do servidor'
    });
  }
}

/**
 * Controller para cancelar execução de algoritmo genético
 */
export async function cancelGeneticAllocation(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { turmaId } = getTurmaParamsSchema.parse(request.params);
    
    const allocationService = new AllocationService();
    const result = await allocationService.cancel(turmaId);
    
    if (!result.success) {
      return reply.status(400).send({
        error: 'Erro ao cancelar alocação',
        message: result.error
      });
    }
    
    return reply.status(200).send({
      success: true,
      message: 'Alocação genética cancelada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao cancelar alocação genética:', error);
    
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Parâmetros inválidos',
        details: error.errors
      });
    }
    
    return reply.status(500).send({
      error: 'Erro interno do servidor'
    });
  }
}

/**
 * Controller para obter relatório detalhado de uma alocação
 */
export async function getGeneticAllocationReport(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { turmaId } = getTurmaParamsSchema.parse(request.params);
    
    const allocationService = new AllocationService();
    const report = await allocationService.getDetailedReport(turmaId);
    
    if (!report) {
      return reply.status(404).send({
        error: 'Relatório não encontrado',
        message: 'Nenhuma alocação encontrada para esta turma'
      });
    }
    
    return reply.status(200).send({
      success: true,
      data: report
    });
    
  } catch (error) {
    console.error('Erro ao obter relatório da alocação genética:', error);
    
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Parâmetros inválidos',
        details: error.errors
      });
    }
    
    return reply.status(500).send({
      error: 'Erro interno do servidor'
    });
  }
}
