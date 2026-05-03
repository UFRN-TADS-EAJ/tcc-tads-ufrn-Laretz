import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),
  PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  // Parâmetros do Algoritmo Genético
  GA_POPULATION_SIZE: z.coerce.number().default(100),
  GA_GENERATIONS: z.coerce.number().default(500),
  GA_MUTATION_RATE: z.coerce.number().default(0.1),
  GA_CROSSOVER_RATE: z.coerce.number().default(0.8),
  GA_ELITISM_RATE: z.coerce.number().default(0.1),
  // Pesos e multiplicadores de penalidade/bonificação
  GA_HARD_PENALTY_MULTIPLIER: z.coerce.number().default(1),
  GA_WEIGHT_PROFESSOR_AVAILABILITY: z.coerce.number().default(1000),
  GA_WEIGHT_ROOM_AVAILABILITY: z.coerce.number().default(1000),
  GA_WEIGHT_ROOM_CAPACITY: z.coerce.number().default(800),
  GA_WEIGHT_ROOM_TYPE_COMPATIBILITY: z.coerce.number().default(600),
  GA_WEIGHT_WORKLOAD_LIMIT: z.coerce.number().default(400),
  GA_WEIGHT_TURMA_AVAILABILITY: z.coerce.number().default(1000),
  // Pesos de soft constraints já existentes
  GA_WEIGHT_DAY_INTERVAL_QUALITY: z.coerce.number().default(20),
  GA_WEIGHT_CONSECUTIVE_CLASSES: z.coerce.number().default(30),
  GA_WEIGHT_AVOID_INTRA_DAY_GAPS: z.coerce.number().default(80),
  GA_WEIGHT_AVOID_SATURDAY: z.coerce.number().default(30),
  GA_WEIGHT_AVOID_T6: z.coerce.number().default(120),
  GA_WEIGHT_PRIORITIZE_EARLY_SLOTS: z.coerce.number().default(40),
  GA_WEIGHT_AVOID_START_AT_2: z.coerce.number().default(50),
  // Novos pesos hard constraints
  GA_WEIGHT_NO_SUNDAY: z.coerce.number().default(2000),
  GA_SOFT_MULTIPLIER: z.coerce.number().default(1)
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables.');
}

export const env = _env.data;