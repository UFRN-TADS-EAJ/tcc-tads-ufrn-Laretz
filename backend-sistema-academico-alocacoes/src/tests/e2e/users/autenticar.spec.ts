import { afterAll, beforeAll, describe, expect, it, test } from "vitest";
import { app } from "@/app";
import request from "supertest";




describe ('Authenticate (e2e)', () => {
    beforeAll(async () => {
    await app.ready()
})

afterAll(async () => {
    await app.close()
})


    it("should be able to authenticate", async () => {
        await request(app.server).post("/register").send({
            nome: "John Doe",
            email: "renato@email.com",
            senha: "123456",
        });


        const response = await request(app.server).post("/session").send({
            email: "renato@email.com",
            senha: "123456",
        });
        expect(response.statusCode).toEqual(200)
        expect(response.body).toEqual(
            expect.objectContaining({
                token: expect.any(String),
            })
        )

     })
})
