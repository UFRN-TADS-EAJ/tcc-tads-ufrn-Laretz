import { FastifyInstance } from "fastify";
import {
  executeGeneticAllocation,
  getGeneticAllocationStatus,
  cancelGeneticAllocation,
  getGeneticAllocationReport,
} from "./controllers/alocacoes-geneticas";
import { previewGeneticAllocation } from "./controllers/alocacoes-geneticas-preview";
import { routesReservasSala } from "./controllers/reservas-sala/routes";
import { routesCursos } from "./controllers/cursos/routes";
import { routesDisciplinas } from "./controllers/disciplinas/routes";
import { prediosRoutes } from "./controllers/predios/routes";
import { routesTurmas } from "./controllers/turmas/routes";
import { routesUserCurso } from "./controllers/user-curso/routes";
import { routesProfessorDisciplina } from "./controllers/professor-disciplina/routes";
import { routesHorarios } from "./controllers/horarios/routes";
import { routesSalas } from "./controllers/salas/routes";
import { routesUsers } from "./controllers/users/routes";
import { routesAlocacoes } from "./controllers/alocacoes/routes";
import { routesFeedback } from "./controllers/feedback/routes";
import { routesNotificacoes } from "./controllers/notificacoes/routes";
import { routesStats } from "./controllers/stats/routes";
import { routesPeriodosLetivos } from "./controllers/periodos-letivos/routes";

import { verifyJWT } from "./middlewares/verify-jwt";
import { verifyUseRole } from "./middlewares/verify-user-role";

export async function appRoutes(app: FastifyInstance) {
  // Users - Rotas organizadas com schemas Zod
  await app.register(routesUsers);

  // Cursos - Rotas organizadas com schemas Zod
  await app.register(routesCursos);

  // Disciplinas - Rotas organizadas com schemas Zod
  await app.register(routesDisciplinas);

  // Prédios - Rotas organizadas com schemas Zod
  await app.register(prediosRoutes);

  // Turmas - Rotas organizadas com schemas Zod
  await app.register(routesTurmas);

  // User-Curso - Rotas organizadas com schemas Zod
  await app.register(routesUserCurso);

  // Professor-Disciplina - Rotas organizadas com schemas Zod
  await app.register(routesProfessorDisciplina);

  // Horários - Rotas organizadas com schemas Zod
  await app.register(routesHorarios);

  // Salas - Rotas organizadas com schemas Zod
  await app.register(routesSalas);

  // Alocações - Rotas organizadas com schemas Zod
  await app.register(routesAlocacoes);

  // Feedback - Rotas para avaliação de usuários
  await app.register(routesFeedback);

  // Notificações - Rotas organizadas com schemas Zod
  await app.register(routesNotificacoes, { prefix: "/notificacoes" });

  // Reservas de Sala - Novas rotas organizadas com schemas Zod
  await app.register(routesReservasSala);

  // Períodos Letivos
  await app.register(routesPeriodosLetivos);

  // Dashboard/Estatísticas
  await app.register(routesStats);

  // Alocações Genéticas 
  app.post("/alocacoes/genetica", executeGeneticAllocation);
  app.post("/alocacoes/genetica/preview", previewGeneticAllocation);
  app.get("/alocacoes/genetica/:turmaId/status", getGeneticAllocationStatus);
  app.delete("/alocacoes/genetica/:turmaId", cancelGeneticAllocation);
  app.get("/alocacoes/genetica/:turmaId/relatorio", getGeneticAllocationReport);

}
