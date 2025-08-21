import { z } from 'zod'
import type { JobChallenge, ChallengeResponse, ValidationResult } from '../types/challenge'
import { sendSlackNotification } from '../utils/notifications'

const currentYear = new Date().getFullYear()

const InternJuniorSchema = z.object({
  fullName: z.string().min(3, 'Full name must have at least 3 characters'),
  email: z.email('Invalid email format'),
  linkedinProfile: z.url('Invalid LinkedIn URL').refine(
    (url) => url.includes('linkedin.com'),
    'Must be a LinkedIn URL'
  ),
  graduationYear: z.number()
    .int('Graduation year must be an integer')
    .min(currentYear, `Graduation year must be ${currentYear} or later`)
    .max(currentYear + 1, `Graduation year must be at most ${currentYear + 1}`),
  acceptsHybrid: z.boolean(),
  secret: z.string()
})

export class InternJuniorChallenge implements JobChallenge {
  slug = 'intern-junior'
  level = 'Intern/Junior Developer'
  
  getChallenge(): ChallengeResponse {
    return {
      title: 'Intern/Junior Developer Challenge - Enerlab',
      description: 'Apply for our Intern/Junior Developer position. This is a HYBRID role requiring at least 2 days on-site in Barra Funda, São Paulo.',
      jobPost: 'https://www.linkedin.com/hiring/jobs/4270192595/detail/',
      instructions: [
        'To apply, make a POST request to this same endpoint',
        'The request body should be a JSON with the following fields:',
        '1. fullName: Your complete name',
        '2. email: Your email address',
        '3. linkedinProfile: Your LinkedIn profile URL',
        '4. graduationYear: Your expected graduation year (must be current year or next year)',
        '5. acceptsHybrid: Boolean indicating if you accept the hybrid work condition (min 3 days on-site in Barra Funda)',
        '6. secret: Generate a secret by concatenating:',
        '   - The word "ENERLAB"',
        '   - followed by underscore "_"',
        '   - followed by the current year',
        '   - followed by underscore "_"',
        '   - followed by your email (before the @) in UPPERCASE',
        '',
        'Example: If your email is john.doe@email.com, the secret would be: ENERLAB_2025_JOHN.DOE'
      ],
      hints: [
        'Make sure your LinkedIn URL is complete (https://www.linkedin.com/in/...)',
        'The secret should follow the exact format: ENERLAB_YEAR_EMAILPREFIX',
        'Email prefix means everything before the @ symbol',
        'Convert the email prefix to UPPERCASE',
        'This position requires on-site presence in Barra Funda at least 2 days per week'
      ],
      exampleInput: {
        fullName: "João Silva",
        email: "joao.silva@email.com",
        linkedinProfile: "https://www.linkedin.com/in/joaosilva",
        graduationYear: 2025,
        acceptsHybrid: true,
        secret: "ENERLAB_2025_JOAO.SILVA"
      }
    }
  }
  
  validateSolution(data: unknown): ValidationResult {
    try {
      const parsed = InternJuniorSchema.parse(data)
      
      const hints: string[] = []
      
      // Check if accepts hybrid condition
      if (!parsed.acceptsHybrid) {
        return {
          success: false,
          message: 'This position requires accepting the hybrid work condition (minimum 2 days on-site in Barra Funda).',
          hints: ['You must accept the hybrid work condition to proceed with the application']
        }
      }
      
      // Validate the secret
      const emailPrefix = parsed.email.split('@')[0].toUpperCase()
      const expectedSecret = `ENERLAB_${currentYear}_${emailPrefix}`
      
      if (parsed.secret !== expectedSecret) {
        // Check common mistakes
        if (parsed.secret.includes(emailPrefix.toLowerCase())) {
          hints.push('The email prefix in the secret should be in UPPERCASE')
        }
        if (!parsed.secret.startsWith('ENERLAB')) {
          hints.push('The secret should start with "ENERLAB"')
        }
        if (!parsed.secret.includes(currentYear.toString())) {
          hints.push(`The secret should include the current year (${currentYear})`)
        }
        
        return {
          success: false,
          message: 'The secret is incorrect. Please follow the instructions carefully.',
          hints: [
            `Expected format: ENERLAB_${currentYear}_[EMAIL_PREFIX_IN_UPPERCASE]`,
            ...hints
          ]
        }
      }
      
      // All validations passed - Send notifications
      const applicationData = {
        fullName: parsed.fullName,
        email: parsed.email,
        linkedinProfile: parsed.linkedinProfile,
        graduationYear: parsed.graduationYear,
        position: this.level
      }
      
      // Fire and forget Slack notification (don't await to keep response fast)
      sendSlackNotification(applicationData)
      
      return {
        success: true,
        message: `Application received successfully! Welcome ${parsed.fullName}. Your application for the Intern/Junior Developer position has been submitted. We will contact you at ${parsed.email} for the next steps.`,
      }
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map(issue => {
          return `${issue.path.join('.')}: ${issue.message}`
        })
        
        return {
          success: false,
          message: 'Invalid submission. Please check the errors below:',
          hints: errorMessages
        }
      }
      
      return {
        success: false,
        message: 'An unexpected error occurred. Please check your submission format.',
        hints: ['Ensure your submission is valid JSON with all required fields']
      }
    }
  }
  
  getSchema(): z.ZodSchema {
    return InternJuniorSchema
  }
}