export default defineEventHandler((event) => {
  const to = event?.node?.req?.url

  const match = to?.match(/^\/one-click-unsubscribe\/.*/)

  // If no match, return
  if (!match) return

  // One click unsubscribe should only be called with a POST, because we add the List-Unsubscribe-Post header.  But not
  // all mail clients support that, and therefore it might be called with a GET.  In that case we don't want to action it,
  // to avoid virus-scanners triggering it (which is why List-Unsubscribe-Post was invented).  So we redirect to the
  // usual unsubscribe page, which will require further action.
  if (event.node.req.method !== 'POST') {
    return sendRedirect(event, '/unsubscribe', 302)
  }
})
