import request from "supertest";
import { createApp } from "../app";
import * as userUtils from "../firebase/user-utils";

// Mock the firebase module
jest.mock("../firebase/user-utils");

const app = createApp();

describe("Users Routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /users", () => {
        it("should return 400 if userId is missing", async () => {
            const res = await request(app)
                .post("/users")
                .send({ username: "Alice" });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("userId is required");
        });

        it("should return 400 if username is missing", async () => {
            const res = await request(app)
                .post("/users")
                .send({ userId: "user123" });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("username is required");
        });

        it("should create a new user with valid data", async () => {
            const newUser = {
                id: "user123",
                username: "Alice",
                profilePhotoUrl: null,
                createdAt: null,
            };

            (userUtils.upsertUser as jest.Mock).mockResolvedValue(newUser);

            const res = await request(app)
                .post("/users")
                .send({
                    userId: "user123",
                    username: "Alice",
                });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(newUser);
            expect(userUtils.upsertUser).toHaveBeenCalledWith({
                userId: "user123",
                username: "Alice",
                profilePhotoUrl: null,
            });
        });

        it("should create user with profilePhotoUrl", async () => {
            const newUser = {
                id: "user123",
                username: "Alice",
                profilePhotoUrl: "https://example.com/photo.jpg",
                createdAt: null,
            };

            (userUtils.upsertUser as jest.Mock).mockResolvedValue(newUser);

            const res = await request(app)
                .post("/users")
                .send({
                    userId: "user123",
                    username: "Alice",
                    profilePhotoUrl: "https://example.com/photo.jpg",
                });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(newUser);
            expect(userUtils.upsertUser).toHaveBeenCalledWith({
                userId: "user123",
                username: "Alice",
                profilePhotoUrl: "https://example.com/photo.jpg",
            });
        });

        it("should return 500 if the service throws an error", async () => {
            (userUtils.upsertUser as jest.Mock)
                .mockRejectedValue(new Error("DB Error"));

            const res = await request(app)
                .post("/users")
                .send({
                    userId: "user123",
                    username: "Alice",
                });

            expect(res.status).toBe(500);
            expect(res.body).toEqual({
                error: true,
                message: "Internal server error",
            });
        });
    });

    describe("GET /users/:userId", () => {
        it("should return user for valid userId", async () => {
            const mockUser = {
                id: "user123",
                username: "Alice",
                profilePhotoUrl: "https://example.com/photo.jpg",
                createdAt: null,
            };

            (userUtils.getUser as jest.Mock).mockResolvedValue(mockUser);

            const res = await request(app).get("/users/user123");

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockUser);
            expect(userUtils.getUser).toHaveBeenCalledWith("user123");
        });

        it("should return 404 if user not found", async () => {
            (userUtils.getUser as jest.Mock)
                .mockRejectedValue(new Error("User not found"));

            const res = await request(app).get("/users/user999");

            expect(res.status).toBe(404);
            expect(res.body.message).toBe("User not found");
        });

        it("should return 500 if the service throws an error", async () => {
            (userUtils.getUser as jest.Mock)
                .mockRejectedValue(new Error("DB Error"));

            const res = await request(app).get("/users/user123");

            expect(res.status).toBe(500);
            expect(res.body).toEqual({
                error: true,
                message: "Internal server error",
            });
        });
    });
});
