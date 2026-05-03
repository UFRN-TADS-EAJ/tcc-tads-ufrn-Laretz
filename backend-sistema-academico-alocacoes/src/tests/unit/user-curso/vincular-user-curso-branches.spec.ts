import { describe, it, expect } from "vitest";
import { VincularUserCursoUseCase } from "@/use-cases/user-curso/vincular-user-curso";
import { UsersRepository } from "@/repositories/users-repository";
import { CursosRepository } from "@/repositories/cursos-repository";
import { UserCursoRepository } from "@/repositories/user-curso-repository";

class FakeUsersRepo implements UsersRepository {
  items: any[] = [
    { id: "u1", email: "u@ex.com", nome: "U", senha: "x", role: "PROFESSOR" },
  ];
  create: any;
  update: any;
  delete: any;
  async findById(id: string) {
    return this.items.find((i) => i.id === id) ?? null;
  }
  async findByEmail(email: string) {
    return this.items.find((i) => i.email === email) ?? null;
  }
  async findMany(page: number, search?: string) {
    return this.items as any;
  }
}

class FakeCursosRepo implements CursosRepository {
  items: any[] = [{ id: "c1", nome: "C" }];
  async findById(id: string) {
    return this.items.find((i) => i.id === id) ?? null;
  }
  async findByNome(nome: string) {
    return this.items.find((i) => i.nome === nome) ?? null;
  }
  async findByCodigo(codigo: string) {
    return this.items.find((i) => i.codigo === codigo) ?? null;
  }
  create: any;
  update: any;
  delete: any;
  async findMany() {
    return this.items as any;
  }
}

class FakeUserCursoRepo implements UserCursoRepository {
  findCursosByUser(id_user: string): Promise<
    Array<{
      id: string;
      codigo: string;
      nome: string;
      turno: string;
      duracao_semestres: number;
      vinculo: { id: string; ativo: boolean; created_at: Date };
    }>
  > {
    throw new Error("Method not implemented.");
  }
  findUsuariosByCurso(id_curso: string): Promise<
    Array<{
      id: string;
      nome: string;
      email: string;
      role: string;
      especializacao: string | null;
      carga_horaria_max: number | null;
      preferencia: string | null;
      vinculo: { id: string; ativo: boolean; created_at: Date };
    }>
  > {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  vinculo: any = null;
  async findByUserAndCurso(id_user: string, id_curso: string) {
    return this.vinculo;
  }
  async update(id: string, data: any) {
    this.vinculo = { ...this.vinculo, ...data };
    return this.vinculo;
  }
  async create(data: any) {
    this.vinculo = {
      id: "uc1",
      id_user: data.user.connect.id,
      id_curso: data.curso.connect.id,
      ativo: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    return this.vinculo;
  }
}

describe("VincularUserCursoUseCase — reativar e retornar existente", () => {
  it("deve reativar vínculo inativo", async () => {
    const users = new FakeUsersRepo();
    const cursos = new FakeCursosRepo();
    const userCurso = new FakeUserCursoRepo();
    userCurso.vinculo = {
      id: "uc1",
      id_user: "u1",
      id_curso: "c1",
      ativo: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const sut = new VincularUserCursoUseCase(
      userCurso as any,
      users as any,
      cursos as any,
    );
    const { userCurso: vinculo } = await sut.execute({
      id_user: "u1",
      id_curso: "c1",
    });
    expect(vinculo.ativo).toBe(true);
  });

  it("deve retornar vínculo existente ativo", async () => {
    const users = new FakeUsersRepo();
    const cursos = new FakeCursosRepo();
    const userCurso = new FakeUserCursoRepo();
    userCurso.vinculo = {
      id: "uc1",
      id_user: "u1",
      id_curso: "c1",
      ativo: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const sut = new VincularUserCursoUseCase(
      userCurso as any,
      users as any,
      cursos as any,
    );
    const { userCurso: vinculo } = await sut.execute({
      id_user: "u1",
      id_curso: "c1",
    });
    expect(vinculo.ativo).toBe(true);
  });
});
