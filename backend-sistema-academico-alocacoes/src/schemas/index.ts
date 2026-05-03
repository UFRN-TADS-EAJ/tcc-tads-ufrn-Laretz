/* exportacoes centralizadas de schemas */
export { z } from "zod";

// Schemas comuns
export * from "./common";

// Schemas específicos por domínio
export * from "./alocacao";
export * from "./curso";
export * from "./disciplina";
export * from "./predio";
export * from "./turma";
export * from "./user";
export * from "./sala";
export * from "./reserva-sala";
export * from "./horarios";
export * from "./feedback";
export * from "./notificacao";
export * from "./periodo-letivo";
export * from "./stats";
export * from "./user-curso";
export * from "./professor-disciplina";
