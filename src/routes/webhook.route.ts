import express from "express";
let webHookRoute = express.Router()
import { webhandlePaymentWebhook } from "../controllers/webhook.controller.ts";

webHookRoute.post('/',webhandlePaymentWebhook)


export default webHookRoute