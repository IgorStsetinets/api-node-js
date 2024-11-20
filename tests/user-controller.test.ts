import { test, expect } from '@playwright/test';
import { StatusCodes } from 'http-status-codes';
import { ApiClient } from '../src/api-client';

const baseURL = 'http://localhost:3000/users';
let userID: number;


test.beforeEach(async ({ request }) => {
    const response = await request.get(baseURL);
    const users = await response.json();
    for (const user of users) {
        await request.delete(`${baseURL}/${user.id}`);
    }
    const finalResponse = await request.get(baseURL);
    expect(await finalResponse.json()).toEqual([]);
});

test.describe('User management API', () => {
    test('GET /:id - should return 404 if user not found', async ({ request }) => {
        const response = await request.get(`${baseURL}/99999`);
        expect(response.status()).toBe(StatusCodes.NOT_FOUND);
    });

    test('POST create n users', async ({ request }) => {
        const apiClient = await ApiClient.getInstance(request);
        await apiClient.createUsers(5);

        const response = await request.get(baseURL);
        const users = await response.json();
        expect(users.length).toBe(5);
    });

    test('DELETE n users', async ({ request }) => {
        const apiClient = await ApiClient.getInstance(request);
        await apiClient.createUsers(5);

        const response = await request.get(baseURL);
        const users = await response.json();
        const userIDs = users.map((user: { id: number }) => user.id);

        for (const id of userIDs) {
            const deleteResponse = await request.delete(`${baseURL}/${id}`);
            expect(deleteResponse.status()).toBe(StatusCodes.OK);
        }

        const finalResponse = await request.get(baseURL);
        expect(await finalResponse.json()).toEqual([]);
    });

    test('POST / - should add a new user', async ({ request }) => {
        const response = await request.post(baseURL, {
            data: { name: 'New User', email: 'newuser@example.com', phone: '987-654-3210' },
        });
        const body = await response.json();
        expect(response.status()).toBe(StatusCodes.CREATED);
        expect(body.id).toBeDefined();
        userID = body.id;
    });

    test('DELETE /:id - should delete a user by ID', async ({ request }) => {
        const createResponse = await request.post(baseURL, {
            data: { name: 'Test User', email: 'test@example.com', phone: '123-456-7890' },
        });
        const createBody = await createResponse.json();
        userID = createBody.id;

        const deleteResponse = await request.delete(`${baseURL}/${userID}`);
        expect(deleteResponse.status()).toBe(StatusCodes.OK);

        const responseBody = await deleteResponse.json();
        if (responseBody.message) {
            expect(responseBody.message).toBe('User deleted successfully');
        }
    });

    test('DELETE /:id - should return 404 if user not found', async ({ request }) => {
        const response = await request.delete(`${baseURL}/99999`);
        expect(response.status()).toBe(StatusCodes.NOT_FOUND);

        const responseBody = await response.json();
        if (responseBody.message) {
            expect(responseBody.message).toBe('User not found');
        }
    });
});
