import express from "express";
import { createPayment } from "../controllers/payment.controller.ts";
let route = express.Router()

route.post('/',createPayment)


export default route