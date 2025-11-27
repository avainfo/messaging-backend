import { Router } from "express";
import { serversRouter } from "./serversRouter";
import { channelsRouter } from "./channelsRouter";
import { messagesRouter } from "./messagesRouter";
import { reactionsRouter } from "./reactionsRouter";
import { usersRouter } from "./usersRouter";

export const router = Router();

// /users...
router.use("/users", usersRouter);

// /servers...
router.use("/servers", serversRouter);

// /servers/:serverId/channels...
router.use("/servers/:serverId/channels", channelsRouter);

// /channels/:channelId/messages...
router.use("/channels/:channelId/messages", messagesRouter);

// /messages/:messageId/reactions...
router.use("/messages/:messageId/reactions", reactionsRouter);
