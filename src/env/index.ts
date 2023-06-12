import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV) {
  config({ path: '.env.test' })
} else {
  config()
}

const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
  NODE_ENV: z
    .enum(['developmente', 'test', 'production'])
    .default('production'),
})
const _env = envSchema.safeParse(process.env)
if (_env.success === false) {
  console.error('invalide envaloment variable', _env.error.format())
  throw new Error('invalide environment variables')
}
export const env = _env.data
