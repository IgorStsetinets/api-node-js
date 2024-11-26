import {test, expect, APIRequestContext} from '@playwright/test'
import {ApiClient} from '../src/api-client'

test.describe('API Client Cycles Tests', () => {
    let apiClient: ApiClient

    test.beforeEach(async ({request}) => {
        apiClient = await ApiClient.getInstance(request)
        await apiClient.deleteAllUsers()
    })

    test('should create and fetch multiple users', async ({}) => {
        const numberOfUsers = 5
        await apiClient.createUsers(numberOfUsers)
        const users = await apiClient.getAllUsers()
        expect(users.length).toBe(numberOfUsers)
    })

    test('should delete all users', async ({}) => {
        const numberOfUsers = 5
        await apiClient.createUsers(numberOfUsers)
        await apiClient.deleteAllUsers()
        const users = await apiClient.getAllUsers()
        expect(users).toEqual([])
    })

    test('should delete one user without affecting others', async ({}) => {
        const numberOfUsers = 5
        await apiClient.createUsers(numberOfUsers)
        const users = await apiClient.getAllUsers()
        const userIds = users.map((user) => user.id)
        await apiClient.deleteUserById(userIds[0])
        const remainingUsers = await apiClient.getAllUsers()
        expect(remainingUsers.length).toBe(numberOfUsers - 1)
        const remainingUserIds = remainingUsers.map((user) => user.id)
        expect(remainingUserIds).not.toContain(userIds[0])
    })

    test('should return null for a non-existing user', async ({}) => {
        const nonExistingUserId = 999
        const user = await apiClient.getUserById(nonExistingUserId)
        expect(user).toBeNull()
    })

    test('should create a single user and fetch by ID', async ({}) => {

        await apiClient.createUsers(1)
        const users = await apiClient.getAllUsers()
        expect(users.length).toBe(1)
        const createdUserId = users[0].id
        const user = await apiClient.getUserById(createdUserId)
        expect(user).not.toBeNull()
        expect(user.id).toBe(createdUserId)
    })
})
