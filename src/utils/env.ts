import { z } from 'zod'
import { config } from 'dotenv'

// Load environment variables from .env file
config()

// Environment variable schema for validation
const envSchema = z.object({
  // Slack configuration
  SLACK_BOT_TOKEN: z.string().min(1, 'SLACK_BOT_TOKEN is required'),
  SLACK_CHANNEL_ID: z.string().optional().default('#hiring'),
  
  // API configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.number().default(3000),
  
  // Add other environment variables as needed
  // DATABASE_URL: z.string().url(),
  // API_KEY: z.string().min(1),
})

// Parse and validate environment variables
function loadEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(err => err.path.join('.'))
      throw new Error(`Missing or invalid environment variables: ${missingVars.join(', ')}`)
    }
    throw error
  }
}

// Export validated environment variables
export const env = loadEnv()

// Type for environment variables
export type Env = z.infer<typeof envSchema>
