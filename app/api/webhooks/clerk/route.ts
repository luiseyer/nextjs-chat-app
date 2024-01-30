import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'

import { db } from '@/lib/db'

export async function POTS(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env file'
    )
  }

  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_signature = headerPayload.get('svix-signature')
  const svix_timestamp = headerPayload.get('svix-timestamp')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)

  let event: WebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id': svix_id,
      'svix-signature': svix_signature,
      'svix-timestamp': svix_timestamp,
    }) as WebhookEvent
  } catch (error) {
    console.error('Error verifying webhook', error)
    return new Response('Error verifying webhook', { status: 400 })
  }

  const eventType = event.type

  if (eventType === 'user.created') {
    await db.user.create({
      data: {
        externalUserId: payload.data.id,
        email: payload.data.email_addresses[0].email_address,
        username: payload.data.username,
      },
    })
  }

  if (eventType === 'user.updated') {
    await db.user.update({
      where: {
        externalUserId: payload.data.id,
      },
      data: {
        email: payload.data.email_addresses[0].email_address,
        username: payload.data.username,
      },
    })
  }

  if (eventType === 'user.deleted') {
    await db.user.delete({
      where: {
        externalUserId: payload.data.id,
      },
    })
  }

  return new Response('', { status: 200 })
}
