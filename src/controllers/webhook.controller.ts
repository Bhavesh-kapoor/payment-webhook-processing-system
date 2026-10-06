
import type { Request, Response } from "express";
import crypto from "crypto";

import db from "../config/database.ts";

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




        let hashValue = crypto.createHmac('sha256', 'ONE').update("needtodecodefirst").digest('hex')
        return res.status(200).json({ message: timeDifference })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            "message": "something went wrong",
            "status": false,
            "error": err
        })
    }


}


export const createSignature = async (req: Request, res: Request) => {
    try {

        
    } catch (err) {
        return res.status(500).json({
            "message": "something went wrong",
            "status": false,
            "error": err
        })
    }
}