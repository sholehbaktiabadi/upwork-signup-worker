import { configDotenv } from "dotenv";

configDotenv()

export const env = {
    mailSlurpApiKey: process.env.MAIL_SLURP_API_KEY
}