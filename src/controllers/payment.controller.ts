
import type { Request, Response } from "express";
import crypto from 'crypto'
import db from "../config/database.ts";
import APP_CONFIG from "../config/app-config.ts";
export const createPayment = async (req: Request, res: Response) => {
    try {
        // get req body 
        const { order_id, currency = 'INR', amount } = req.body
        if (!order_id && !amount) {
            return res.status(400).json({
                "message": "order id or amount is missing",
                "status": false
            })
        }
        // create provider payment id 
        const providerPaymentId = 'pay_' + Date.now();
        const query = `
        INSERT INTO payments (order_id,provider_payment_id,currency,amount,status)
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT (provider_payment_id)
        DO NOTHING
        RETURNING *
        `;
        const payment = await db.query(query, [order_id, providerPaymentId, currency, amount, 'pending'])
        if (payment.rowCount == 0) {
            return res.status(409).json({
                "message": "payment already exist",

            })
        }
        // create signature for development testing purpose:
        // a sample webhook body for this payment, signed the same way webhook.controller.ts verifies it
        let webhookBody = JSON.stringify({
            payment_id: payment.rows[0].id,
            event_id: 'evt_' + Date.now(),
            event_type: 'payment.success',
            provider: 'test_provider'
        })
        let currentTimestamp = Date.now()
        let signaturePayload = crypto.createHmac('sha256', APP_CONFIG.WEBHOOK_SECRET).update(`${currentTimestamp}.${webhookBody}`).digest('hex')
        console.log("x-webhook-timestamp:", currentTimestamp)
        console.log("x-webhook-header:", signaturePayload)
        console.log("webhook body (send exactly this):", webhookBody)
        return res.status(201).json({
            "status": true,
            "data": payment.rows[0],
            "message": "Payment created"
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            "message": "something went wrong",
            "status": false,
            "error": err
        })
    }


}