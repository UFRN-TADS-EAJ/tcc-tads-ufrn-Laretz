import {expect, describe, it, test, beforeEach} from "vitest";
import { compare, hash } from "bcryptjs";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { GetUserProfileUseCase } from "@/use-cases/users/get-user-profile";
import { RecursoNaoEncontradoError } from "@/use-cases/errors/recurso-nao-encontrado";

let userRepository: InMemoryUsersRepository;
let sut: GetUserProfileUseCase;

describe('Get  User Profile Use Case', () => {

    beforeEach(() => {
        userRepository = new InMemoryUsersRepository();     
        sut = new GetUserProfileUseCase(userRepository);
    })

    it('Deve ser possivel se acessar perfil do usuario', async () => {
        const createdUser = await userRepository.create({
            nome: 'alow',
            email: 'jonhdoe@email.com',
            senha: await hash('123456', 6),

        })

        const { user } = await sut.execute({
            userId: createdUser.id,
        })

        expect(user.id).toEqual(expect.any(String));
        expect(user.nome).toEqual('alow');
    })

    it('Nao deve ser possivel acessar perfil do usuario com id errado', async () => {

        await expect(() =>  sut.execute({
          userId: 'id-errado',
        })).rejects.toBeInstanceOf(RecursoNaoEncontradoError)


    })



})