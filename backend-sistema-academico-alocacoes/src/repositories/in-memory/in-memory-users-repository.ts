import type { Prisma, User, Role } from "@prisma/client";
import { UsersRepository } from "../users-repository";

export class InMemoryUsersRepository implements UsersRepository {

  public items: User[] = [];

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user: User = {
      id: `user-${this.items.length + 1}`,
      nome: data.nome,
      email: data.email,
      senha: data.senha,
      role: data.role as Role,
      especializacao: data.especializacao ?? null,
      preferencia: data.preferencia ?? null,
      carga_horaria_max: data.carga_horaria_max ?? null,
    };

    this.items.push(user);

    return user;
  }


    async findById(id: string): Promise<User | null> {
    const user = this.items.find((u) => u.id === id);
    return user ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((u) => u.email === email);
    return user ?? null;
  }

  async findMany(page: number, search?: string): Promise<User[]> {
    let filteredUsers = this.items;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = this.items.filter((user) => 
        user.nome.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.especializacao && user.especializacao.toLowerCase().includes(searchLower))
      );
    }
    
    const startIndex = (page - 1) * 20;
    const endIndex = startIndex + 20;
    
    return filteredUsers.slice(startIndex, endIndex);
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    const userIndex = this.items.findIndex((u) => u.id === id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const currentUser = this.items[userIndex];
    if (!currentUser) {
      throw new Error('User not found');
    }
    
    const updatedUser: User = {
      ...currentUser,
      nome: (data.nome as string) ?? currentUser.nome,
      email: (data.email as string) ?? currentUser.email,
      senha: (data.senha as string) ?? currentUser.senha,
      role: (data.role as Role) ?? currentUser.role,
      especializacao: data.especializacao !== undefined ? (data.especializacao as string | null) : currentUser.especializacao,
      preferencia: data.preferencia !== undefined ? (data.preferencia as string | null) : currentUser.preferencia,
      carga_horaria_max: data.carga_horaria_max !== undefined ? (data.carga_horaria_max as number | null) : currentUser.carga_horaria_max,
    };
    
    this.items[userIndex] = updatedUser;
    
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const userIndex = this.items.findIndex((u) => u.id === id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    this.items.splice(userIndex, 1);
  }
}
