import { Router } from "express";
import { serversRouter } from "./serversRouter";
import { channelsRouter } from "./channelsRouter";
import { messagesRouter } from "./messagesRouter";

// eslint-disable-next-line new-cap
export const router = Router();

// /servers...
router.use("/servers", serversRouter);

// /servers/:serverId/channels...
router.use("/servers/:serverId/channels", channelsRouter);

// /channels/:channelId/messages...
router.use("/channels/:channelId/messages", messagesRouter);
