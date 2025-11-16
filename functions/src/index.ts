import * as functions from "firebase-functions";
import {createApp} from "./app";
import "./firebase/firebase";

const app = createApp();

export const api = functions.https.onRequest(app);
