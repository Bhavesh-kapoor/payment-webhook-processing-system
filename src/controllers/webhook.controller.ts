
import type { Request, Response } from "express";
import crypto from "crypto";
import db from "../config/database.ts";
import APP_CONFIG from "../config/app-config.ts";
export const webhandlePaymentWebhook = async (req: Request, res: Response) => {
    try {
        let timeThreahHold = 5 * 60 * 1000 // 5 min gap only 
        // get the webhook secret from the headers
        let signature = req.headers['x-webhook-header'];
        if (!signature || typeof (signature) != "string") {
            return res.status(401).json({
                message: "Missing webhook signature",
            });
        }
        let timestampHeader: string | string[] | number | undefined;
        timestampHeader = req.headers['x-webhook-timestamp'];
        if (!timestampHeader || typeof timestampHeader !== "string") {
            return res.status(401).json({
                message: "Missing webhook timestamp",
            });
        }
        // now check if the 
        timestampHeader = Number(timestampHeader);
        let currentTimestamp = Math.floor(Date.now())
        let timeDifference = Math.abs(currentTimestamp - timestampHeader)
        if (timeDifference > timeThreahHold) {
            return res.status(401).json({
                message: "Webhook request expired",
            });
        }
        // get the request body 
        const { payment_id, event_id, event_type, provider } = req.body;
        if (!payment_id || !event_id || !event_type || !provider) {
            return res.status(400).json({ "message": "Please provide all details" });
        }
        //  create payload signature 

        // sign the exact bytes the sender sent (captured in app.ts), not a re-serialized body
        const rawBody = (req as Request & { rawBody?: Buffer }).rawBody
        if (!rawBody) {
            return res.status(400).json({ "message": "Missing request body" })
        }
        let payload = `${timestampHeader}.${JSON.stringify(req.body)}`
        let expectedSignature = crypto.createHmac('sha256', APP_CONFIG.WEBHOOK_SECRET).update(payload).digest('hex')

        // verify signature (timingSafeEqual throws on length mismatch, so check length first)
        const signatureBuffer = Buffer.from(signature)
        const expectedBuffer = Buffer.from(expectedSignature)
        if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
            return res.status(401).json({ "message": "Invalid signature" })
        }
        let client = await db.connect()

        try {
            // check for the paymentid exist or not

            let paymentQuery = "SELECT * FROM payments where id =$1";
            let paymentInfo = await client.query(paymentQuery, [payment_id])
            if (paymentInfo.rowCount == 0) {
                return res.status(404).json({ "messsage": "Payment not found", 'status': false })
            }
            await client.query("BEGIN")
            let webhookQuery = "INSERT INTO webhook_events (provider,event_id,event_type,payment_id,payload) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING RETURNING id"
            let webhook = await client.query(webhookQuery, [provider, event_id, event_type, payment_id, JSON.stringify(req.body)]);
            await client.query("COMMIT")
            return res.status(200).json({ message: "Webhook received successfully!", 'data': webhook.rows[0] })
        } catch (err) {
            await client.query('ROLLBACK');
            return res.status(500).json({
                "message": "something went wrong",
                "status": false,
                "error": err
            })
        } finally {
            client.release();
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            "message": "something went wrong",
            "status": false,
            "error": err
        })
    }


}

