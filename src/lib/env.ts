import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1).optional(),
  MONGODB_DB: z.string().default("taskvibe"),
  BSC_RPC_URL: z.string().url().optional(),
  USDT_BEP20_CONTRACT: z.string().optional(),
  DEPOSIT_WALLET_ADDRESS: z.string().optional(),
});

export const env = envSchema.parse({
  MONGODB_URI: process.env.MONGODB_URI || undefined,
  MONGODB_DB: process.env.MONGODB_DB,
  BSC_RPC_URL: process.env.BSC_RPC_URL || undefined,
  USDT_BEP20_CONTRACT: process.env.USDT_BEP20_CONTRACT || undefined,
  DEPOSIT_WALLET_ADDRESS: process.env.DEPOSIT_WALLET_ADDRESS || undefined,
});
