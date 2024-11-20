import { APIRequestContext } from '@playwright/test';

export class ApiClient {
    private request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    static async getInstance(request: APIRequestContext): Promise<ApiClient> {
        return new ApiClient(request);
    }

    async createUsers(users: number): Promise<number> {
        for (let i = 0; i < users; i++) {
            const response = await this.request.post('http://localhost:3000/users', {
                data: {
                    name: `User${i}`,
                    email: `user${i}@example.com`,
                    phone: `12345678${i}`,
                },
            });
            if (response.status() !== 201) {
                throw new Error(`Failed to create user ${i}`);
            }
        }
        return users;
    }
}
