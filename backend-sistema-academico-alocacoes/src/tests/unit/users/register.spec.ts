import { expect, describe, it, test, beforeEach } from "vitest";
import { RegisterUseCase } from "@/use-cases/users/register";
import { compare } from "bcryptjs";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { UserJaExisteError } from "@/use-cases/errors/email-ja-existe";
import { Role } from "@prisma/client";
import { before } from "node:test";

let userRepository: InMemoryUsersRepository;
let sut: RegisterUseCase;

describe("Register Use Case", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    sut = new RegisterUseCase(userRepository);
  });

  it("Deve ser possivel cadastrar um novo usuario", async () => {
    const { user } = await sut.execute({
      nome: "John Doe",
      email: "jonhdoe@remail.com",
      senha: "123456",
      role: Role.PROFESSOR,
      especializacao: "medico",
      carga_horaria_max: 20,
      preferencia: "sim",
    });

    expect(user.id).toEqual(expect.any(String));
  });

  it("Deve ser hash a senha apos o cadastro", async () => {
    const { user } = await sut.execute({
      nome: "John Doe",
      email: "joaa123an@email.com",
      senha: "123456",
      role: Role.PROFESSOR,
      especializacao: "medico",
      carga_horaria_max: 20,
      preferencia: "sim",
    });

    const isSenhaCorrectlyHashed = await compare("123456", user.senha);
    user.senha;
    expect(isSenhaCorrectlyHashed).toBe(true);
  });

  it("should not be able to register with same email twice", async () => {
    await sut.execute({
      nome: "John Doe",
      email: "123@email.com",
      senha: "123456",
      role: Role.PROFESSOR,
      especializacao: "medico",
      carga_horaria_max: 20,
      preferencia: "sim",
    });

    await expect(
      sut.execute({
        nome: "John Doe",
        email: "123@email.com",
        senha: "123456",
        role: Role.PROFESSOR,
        especializacao: "medico",
        carga_horaria_max: 20,
        preferencia: "sim",
      })
    ).rejects.toBeInstanceOf(UserJaExisteError);
  });
});
