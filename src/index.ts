import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { getJobChallenge, getAllJobs } from './jobs/registry.js'

const app = new Hono()

app.use('*', cors())
app.use('*', logger())

app.get('/', (c) => {
  return c.json({
    message: 'Welcome to Enerlab Jobs API',
    availableJobs: getAllJobs(),
    usage: 'GET /{slug}/apply to get challenge instructions, POST /{slug}/apply to submit your solution'
  })
})

app.get('/:slug/apply', (c) => {
  const slug = c.req.param('slug')
  const challenge = getJobChallenge(slug)
  
  if (!challenge) {
    return c.json(
      {
        error: 'Job position not found',
        availableJobs: getAllJobs()
      },
      404
    )
  }
  
  return c.json(challenge.getChallenge())
})

app.post('/:slug/apply', async (c) => {
  const slug = c.req.param('slug')
  const challenge = getJobChallenge(slug)
  
  if (!challenge) {
    return c.json(
      {
        error: 'Job position not found',
        availableJobs: getAllJobs()
      },
      404
    )
  }
  
  try {
    const body = await c.req.json()
    const result = await challenge.validateSolution(body)
    
    const statusCode = result.success ? 200 : 400
    
    return c.json(result, statusCode)
  } catch (error) {
    return c.json(
      {
        success: false,
        message: 'Invalid request format',
        hints: ['Please submit valid JSON in the request body']
      },
      400
    )
  }
})

app.notFound((c) => {
  return c.json(
    {
      error: 'Not found',
      availableEndpoints: [
        'GET /',
        'GET /{slug}/apply',
        'POST /{slug}/apply'
      ],
      availableJobs: getAllJobs()
    },
    404
  )
})

export default app