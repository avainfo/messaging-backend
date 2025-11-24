import request from "supertest";
import { createApp } from "../app";
import * as reactionUtils from "../firebase/reaction-utils";

// Mock the firebase/reaction-utils module
jest.mock("../firebase/reaction-utils");

const app = createApp();

describe("Reactions Routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /messages/:messageId/reactions", () => {
        it("should return reactions summary for a valid messageId", async () => {
            const mockReactions = {
                "👍": { count: 2, users: ["user1", "user2"] },
                "❤️": { count: 1, users: ["user3"] },
            };
            (reactionUtils.getReactions as jest.Mock).mockResolvedValue(mockReactions);

            const res = await request(app).get("/messages/msg1/reactions");

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockReactions);
            expect(reactionUtils.getReactions).toHaveBeenCalledWith("msg1");
        });

        it("should return empty object if no reactions", async () => {
            (reactionUtils.getReactions as jest.Mock).mockResolvedValue({});

            const res = await request(app).get("/messages/msg1/reactions");

            expect(res.status).toBe(200);
            expect(res.body).toEqual({});
        });

        it("should return 500 if the service throws an error", async () => {
            (reactionUtils.getReactions as jest.Mock)
                .mockRejectedValue(new Error("DB Error"));

            const res = await request(app).get("/messages/msg1/reactions");

            expect(res.status).toBe(500);
            expect(res.body).toEqual({
                error: true,
                message: "Internal server error",
            });
        });
    });

    describe("POST /messages/:messageId/reactions", () => {
        it("should return 400 if userId is missing", async () => {
            const res = await request(app)
                .post("/messages/msg1/reactions")
                .send({ emoji: "👍" });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("userId is required");
        });

        it("should return 400 if emoji is missing", async () => {
            const res = await request(app)
                .post("/messages/msg1/reactions")
                .send({ userId: "user1" });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("emoji is required");
        });

        it("should add a reaction with valid data", async () => {
            (reactionUtils.addReaction as jest.Mock).mockResolvedValue(undefined);

            const res = await request(app)
                .post("/messages/msg1/reactions")
                .send({ userId: "user1", emoji: "👍" });

            expect(res.status).toBe(201);
            expect(res.body).toEqual({
                success: true,
                message: "Reaction added successfully",
            });
            expect(reactionUtils.addReaction).toHaveBeenCalledWith(
                "msg1",
                "user1",
                "👍"
            );
        });

        it("should return 500 if the service throws an error", async () => {
            (reactionUtils.addReaction as jest.Mock)
                .mockRejectedValue(new Error("DB Error"));

            const res = await request(app)
                .post("/messages/msg1/reactions")
                .send({ userId: "user1", emoji: "👍" });

            expect(res.status).toBe(500);
            expect(res.body).toEqual({
                error: true,
                message: "Internal server error",
            });
        });
    });

    describe("DELETE /messages/:messageId/reactions", () => {
        it("should return 400 if userId is missing", async () => {
            const res = await request(app)
                .delete("/messages/msg1/reactions")
                .send({ emoji: "👍" });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("userId is required");
        });

        it("should return 400 if emoji is missing", async () => {
            const res = await request(app)
                .delete("/messages/msg1/reactions")
                .send({ userId: "user1" });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("emoji is required");
        });

        it("should remove a reaction with valid data", async () => {
            (reactionUtils.removeReaction as jest.Mock).mockResolvedValue(undefined);

            const res = await request(app)
                .delete("/messages/msg1/reactions")
                .send({ userId: "user1", emoji: "👍" });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                success: true,
                message: "Reaction removed successfully",
            });
            expect(reactionUtils.removeReaction).toHaveBeenCalledWith(
                "msg1",
                "user1",
                "👍"
            );
        });

        it("should return 500 if the service throws an error", async () => {
            (reactionUtils.removeReaction as jest.Mock)
                .mockRejectedValue(new Error("DB Error"));

            const res = await request(app)
                .delete("/messages/msg1/reactions")
                .send({ userId: "user1", emoji: "👍" });

            expect(res.status).toBe(500);
            expect(res.body).toEqual({
                error: true,
                message: "Internal server error",
            });
        });
    });
});
