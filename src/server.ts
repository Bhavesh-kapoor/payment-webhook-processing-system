import app from "./app.ts";
import APP_CONFIG from "./config/app-config.ts";


app.listen(APP_CONFIG.PORT,()=>{
    console.log(`server is running at http://localhost:${APP_CONFIG.PORT}`)
})