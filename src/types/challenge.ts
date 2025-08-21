import { z } from 'zod'

export interface ChallengeResponse {
  title: string
  description: string
  jobPost: string
  instructions: string[]
  hints?: string[]
  exampleInput?: any
  exampleOutput?: any
}

export interface ValidationResult {
  success: boolean
  message: string
  hints?: string[]
}

export interface JobChallenge {
  slug: string
  level: string
  getChallenge(): ChallengeResponse
  validateSolution(data: unknown): Promise<ValidationResult>
  getSchema(): z.ZodSchema
}