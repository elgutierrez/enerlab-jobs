import { WebClient } from '@slack/web-api'
import { env } from './env.js'

interface ApplicationData {
  fullName: string
  email: string
  linkedinProfile: string
  graduationYear: number
  position: string
}

export async function sendSlackNotification(data: ApplicationData) {
  const token = env.SLACK_BOT_TOKEN
  const channel = env.SLACK_CHANNEL_ID
  
  try {
    const slack = new WebClient(token)
    
   const response = await slack.chat.postMessage({
      channel: channel,
      text: `New application for ${data.position}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '🎯 New Job Application' }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Position:* ${data.position}` },
            { type: 'mrkdwn', text: `*Name:* ${data.fullName}` },
            { type: 'mrkdwn', text: `*Email:* ${data.email}` },
            { type: 'mrkdwn', text: `*LinkedIn:* <${data.linkedinProfile}|Profile>` },
            { type: 'mrkdwn', text: `*Graduation:* ${data.graduationYear}` },
            { type: 'mrkdwn', text: `*Time:* ${new Date().toLocaleString('pt-BR')}` }
          ]
        }
      ]
    })
    console.log(response)
  } catch (error) {
    console.error('Slack notification failed:', error)
  }
}