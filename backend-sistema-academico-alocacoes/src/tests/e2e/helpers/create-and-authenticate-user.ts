import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { FastifyInstance } from "fastify";
import request from "supertest";

export async function createAndAuthenticateUser(
  app: FastifyInstance,
  isAdmin = false,
  email?: string,
) {
  const uniqueEmail = email ?? `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@test.local`;

  await prisma.user.create({
    data: {
      nome: "John Doe",
      email: uniqueEmail,
      senha: await hash("123456", 6),
      role: isAdmin ? "ADMIN" : "PROFESSOR",
    },
  });

  const authResponse = await request(app.server).post("/session").send({
    email: uniqueEmail,
    senha: "123456",
  });

  const { token } = authResponse.body;

  return { token, email: uniqueEmail };
}
