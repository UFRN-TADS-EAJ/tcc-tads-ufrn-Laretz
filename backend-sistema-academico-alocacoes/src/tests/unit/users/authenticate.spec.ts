import {expect, describe, it, test, beforeEach} from "vitest";
import { compare, hash } from "bcryptjs";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { AuthenticateUseCase } from "@/use-cases/users/authenticate";
import { CredenciaisInvalidas } from "@/use-cases/errors/credenciais-invalidas";
import { before } from "node:test";

let userRepository: InMemoryUsersRepository;
let sut: AuthenticateUseCase;

describe('Authenticate Use Case', () => {

    beforeEach(() => {
        userRepository = new InMemoryUsersRepository();     
        sut = new AuthenticateUseCase(userRepository);
    })

    it('Deve ser possivel se autenticar', async () => {


        await userRepository.create({
            nome: 'alow',
            email: 'jonhdoe@email.com',
            senha: await hash('123456', 6),

        })

        const { user } = await sut.execute({
            email: 'jonhdoe@email.com',
            senha: '123456',
        })

        expect(user.id).toEqual(expect.any(String));
    })

        it('Nao deve ser possivel se autenticar com email que nao existe', async () => {

        await expect(() =>  sut.execute({
            email: 'jonhdoe@email.com',
            senha: '123456',
        })).rejects.toBeInstanceOf(CredenciaisInvalidas)


    })

        it('Deve ser possivel se autenticar', async () => {

        await userRepository.create({
            nome: 'alow',
            email: 'jonhdoe@email.com',
            senha: await hash('123456', 6),

        })

        const { user } = await sut.execute({
            email: 'jonhdoe@email.com',
            senha: '123456',
        })

        expect(user.id).toEqual(expect.any(String));
    })

})