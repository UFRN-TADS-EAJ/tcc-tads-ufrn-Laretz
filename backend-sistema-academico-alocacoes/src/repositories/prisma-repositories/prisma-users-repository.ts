import { Prisma, User } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { UsersRepository } from "../users-repository";

export class PrismaUsersRepository implements UsersRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data,
    });
    return user;
  }

  async findById(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        cursos: {
          where: { ativo: true },
          include: {
            curso: true,
          },
        },
      },
    });
    return user;
  }

  async findMany(page: number, search?: string): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { nome: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { especializacao: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      skip: (page - 1) * 20,
      take: 20,
      include: {
        cursos: {
          where: { ativo: true },
          include: {
            curso: true,
          },
        },
      },
      orderBy: { nome: "asc" },
    });

    if (!users) {
      return [];
    }

    return users;
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return user;
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}
