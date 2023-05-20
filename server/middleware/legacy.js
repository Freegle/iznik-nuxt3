export default defineEventHandler((event) => {
  if (
    event.node.req.url.indexOf('/sw.js') === 0 ||
    event.node.req.url.indexOf('/robots.txt') === 0
  ) {
    console.log('Return 404 for: ' + event.node.req.url)
    setResponseStatus(event, 404)
  } else if (event.node.req.url.includes('app_fd_version_android_required')) {
    // We no longer have the API to return this value, so do it manually.
    console.log('Ask Android app to update')
    return {
      ret: 0,
      status: 'Success',
      values: [
        {
          id: 14,
          key: 'app_fd_version_android_required',
          value: '2.0.120',
        },
      ],
    }
  } else if (event.node.req.url.includes('app_fd_version_ios_required')) {
    // We no longer have the API to return this value, so do it manually.
    console.log('Ask IOS app to update')
    return {
      ret: 0,
      status: 'Success',
      values: [
        {
          id: 14,
          key: 'app_fd_version_ios_required',
          value: '2.0.120',
        },
      ],
    }
  } else if (event.node.req.url.indexOf('/api/') === 0) {
    // This is a request to the /api endpoint which was wrongly used by older clients.  Return a maintenance response
    // code which should stop them retrying.
    console.log(
      'Bounce old API request ' +
        event.node.req.url +
        ' from ' +
        event.node.req.socket?.remoteAddress
    )
    return {
      ret: 111,
      status:
        'Please update your app from the app store, or clear your browser cache to force a refresh of the site.',
    }
  }
})
