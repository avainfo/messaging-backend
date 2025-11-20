import request from "supertest";
import { createApp } from "../app";
import * as serverUtils from "../firebase/server-utils";

// Mock the firebase/server-utils module
jest.mock("../firebase/server-utils");

const app = createApp();

describe("Servers Routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /servers", () => {
        it("should return 400 if userId is missing", async () => {
            const res = await request(app).get("/servers");
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: "userId is required" });
        });

        it("should return a list of servers for a valid userId", async () => {
            const mockServers = [{ id: "s1", name: "Server 1" }];
            (serverUtils.getServers as jest.Mock).mockResolvedValue(mockServers);

            const res = await request(app).get("/servers?userId=user123");

            expect(res.status).toBe(200);
            expect(res.body.servers).toEqual(mockServers);
            expect(res.body.userId).toBe("user123");
            expect(serverUtils.getServers).toHaveBeenCalledWith("user123");
        });

        it("should handle orderBy and descending parameters correctly", async () => {
            const mockServers = [{ id: "s2", name: "Server 2" }];
            (serverUtils.getServersOrderBy as jest.Mock).mockResolvedValue(mockServers);

            const res = await request(app).get(
                "/servers?userId=user123&orderBy=createdAt&descending=true"
            );

            expect(res.status).toBe(200);
            expect(res.body.servers).toEqual(mockServers);
            expect(serverUtils.getServersOrderBy).toHaveBeenCalledWith(
                "user123",
                "createdAt",
                true
            );
        });

        it("should return 500 if the service throws an error", async () => {
            (serverUtils.getServers as jest.Mock).mockRejectedValue(new Error("DB Error"));

            const res = await request(app).get("/servers?userId=user123");

            expect(res.status).toBe(500);
            expect(res.body).toEqual({
                error: true,
                message: "Internal server error",
            });
        });
    });

    describe("POST /servers", () => {
        it("should return 400 if name is missing", async () => {
            const res = await request(app).post("/servers").send({ ownerId: "user123" });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("name is required");
        });

        it("should return 400 if ownerId is missing", async () => {
            const res = await request(app).post("/servers").send({ name: "My Server" });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("ownerId is required");
        });

        it("should create a server and return 201 with valid data", async () => {
            const newServer = {
                name: "My Server",
                ownerId: "user123",
                imageUrl: "http://image.url",
                memberIds: ["user456"],
            };
            const createdServer = { ...newServer, id: "server123" };
            (serverUtils.createServer as jest.Mock).mockResolvedValue(createdServer);

            const res = await request(app).post("/servers").send(newServer);

            expect(res.status).toBe(201);
            expect(res.body).toEqual(createdServer);
            expect(serverUtils.createServer).toHaveBeenCalledWith({
                name: "My Server",
                ownerId: "user123",
                imageUrl: "http://image.url",
                memberIds: ["user123", "user456"], // ownerId is added to memberIds
            });
        });

        it("should return 500 if the service throws an error", async () => {
            (serverUtils.createServer as jest.Mock).mockRejectedValue(new Error("DB Error"));

            const res = await request(app)
                .post("/servers")
                .send({ name: "My Server", ownerId: "user123" });

            expect(res.status).toBe(500);
            expect(res.body).toEqual({
                error: true,
                message: "Internal server error",
            });
        });
    });
});
