import { APIRequestContext } from '@playwright/test'

export class ApiClient {
    private request: APIRequestContext

    constructor(request: APIRequestContext) {
        this.request = request
    }

    static async getInstance(request: APIRequestContext): Promise<ApiClient> {
        return new ApiClient(request)
    }

    async createUsers(count: number): Promise<void> {
        for (let i = 0; i < count; i++) {
            const response = await this.request.post('http://localhost:3000/users', {
                data: {
                    name: `User${i}`,
                    email: `user${i}@example.com`,
                    phone: `12345678${i}`,
                },
            })
            if (response.status() !== 201) {
                throw new Error(`Failed to create user ${i}`)
            }
        }
    }

    async deleteAllUsers(): Promise<void> {
        const response = await this.request.get('http://localhost:3000/users')
        const users = await response.json()
        for (const user of users) {
            const deleteResponse = await this.request.delete(`http://localhost:3000/users/${user.id}`)
            if (deleteResponse.status() !== 200) {
                throw new Error(`Failed to delete user with id ${user.id}`)
            }
        }
    }

    async deleteUserById(userId: number): Promise<void> {
        const response = await this.request.delete(`http://localhost:3000/users/${userId}`)
        if (response.status() !== 200) {
            throw new Error(`Failed to delete user with id ${userId}`)
        }
    }

    async getUserById(userId: number): Promise<any | null> {
        const response = await this.request.get(`http://localhost:3000/users/${userId}`)
        if (response.status() === 404) {
            return null // User not found
        } else if (response.status() !== 200) {
            throw new Error(`Failed to get user with id ${userId}`)
        }
        return await response.json()
    }

    async getAllUsers(): Promise<any[]> {
        const response = await this.request.get('http://localhost:3000/users')
        if (response.status() !== 200) {
            throw new Error('Failed to fetch users')
        }
        return await response.json()
    }
}
