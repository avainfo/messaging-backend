import request from "supertest";
import { createApp } from "../app";
import * as messageUtils from "../firebase/message-utils";

// Mock the firebase/message-utils module
jest.mock("../firebase/message-utils");

const app = createApp();

describe("Messages Routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /channels/:channelId/messages", () => {
        it("should return a list of messages for a valid channelId", async () => {
            const mockMessages = [{ id: "m1", content: "Hello", channelId: "c1" }];
            (messageUtils.getMessages as jest.Mock).mockResolvedValue(mockMessages);

            const res = await request(app).get("/channels/c1/messages");

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockMessages);
            expect(messageUtils.getMessages).toHaveBeenCalledWith("c1");
        });

        it("should return 500 if the service throws an error", async () => {
            (messageUtils.getMessages as jest.Mock)
                .mockRejectedValue(new Error("DB Error"));

            const res = await request(app).get("/channels/c1/messages");

            expect(res.status).toBe(500);
            expect(res.body).toEqual({
                error: true,
                message: "Internal server error",
            });
        });
    });

    describe("POST /channels/:channelId/messages", () => {
        it("should return 400 if content is missing", async () => {
            const res = await request(app)
                .post("/channels/c1/messages")
                .send({ authorId: "u1", authorName: "User" });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("content is required");
        });

        it("should create a message and return 201 with valid data", async () => {
            const newMessage = {
                id: "m1",
                content: "Hello",
                channelId: "c1",
                authorId: "u1",
                authorName: "User",
                authorAvatarUrl: null,
                createdAt: null,
            };
            (messageUtils.createMessage as jest.Mock).mockResolvedValue(newMessage);

            const res = await request(app).post("/channels/c1/messages").send({
                authorId: "u1",
                authorName: "User",
                content: "Hello",
            });

            expect(res.status).toBe(201);
            expect(res.body).toEqual(newMessage);
            expect(messageUtils.createMessage).toHaveBeenCalledWith("c1", {
                authorId: "u1",
                authorName: "User",
                authorAvatarUrl: null,
                content: "Hello",
            });
        });

        it("should return 500 if the service throws an error", async () => {
            (messageUtils.createMessage as jest.Mock)
                .mockRejectedValue(new Error("DB Error"));

            const res = await request(app).post("/channels/c1/messages").send({
                authorId: "u1",
                authorName: "User",
                content: "Hello",
            });

            expect(res.status).toBe(500);
            expect(res.body).toEqual({
                error: true,
                message: "Internal server error",
            });
        });
    });
});
