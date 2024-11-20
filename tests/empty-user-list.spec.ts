import { test, expect } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
let baseURL = 'http://localhost:3000/users'

test.describe('User API - Empty User List', () => {
    test.beforeAll(async ({ request }) => {
        const getUsersResponse = await request.get(`${baseURL}`)
        if (getUsersResponse.status() === StatusCodes.OK) {
            const users = await getUsersResponse.json()

            for (const user of users) {
                const deleteResponse = await request.delete(`${baseURL}/${user.id}`)
                expect(deleteResponse.status()).toBe(StatusCodes.OK)
            }
        } else if (getUsersResponse.status() !== StatusCodes.NOT_FOUND) {
            throw new Error(`Unexpected response: ${getUsersResponse.status()}`)
        }
    })

    test('GET / - should return empty when no users', async ({ request }) => {
        const response = await request.get(`${baseURL}`)
        expect(response.status()).toBe(StatusCodes.OK)
        const responseBody = await response.text()
        expect(responseBody).toBe('[]')
    })
})
