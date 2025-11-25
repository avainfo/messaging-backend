import request from "supertest";
import { createApp } from "../app";
import * as channelUtils from "../firebase/channel-utils";
import * as serverUtils from "../firebase/server-utils";

// Mock the firebase modules
jest.mock("../firebase/channel-utils");
jest.mock("../firebase/server-utils");

const app = createApp();

describe("Channels Routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /servers/:serverId/channels", () => {
        it("should return a list of channels for a valid serverId", async () => {
            const mockChannels = [{ id: "c1", name: "General", serverId: "s1" }];
            (channelUtils.getChannels as jest.Mock).mockResolvedValue(mockChannels);

            const res = await request(app).get("/servers/s1/channels");

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockChannels);
            expect(channelUtils.getChannels).toHaveBeenCalledWith("s1");
        });

        it("should return 500 if the service throws an error", async () => {
            (channelUtils.getChannels as jest.Mock)
                .mockRejectedValue(new Error("DB Error"));

            const res = await request(app).get("/servers/s1/channels");

            expect(res.status).toBe(500);
            expect(res.body).toEqual({
                error: true,
                message: "Internal server error",
            });
        });
    });

    describe("POST /servers/:serverId/channels", () => {
        it("should return 400 if name is missing", async () => {
            const res = await request(app).post("/servers/s1/channels").send({ userId: "user1" });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("name is required");
        });

        it("should return 400 if userId is missing", async () => {
            const res = await request(app).post("/servers/s1/channels").send({ name: "General" });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("userId is required");
        });

        it("should create a channel and return 201 with valid data", async () => {
            const newChannel = {
                id: "c1",
                name: "General",
                serverId: "s1",
                type: "text",
                createdAt: null,
            };
            (channelUtils.createChannel as jest.Mock).mockResolvedValue(newChannel);
            (serverUtils.addServerLog as jest.Mock).mockResolvedValue(undefined);

            const res = await request(app)
                .post("/servers/s1/channels")
                .send({ name: "General", userId: "user1" });

            expect(res.status).toBe(201);
            expect(res.body).toEqual(newChannel);
            expect(channelUtils.createChannel).toHaveBeenCalledWith("s1", "General");
        });

        it("should return 500 if the service throws an error", async () => {
            (channelUtils.createChannel as jest.Mock)
                .mockRejectedValue(new Error("DB Error"));

            const res = await request(app)
                .post("/servers/s1/channels")
                .send({ name: "General", userId: "user1" });

            expect(res.status).toBe(500);
            expect(res.body).toEqual({
                error: true,
                message: "Internal server error",
            });
        });
    });
});
