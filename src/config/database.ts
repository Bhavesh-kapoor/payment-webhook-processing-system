import { Pool } from "pg";
import APP_CONFIG from './app-config.ts'
const db = new Pool({
    connectionString: APP_CONFIG.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})
db.on("error", (error) => {
    console.error("Unexpected PostgreSQL error:", error);
});
export default db;