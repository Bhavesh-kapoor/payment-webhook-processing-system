import express from "express";
let app = express()
import db from "./config/database.ts";
import paymentroute  from "./routes/payment.route.ts";
import webHookRoute from "./routes/webhook.route.ts";
// keep the raw body so webhook signatures can be verified against the exact bytes received
app.use(express.json({
    verify: (req, _res, buf) => {
        (req as typeof req & { rawBody?: Buffer }).rawBody = buf
    }
}))

// payment routes 
app.use('/payment',paymentroute);
app.use('/webhook',webHookRoute)
// connection check 
app.get('/health',async(req,res)=>{
    try{
        let result = await db.query("SELECT NOW()")
        return res.status(200).json({
            status:true,
            database: "connected",
            time: result.rows[0].now,
        })
    }catch(err){
        console.log(err)
        return res.status(500).json({
            status:false,
            message:"database connection failed"
        })
    }

})

export default app