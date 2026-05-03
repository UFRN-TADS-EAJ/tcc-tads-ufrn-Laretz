export class UserJaExisteError extends Error {
    constructor() {
        super('Usuário já existe.')
    }
}