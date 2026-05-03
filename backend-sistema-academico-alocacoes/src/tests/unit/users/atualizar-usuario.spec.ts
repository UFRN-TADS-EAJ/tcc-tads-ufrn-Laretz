import { describe, it, expect } from "vitest";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { AtualizarUsuarioUseCase } from "@/use-cases/users/atualizar-usuario";
import { UserJaExisteError } from "@/use-cases/errors/email-ja-existe";
import { compare } from "bcryptjs";

describe("AtualizarUsuarioUseCase", () => {
  it("deve atualizar campos e hash da senha", async () => {
    const repo = new InMemoryUsersRepository();
    const created = await repo.create({
      nome: "Fulano",
      email: "fulano@ex.com",
      senha: "hash",
      role: "PROFESSOR",
      especializacao: "Alguma",
      carga_horaria_max: 30,
      preferencia: "Manhã",
    });

    const sut = new AtualizarUsuarioUseCase(repo);
    const { usuario } = await sut.execute({
      id: created.id,
      nome: "Fulano Atualizado",
      email: "novo@ex.com",
      senha: "nova-senha",
      role: "COORDENADOR",
      especializacao: "Outra",
      carga_horaria_max: 35,
      preferencia: "Tarde",
    });

    expect(usuario.nome).toBe("Fulano Atualizado");
    expect(usuario.email).toBe("novo@ex.com");
    expect(usuario.role).toBe("COORDENADOR");
    expect(usuario.especializacao).toBe("Outra");
    expect(usuario.carga_horaria_max).toBe(35);
    expect(usuario.preferencia).toBe("Tarde");
    const senhaOk = await compare("nova-senha", usuario.senha);
    expect(senhaOk).toBe(true);
  });

  it("deve falhar ao atualizar email para um já existente", async () => {
    const repo = new InMemoryUsersRepository();
    const u1 = await repo.create({ nome: "A", email: "a@ex.com", senha: "h", role: "PROFESSOR" });
    await repo.create({ nome: "B", email: "b@ex.com", senha: "h", role: "PROFESSOR" });

    const sut = new AtualizarUsuarioUseCase(repo);
    await expect(
      sut.execute({ id: u1.id, email: "b@ex.com" })
    ).rejects.toBeInstanceOf(UserJaExisteError);
  });
});