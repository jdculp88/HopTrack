import webpush from 'web-push'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:josh@hoptrack.beer'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

export interface PushPayload {
  title: string
  body: string
  tag?: string
  data?: Record<string, any>
  actions?: Array<{ action: string; title: string }>
}

export interface PushSubscriptionRecord {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export async function sendPushNotification(
  subscription: PushSubscriptionRecord,
  payload: PushPayload
): Promise<boolean> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('[push] VAPID keys not configured, skipping push')
    return false
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload),
      { TTL: 60 * 60 } // 1 hour TTL
    )
    return true
  } catch (err: any) {
    // 410 Gone or 404 means subscription expired — caller should clean up
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.warn('[push] Subscription expired:', subscription.endpoint.slice(0, 50))
      return false
    }
    console.error('[push] Failed to send:', err.message)
    return false
  }
}

/**
 * Send push to all subscriptions for a given user.
 * Cleans up expired subscriptions automatically.
 */
export async function sendPushToUser(
  supabase: any,
  userId: string,
  payload: PushPayload
): Promise<number> {
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return 0

  let sent = 0
  const expiredIds: string[] = []

  for (const sub of subs) {
    const success = await sendPushNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload
    )
    if (success) {
      sent++
    } else {
      expiredIds.push(sub.id)
    }
  }

  // Clean up expired subscriptions
  if (expiredIds.length > 0) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('id', expiredIds)
  }

  return sent
}
