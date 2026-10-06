import env from 'dotenv'
env.config()
const APP_CONFIG = {
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    PORT: process.env.PORT || 8010,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
}
export default APP_CONFIG