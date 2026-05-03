import { afterAll, beforeAll, describe, expect, it, test } from "vitest";
import { app } from "@/app";
import request from "supertest";
import { createAndAuthenticateUser } from "@/tests/e2e/helpers/create-and-authenticate-user";




describe ('Profile (e2e)', () => {
    beforeAll(async () => {
    await app.ready()
})

afterAll(async () => {
    await app.close()
})

    it("should be able to get user profile", async () => {
        const {token, email} = await createAndAuthenticateUser(app)

        const profileResponse = await request(app.server)
        .get("/me")
        .set("Authorization", `Bearer ${token}`)
        .send();

        expect(profileResponse.statusCode).toEqual(200)
        expect(profileResponse.body.user).toEqual(
            expect.objectContaining({
                email: email,
            })
        )

     })
})
