
import type { Request,Response } from "express";

import db from "../config/database.ts";
export const createPayment = async(req:Request,res:Response)=>{
    try{
        // get req body 
        const {order_id,currency='INR',amount} = req.body
        if(!order_id && !amount){
            return res.status(400).json( {"message":"order id or amount is missing",
            "status":false})
        }
        // create provider payment id 
        const providerPaymentId = 'pay_'+Date.now();
        const query = `
        INSERT INTO payments (order_id,provider_payment_id,currency,amount,status)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *
        `;
        const payment =  await db.query(query,[order_id,providerPaymentId,currency,amount,'received'])
        return res.status(201).json({
            "status":true,
            "data":payment.rows[0],
            "message":"Paymeent created"
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            "message":"something went wrong",
            "status":false,
            "error":err
        })
    }


}