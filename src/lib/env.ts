import { z } from "zod";
const envSchema=z.object({
 MONGODB_URI:z.string().min(1).optional(),MONGODB_DB:z.string().default("taskvibe"),
 BSC_RPC_URL:z.string().url().optional(),USDT_BEP20_CONTRACT:z.string().optional(),DEPOSIT_WALLET_ADDRESS:z.string().optional(),
 SMTP_HOST:z.string().optional(),SMTP_PORT:z.string().optional(),SMTP_SECURE:z.string().optional(),SMTP_USER:z.string().optional(),SMTP_PASS:z.string().optional(),SMTP_FROM:z.string().optional(),
});
export const env=envSchema.parse({
 MONGODB_URI:process.env.MONGODB_URI||undefined,MONGODB_DB:process.env.MONGODB_DB,
 BSC_RPC_URL:process.env.BSC_RPC_URL||undefined,USDT_BEP20_CONTRACT:process.env.USDT_BEP20_CONTRACT||undefined,DEPOSIT_WALLET_ADDRESS:process.env.DEPOSIT_WALLET_ADDRESS||undefined,
 SMTP_HOST:process.env.SMTP_HOST||undefined,SMTP_PORT:process.env.SMTP_PORT||undefined,SMTP_SECURE:process.env.SMTP_SECURE||undefined,SMTP_USER:process.env.SMTP_USER||undefined,SMTP_PASS:process.env.SMTP_PASS||undefined,SMTP_FROM:process.env.SMTP_FROM||undefined,
});
