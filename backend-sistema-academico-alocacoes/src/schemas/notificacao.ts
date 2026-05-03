import { z } from "zod";

const notificacaoTypeSchema = z
  .enum(["SOLICITACAO_TROCA_SALA", "GENERICA"])
  .describe("Tipo da notificação");

const notificacaoStatusSchema = z.enum(["PENDENTE", "LIDA", "RESPONDIDA"]);

// schema: core (notificação)
export const notificacaoSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: notificacaoTypeSchema,
  title: z.string(),
  message: z.string(),
  status: notificacaoStatusSchema,
  replyMessage: z.string().nullable().optional(),
  metadata: z.unknown().optional(),
  created_at: z.date(),
  read_at: z.date().nullable().optional(),
  responded_at: z.date().nullable().optional(),
});

// schema: body criar notificação
export const criarNotificacaoBodySchema = z.object({
  userId: z.string().uuid(),
  type: notificacaoTypeSchema,
  title: z.string().min(1),
  message: z.string().min(1),
  metadata: z.unknown().optional(),
});

// schema: response criar notificação
export const criarNotificacaoResponseSchema = z.object({
  notificacao: notificacaoSchema,
});

// schema: query listar notificações
export const listarNotificacoesQuerySchema = z.object({
  status: notificacaoStatusSchema.optional(),
});

// schema: response listar notificações
export const listarNotificacoesResponseSchema = z.object({
  notificacoes: z.array(notificacaoSchema),
});

// schema: params marcar notificação como lida
export const marcarNotificacaoLidaParamsSchema = z.object({
  id: z.string().uuid(),
});

// schema: params responder notificação
export const responderNotificacaoParamsSchema = z.object({
  id: z.string().uuid(),
});

// schema: body responder notificação
export const responderNotificacaoBodySchema = z.object({
  replyMessage: z.string().min(1),
});

// schema: response responder notificação
export const responderNotificacaoResponseSchema = z.object({
  notificacao: notificacaoSchema,
});

