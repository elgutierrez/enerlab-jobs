import type { JobChallenge } from '../types/challenge.js'
import { InternJuniorChallenge } from './intern-junior.js'

const jobChallenges = new Map<string, JobChallenge>()

jobChallenges.set('intern-junior', new InternJuniorChallenge())

export function getJobChallenge(slug: string): JobChallenge | undefined {
  return jobChallenges.get(slug)
}

export function getAllJobs(): Array<{ slug: string; level: string }> {
  return Array.from(jobChallenges.values()).map(job => ({
    slug: job.slug,
    level: job.level
  }))
}