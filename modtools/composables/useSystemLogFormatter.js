/**
 * Composable for formatting system log entries into human-readable text.
 * Follows the patterns from ModLog.vue but adapted for Loki log structure.
 */

// Cache for swagger documentation (v2 API descriptions).
let swaggerCache = null
let swaggerFetchPromise = null

/**
 * Fetch and cache swagger documentation from v2 API.
 */
function fetchSwaggerDocs() {
  if (swaggerCache) {
    return Promise.resolve(swaggerCache)
  }

  if (swaggerFetchPromise) {
    return swaggerFetchPromise
  }

  swaggerFetchPromise = (async () => {
    try {
      // Determine API base URL from environment or use relative path.
      const runtimeConfig =
        typeof useRuntimeConfig !== 'undefined' ? useRuntimeConfig() : {}
      const apiBase = runtimeConfig?.public?.APIv2 || '/apiv2'

      // Build swagger URL by replacing only the path portion /api or /apiv2.
      // Use URL parsing to avoid matching /api in the hostname.
      let swaggerUrl
      if (apiBase.startsWith('http')) {
        const url = new URL(apiBase)
        url.pathname = '/swagger/swagger.json'
        swaggerUrl = url.toString()
      } else {
        swaggerUrl =
          apiBase.replace(/\/apiv?\d*$/, '') + '/swagger/swagger.json'
      }

      const response = await fetch(swaggerUrl)
      if (!response.ok) {
        console.warn('Failed to fetch swagger docs:', response.status)
        return null
      }

      const swagger = await response.json()
      swaggerCache = swagger
      return swagger
    } catch (e) {
      console.warn('Error fetching swagger docs:', e)
      return null
    }
  })()

  return swaggerFetchPromise
}

/**
 * Get description from swagger docs for an API endpoint.
 * Returns null if not found.
 */
function getSwaggerDescription(swagger, method, path) {
  if (!swagger || !swagger.paths) {
    return null
  }

  // Normalize path - remove /api or /apiv2 prefix and query string.
  const normalizedPath = path
    .replace(/^\/apiv2/, '')
    .replace(/^\/api/, '')
    .split('?')[0]
    .replace(/\/$/, '')

  // Convert path parameters from /user/123 to /user/{id} format for matching.
  const pathSegments = normalizedPath.split('/')
  const possiblePaths = []

  // Generate possible swagger path patterns.
  function generatePatterns(segments, index, current) {
    if (index >= segments.length) {
      possiblePaths.push(current.join('/'))
      return
    }

    const segment = segments[index]

    // If it's a number, try parameter patterns.
    if (/^\d+$/.test(segment)) {
      for (const param of ['{id}', '{ids}']) {
        generatePatterns(segments, index + 1, [...current, param])
      }
    }
    // If it looks like an email, try {email}.
    else if (segment.includes('@')) {
      generatePatterns(segments, index + 1, [...current, '{email}'])
    }
    // Otherwise use literal segment.
    generatePatterns(segments, index + 1, [...current, segment])
  }

  generatePatterns(pathSegments, 0, [])

  // Look up each possible path in swagger.
  for (const swaggerPath of possiblePaths) {
    const pathKey = swaggerPath || '/'
    const pathDef = swagger.paths[pathKey]

    if (pathDef) {
      const methodLower = method.toLowerCase()
      const methodDef = pathDef[methodLower]

      if (methodDef && methodDef.summary) {
        return methodDef.summary
      }
    }
  }

  return null
}

/**
 * Prefetch swagger documentation for API descriptions.
 * Call this when loading the system logs page.
 */
export function prefetchSwaggerDocs() {
  return fetchSwaggerDocs()
}

/**
 * Format a page/route name into a human-readable description.
 * Converts routes like "/give" to "Opened Give page".
 */
function formatPageName(pageName) {
  if (!pageName || pageName === '/') {
    return 'Opened home page'
  }

  // Ensure leading slash and clean up.
  const route = pageName.startsWith('/') ? pageName : `/${pageName}`

  // Map common routes to friendly names.
  const routeNames = {
    '/': 'home page',
    '/index': 'home page',
    '/give': 'Give page',
    '/find': 'Find page',
    '/explore': 'Explore page',
    '/browse': 'Browse page',
    '/post': 'Post page',
    '/message': 'message',
    '/myposts': 'My Posts',
    '/profile': 'Profile',
    '/settings': 'Settings',
    '/about': 'About page',
    '/help': 'Help page',
    '/donate': 'Donate page',
    '/stories': 'Stories page',
    '/communityevents': 'Community Events',
    '/volunteering': 'Volunteering',
    '/stats': 'Stats page',
  }

  // Check for exact match first.
  if (routeNames[route]) {
    return `Opened ${routeNames[route]}`
  }

  // Check for prefix matches (e.g., /message/123).
  for (const [prefix, name] of Object.entries(routeNames)) {
    if (route.startsWith(prefix + '/')) {
      const suffix = route.slice(prefix.length + 1)
      // If suffix is a number, include it.
      if (/^\d+$/.test(suffix)) {
        return `Opened ${name} #${suffix}`
      }
      return `Opened ${name}`
    }
  }

  // Fallback: format the route nicely.
  // Remove leading slash and capitalize first letter.
  const cleanRoute = route.slice(1).split('/')[0]
  const formatted = cleanRoute.charAt(0).toUpperCase() + cleanRoute.slice(1)
  return `Opened ${formatted} page`
}

const LOG_FORMATTERS = {
  // logs_table source (matches existing ModLog.vue patterns)
  logs_table: {
    User: {
      Login: (log) => `Logged in ${log.text || ''}`.trim(),
      Logout: () => 'Logged out',
      Created: () => 'User created',
      Bounce: (log) => `Email bounced: ${log.text || ''}`,
      RoleChange: (log) => `Role changed to ${log.text || ''}`,
      Merged: (log) => `Merged with another user - ${log.text || ''}`,
      Approved: () => 'Member approved',
      Rejected: () => 'Member rejected',
      Deleted: (log) =>
        log.byuser_id && log.byuser_id !== log.user_id
          ? 'Member removed'
          : `User left platform (${log.text || ''})`,
      Mailed: (log) => `Mod sent mail: ${log.text || ''}`,
      Hold: () => 'Member held',
      Release: () => 'Member released',
      Suspect: (log) => `Flagged: ${log.text || ''}`,
      Split: (log) => `Split into two users - ${log.text || ''}`,
      MailOff: () => 'Turned digests off by email',
      EventsOff: () => 'Turned events off by email',
      NewslettersOff: () => 'Turned newsletters off by email',
      RelevantOff: () => 'Turned off "interested in" mails by email',
      VolunteersOff: () => 'Turned off volunteering mails by email',
      SuspendMail: () => 'Stop mailing - bouncing',
      Unbounce: () => 'Reactivated mail',
      PostcodeChange: (log) => `Postcode set to ${log.text || ''}`,
      OurPostingStatus: (log) =>
        `Set Posting Status to ${formatPostingStatus(log.text)}`,
      OurEmailFrequency: (log) => `Set Email Frequency to ${log.text || ''}`,
    },

    Message: {
      Received: (log) => {
        const raw = log.raw || {}
        const msgType = raw.message?.type
        if (msgType === 'Offer' || msgType === 'Wanted') {
          return `Posted ${msgType}: ${raw.message?.subject || ''}`
        }
        return 'Received message'
      },
      Approved: () => 'Message approved',
      Rejected: () => 'Message rejected',
      Deleted: () => 'Message deleted',
      Hold: () => 'Message held',
      Release: () => 'Message released',
      Edit: (log) => `Edited message: ${log.text || ''}`,
      Outcome: (log) => {
        const outcome = log.text || ''
        const outcomeMap = {
          Taken: 'Marked as TAKEN (item collected)',
          Received: 'Marked as RECEIVED (item obtained)',
          Withdrawn: 'Marked as WITHDRAWN (no longer available)',
          Repost: 'Reposted',
        }
        return outcomeMap[outcome] || `Marked outcome: ${outcome}`
      },
      Autoapproved: () => 'Auto-approved',
      Autoreposted: (log) => `Autoreposted (repost ${log.text || ''})`,
      Repost: () => 'Manual repost',
      ClassifiedSpam: () => 'Sent spam',
      Replied: (log) => `Modmail sent: ${log.text || ''}`,
      WorryWords: (log) => `Flagged: ${log.text || ''}`,
    },

    Group: {
      Joined: (log) => {
        let text = 'Joined'
        if (log.text === 'Manual') {
          text += ' (clicked Join button)'
        } else if (log.text) {
          text += ' (auto-joined when posting/replying)'
        }
        return text
      },
      Applied: () => 'Applied to join',
      Left: (log) =>
        log.byuser_id && log.byuser_id !== log.user_id
          ? 'Member removed'
          : 'Left group',
      Edit: () => 'Edited group settings',
      Autoapproved: () => 'Auto-approved membership',
    },

    Config: {
      Created: (log) => `Created config ${log.text || ''}`,
      Deleted: (log) => `Deleted config ${log.text || ''}`,
      Edit: (log) => {
        const raw = log.raw || {}
        return `Edited config ${raw.config?.name || log.text || ''}`
      },
    },

    StdMsg: {
      Created: (log) => `Created standard message ${log.text || ''}`,
      Deleted: (log) => `Deleted standard message ${log.text || ''}`,
      Edit: (log) => {
        const raw = log.raw || {}
        return `Edited standard message ${raw.stdmsg?.name || log.text || ''}`
      },
    },

    Chat: {
      Approved: () => 'Approved chat message',
    },
  },

  // API source
  api: {
    default: (log, swagger) => {
      const raw = log.raw || {}
      const method = raw.method || 'GET'
      const endpoint = raw.endpoint || raw.path || '/'
      const status = raw.status_code || raw.status || 200

      // Try swagger description first (most accurate).
      let description = null
      if (swagger) {
        description = getSwaggerDescription(swagger, method, endpoint)
      }

      // Fall back to hardcoded descriptions.
      if (!description) {
        const result = getApiDescription(method, endpoint, raw)
        description = result.text
      }

      // Final fallback: generate from endpoint.
      if (!description) {
        description = generateHumanReadableEndpoint(method, endpoint)
      }

      let text = description
      if (status >= 400) {
        text += ` [${status}]`
      }
      return text
    },
  },

  // Client source
  client: {
    page_view: (log) => {
      const raw = log.raw || {}
      const pageName = raw.page_name || raw.url || 'page'
      return formatPageName(pageName)
    },
    session_start: () => 'Opened Freegle',
    session_resume: () => 'Returned to Freegle',
    page_hidden: () => 'Left tab',
    page_visible: () => 'Came back to tab',
    outcome_intended: (log) => {
      const raw = log.raw || {}
      const outcome = raw.outcome || raw.message || 'item'
      return `Intending to mark as ${outcome}`
    },
    outcome: (log) => {
      const raw = log.raw || {}
      const outcome = raw.outcome || raw.message || 'complete'
      return `Marked as ${outcome}`
    },
    action: (log, swagger, clientFormatters) => {
      const raw = log.raw || {}
      const actionName = raw.action_name || ''

      // Check if there's a specific formatter for this action name.
      // clientFormatters is passed from the lookup to avoid circular reference.
      if (actionName && clientFormatters && clientFormatters[actionName]) {
        return clientFormatters[actionName](log, swagger)
      }

      // Format known action types nicely even without a specific formatter.
      const actionLabels = {
        session_start: 'Opened Freegle',
        session_resume: 'Returned to Freegle',
        page_hidden: 'Left tab',
        page_visible: 'Came back to tab',
        page_view: 'Viewed page',
      }
      if (actionName && actionLabels[actionName]) {
        return actionLabels[actionName]
      }

      // Action name contains description of what user did.
      if (actionName) {
        // Convert snake_case to readable text.
        const readable = actionName.replace(/_/g, ' ')
        return readable.charAt(0).toUpperCase() + readable.slice(1)
      }

      // Fall back to message if action_name not present.
      const message = raw.message || log.text || ''
      // Strip "Action: " prefix if present.
      if (message.startsWith('Action: ')) {
        return message.slice(8)
      }

      // Rename specific messages for clarity.
      const messageLabels = {
        'Ad impression': 'Job Ad impression',
      }
      if (message && messageLabels[message]) {
        return messageLabels[message]
      }

      return message || 'User action'
    },
    click: (log) => {
      const raw = log.raw || {}
      const target = raw.action_name || raw.element || 'button'
      return `Clicked ${target}`
    },
    scroll: () => 'Scrolled',
    focus: () => 'Started typing',
    blur: () => 'Stopped typing',
    api_call: (log) => {
      const raw = log.raw || {}
      const method = raw.method || 'GET'
      const path = raw.path || '/'
      const duration = raw.duration_ms ? `${Math.round(raw.duration_ms)}ms` : ''
      return `API: ${method} ${path} ${duration ? `(${duration})` : ''}`.trim()
    },
    error: (log) => {
      const raw = log.raw || {}
      return `Error: ${raw.message || log.text || 'Unknown error'}`
    },
    default: (log) => {
      const raw = log.raw || {}
      // Try to provide a meaningful fallback.
      if (raw.event_type) {
        // Convert snake_case to readable text.
        const readable = raw.event_type.replace(/_/g, ' ')
        return readable.charAt(0).toUpperCase() + readable.slice(1)
      }
      return raw.message || log.text || 'Action'
    },
  },

  // Email source
  email: {
    default: (log) => {
      const raw = log.raw || {}
      return `Sent ${raw.email_type || 'email'}: ${raw.subject || ''}`
    },
  },

  // Batch source
  batch: {
    default: (log) => {
      const raw = log.raw || {}
      return raw.message || log.text || 'Batch job'
    },
  },

  // Batch event source
  batch_event: {
    default: (log) => {
      const raw = log.raw || {}
      return raw.message || log.text || 'Batch event'
    },
  },
}

/**
 * Human-readable descriptions for API endpoints.
 * Maps method + endpoint pattern to description generator.
 */
const API_DESCRIPTIONS = {
  // User endpoints
  'GET /api/user': () => 'Get currently logged in user',
  'GET /api/session': () => 'Get session info',
  'POST /api/session': () => 'Login',
  'DELETE /api/session': () => 'Logout',
  'GET /api/user/(\\d+)': (match) => `Get user #${match[1]}`,
  'PUT /api/user/(\\d+)': (match) => `Update user #${match[1]}`,
  'GET /api/memberships': () => 'Get group memberships',
  'GET /api/memberships/(\\d+)': (match) =>
    `Get memberships for user #${match[1]}`,

  // Message endpoints (posts - offers/wanteds)
  'GET /api/message': () => 'List posts',
  'GET /api/message/(\\d+)': (match) => `Get post #${match[1]}`,
  'PUT /api/message/(\\d+)': (match) => `Update post #${match[1]}`,
  'POST /api/message': () => 'Create post',
  'DELETE /api/message/(\\d+)': (match) => `Delete post #${match[1]}`,
  'POST /api/message/(\\d+)/outcome': (match) =>
    `Mark outcome for post #${match[1]}`,
  'GET /api/messages': () => 'Search posts',

  // Chat endpoints
  'GET /api/chat/rooms': () => 'List chats for logged in user',
  'GET /api/chat/rooms/(\\d+)': (match) => `Get chat room #${match[1]}`,
  'GET /api/chat/rooms/(\\d+)/messages': (match) =>
    `Get messages in chat #${match[1]}`,
  'POST /api/chat/rooms/(\\d+)/messages': (match) =>
    `Send message to chat #${match[1]}`,
  'GET /api/chatmessage/(\\d+)': (match) => `Get chat message #${match[1]}`,
  'PUT /api/chatmessage/(\\d+)': (match) => `Update chat message #${match[1]}`,

  // Group endpoints
  'GET /api/group': () => 'Get groups',
  'GET /api/group/(\\d+)': (match) => `Get group #${match[1]}`,
  'PUT /api/group/(\\d+)': (match) => `Update group #${match[1]}`,
  'GET /api/memberships/group/(\\d+)': (match) =>
    `Get members of group #${match[1]}`,

  // Newsfeed
  'GET /api/newsfeed': () => 'Get newsfeed',
  'GET /api/newsfeed/(\\d+)': (match) => `Get newsfeed item #${match[1]}`,
  'POST /api/newsfeed': () => 'Post to newsfeed',

  // Notifications
  'GET /api/notification': () => 'Get notifications',
  'GET /api/notification/count': () => 'Get notification count',
  'PUT /api/notification/(\\d+)': (match) => `Update notification #${match[1]}`,

  // Image endpoints
  'GET /api/image/(\\d+)': (match) => `Get image #${match[1]}`,
  'POST /api/image': () => 'Upload image',
  'DELETE /api/image/(\\d+)': (match) => `Delete image #${match[1]}`,

  // Location endpoints
  'GET /api/locations': () => 'Search locations',
  'GET /api/address': () => 'Get addresses',

  // Community events
  'GET /api/communityevent': () => 'Get community events',
  'GET /api/communityevent/(\\d+)': (match) => `Get event #${match[1]}`,
  'POST /api/communityevent': () => 'Create community event',

  // Volunteering
  'GET /api/volunteering': () => 'Get volunteering opportunities',
  'GET /api/volunteering/(\\d+)': (match) => `Get volunteering #${match[1]}`,

  // Stories
  'GET /api/stories': () => 'Get user stories',
  'GET /api/stories/(\\d+)': (match) => `Get story #${match[1]}`,

  // Admin/mod endpoints
  'GET /api/logs': () => 'Get activity logs',
  'GET /api/spammers': () => 'Get spammer list',
  'POST /api/spammers': () => 'Add spammer',

  // v2 API endpoints - User
  'GET /apiv2/user': () => 'Get current user',
  'GET /apiv2/user/(\\d+)': (match) => `Get user #${match[1]}`,
  'GET /apiv2/user/byemail/(.+)': () => 'Get user by email',
  'GET /apiv2/user/(\\d+)/publiclocation': (match) =>
    `Get public location for user #${match[1]}`,
  'GET /apiv2/user/(\\d+)/message': (match) =>
    `Get posts for user #${match[1]}`,
  'GET /apiv2/user/(\\d+)/search': (match) =>
    `Get searches for user #${match[1]}`,

  // v2 API endpoints - Posts (messages = posts in Freegle terminology)
  'GET /apiv2/message/count': () => 'Get post count',
  'GET /apiv2/message/inbounds': () => 'Get post bounds',
  'GET /apiv2/message/mygroups': () => 'Get posts from my groups',
  'GET /apiv2/message/mygroups/(\\d+)': (match) =>
    `Get posts from my groups #${match[1]}`,
  'GET /apiv2/message/search/(.+)': (match) => `Search posts: ${match[1]}`,
  'GET /apiv2/message/(\\d+)': (match) => `Get post #${match[1]}`,

  // v2 API endpoints - Groups
  'GET /apiv2/group': () => 'List groups',
  'GET /apiv2/group/(\\d+)': (match) => `Get group #${match[1]}`,
  'GET /apiv2/group/(\\d+)/message': (match) =>
    `Get posts for group #${match[1]}`,

  // v2 API endpoints - Chat
  'GET /apiv2/chat': () => 'List chats',
  'GET /apiv2/chat/(\\d+)': (match) => `Get chat #${match[1]}`,
  'GET /apiv2/chat/(\\d+)/message': (match) =>
    `Get messages in chat #${match[1]}`,
  'POST /apiv2/chat/(\\d+)/message': (match) =>
    `Send message to chat #${match[1]}`,
  'POST /apiv2/chat/lovejunk': () => 'Create LoveJunk chat message',

  // v2 API endpoints - Notifications
  'GET /apiv2/notification': () => 'List notifications',
  'GET /apiv2/notification/count': () => 'Get notification count',
  'POST /apiv2/notification/seen': () => 'Mark notification seen',
  'POST /apiv2/notification/allseen': () => 'Mark all notifications seen',

  // v2 API endpoints - Newsfeed
  'GET /apiv2/newsfeed': () => 'List newsfeed',
  'GET /apiv2/newsfeed/(\\d+)': (match) => `Get newsfeed item #${match[1]}`,
  'GET /apiv2/newsfeedcount': () => 'Get newsfeed count',

  // v2 API endpoints - Community events & Volunteering
  'GET /apiv2/communityevent': () => 'List community events',
  'GET /apiv2/communityevent/(\\d+)': (match) =>
    `Get community event #${match[1]}`,
  'GET /apiv2/communityevent/group/(\\d+)': (match) =>
    `List community events for group #${match[1]}`,
  'GET /apiv2/volunteering': () => 'List volunteering opportunities',
  'GET /apiv2/volunteering/(\\d+)': (match) =>
    `Get volunteering opportunity #${match[1]}`,
  'GET /apiv2/volunteering/group/(\\d+)': (match) =>
    `List volunteering for group #${match[1]}`,

  // v2 API endpoints - Stories
  'GET /apiv2/story': () => 'List stories',
  'GET /apiv2/story/(\\d+)': (match) => `Get story #${match[1]}`,
  'GET /apiv2/story/group/(\\d+)': (match) =>
    `List stories for group #${match[1]}`,

  // v2 API endpoints - Location
  'GET /apiv2/location/latlng': () => 'Get location by coordinates',
  'GET /apiv2/location/typeahead': () => 'Search locations',
  'GET /apiv2/location/(\\d+)': (match) => `Get location #${match[1]}`,
  'GET /apiv2/location/(\\d+)/addresses': (match) =>
    `Get addresses for location #${match[1]}`,

  // v2 API endpoints - Address
  'GET /apiv2/address': () => 'List addresses',
  'GET /apiv2/address/(\\d+)': (match) => `Get address #${match[1]}`,

  // v2 API endpoints - Jobs
  'GET /apiv2/job': () => 'List jobs',
  'GET /apiv2/job/(\\d+)': (match) => `Get job #${match[1]}`,
  'POST /apiv2/job': () => 'Record job click',

  // v2 API endpoints - Misc/Status
  'GET /apiv2/online': () => 'Check online status',
  'GET /apiv2/latestmessage': () => 'Get latest message',
  'GET /apiv2/activity': () => 'Get recent activity',
  'GET /apiv2/logo': () => 'Get logo',
  'GET /apiv2/donations': () => 'Get donations',
  'GET /apiv2/giftaid': () => 'Get Gift Aid status',
  'GET /apiv2/microvolunteering': () => 'Get microvolunteering challenge',
  'GET /apiv2/config/(.+)': (match) => `Get config: ${match[1]}`,

  // v2 API endpoints - Isochrone
  'GET /apiv2/isochrone': () => 'List isochrones',
  'GET /apiv2/isochrone/message': () => 'Get isochrone posts',

  // v2 API endpoints - Authority
  'GET /apiv2/authority/(\\d+)/message': (match) =>
    `Get posts for authority #${match[1]}`,

  // v2 API endpoints - Logging
  'POST /apiv2/clientlog': () => 'Submit client logs',
  'POST /apiv2/src': () => 'Record traffic source',
  'GET /apiv2/systemlogs': () => 'Get system logs',
}

/**
 * Generate human-readable text from an API endpoint when no specific description exists.
 */
function generateHumanReadableEndpoint(method, endpoint) {
  // Extract the resource type from the path
  const parts = endpoint.replace(/^\/api(v2)?\//, '').split('/')
  if (parts.length === 0) return 'API call'

  const resource = parts[0]
  const id = parts[1]
  const action = parts[2]

  // Map method to verb
  const verbs = {
    GET: id ? 'Get' : 'List',
    POST: 'Create',
    PUT: 'Update',
    DELETE: 'Delete',
    PATCH: 'Update',
  }
  const verb = verbs[method] || method

  // Humanize the resource name
  const resourceMap = {
    user: 'user',
    users: 'users',
    message: 'post',
    messages: 'posts',
    group: 'group',
    groups: 'groups',
    chat: 'chat',
    chatmessage: 'chat message',
    memberships: 'memberships',
    notification: 'notification',
    notifications: 'notifications',
    image: 'image',
    newsfeed: 'newsfeed',
    communityevent: 'community event',
    volunteering: 'volunteering',
    story: 'story',
    stories: 'stories',
    address: 'address',
    locations: 'locations',
    session: 'session',
    logs: 'logs',
    spammers: 'spammers',
    systemlogs: 'system logs',
  }

  const humanResource = resourceMap[resource] || resource

  if (action) {
    return `${verb} ${humanResource} ${action}`
  }
  if (id) {
    // Only use #id format for numeric IDs (actual entity IDs)
    // Non-numeric paths like 'count' should be treated as actions
    if (/^\d+$/.test(id)) {
      return `${verb} ${humanResource} #${id}`
    }
    return `${verb} ${humanResource} ${id}`
  }
  return `${verb} ${humanResource}`
}

/**
 * Get human-readable description for an API endpoint.
 * Returns { text: string, entities: { userid?, groupid?, msgid? } }
 */
function getApiDescription(method, endpoint, raw) {
  const key = `${method} ${endpoint}`
  const result = { text: null, entities: {} }

  // Try exact match first
  if (API_DESCRIPTIONS[key]) {
    result.text = API_DESCRIPTIONS[key](null, raw)
    return result
  }

  // Try pattern matching
  for (const [pattern, generator] of Object.entries(API_DESCRIPTIONS)) {
    const patternMethod = pattern.split(' ')[0]
    const patternPath = pattern.split(' ')[1]

    if (patternMethod !== method) continue

    // Convert pattern to regex
    const regex = new RegExp(`^${patternPath}$`)
    const match = endpoint.match(regex)
    if (match) {
      result.text = generator(match, raw)
      // Extract entity IDs from matched groups
      if (patternPath.includes('/user/')) {
        result.entities.userid = match[1]
      } else if (patternPath.includes('/group/')) {
        result.entities.groupid = match[1]
      } else if (patternPath.includes('/message/')) {
        result.entities.msgid = match[1]
      } else if (patternPath.includes('/chat/rooms/')) {
        result.entities.chatid = match[1]
      }
      return result
    }
  }

  return result
}

/**
 * Get API description with entity info for enrichment.
 */
export function getApiDescriptionWithEntities(log) {
  if (log.source !== 'api') return null
  const raw = log.raw || {}
  const method = raw.method || 'GET'
  const endpoint = raw.endpoint || raw.path || '/'
  return getApiDescription(method, endpoint, raw)
}

function formatPostingStatus(status) {
  const map = {
    UNCHANGED: 'Unchanged',
    MODERATED: 'Moderated',
    DEFAULT: 'Group Settings',
    PROHIBITED: "Can't Post",
  }
  return map[status] || status || ''
}

/**
 * Format a log entry into human-readable text (sync version - uses cached swagger).
 */
export function formatLogText(log, swagger = swaggerCache) {
  if (!log) return ''

  const source = log.source || 'unknown'
  const type = log.type || 'default'
  const subtype = log.subtype || 'default'

  const sourceFormatters = LOG_FORMATTERS[source]
  if (!sourceFormatters) {
    return log.text || formatRawMessage(log) || `${source}: ${type}/${subtype}`
  }

  // Try type.subtype first (for logs_table)
  const typeFormatters = sourceFormatters[type]
  if (typeFormatters && typeof typeFormatters === 'object') {
    const formatter = typeFormatters[subtype]
    if (formatter) {
      return formatter(log, swagger)
    }
  }

  // For client source, prefer raw.event_type which has the specific event type.
  // Note: The Go API often sets type to generic 'action', so we also check
  // raw.event_type for the specific event type.
  if (source === 'client') {
    const raw = log.raw || {}
    const eventType = raw.event_type || type || 'default'
    const formatter = sourceFormatters[eventType]
    if (formatter) {
      return formatter(log, swagger)
    }
    // If eventType looks like a route (starts with "/"), format as page view.
    // This handles cases where event_type label contains the route directly.
    if (eventType.startsWith('/')) {
      return formatPageName(eventType)
    }
  }

  // Fall back to default
  if (sourceFormatters.default) {
    return sourceFormatters.default(log, swagger)
  }

  return log.text || formatRawMessage(log) || `${type}: ${subtype}`
}

/**
 * Format a log entry into human-readable text (async version - fetches swagger if needed).
 */
export async function formatLogTextAsync(log) {
  const swagger = await fetchSwaggerDocs()
  return formatLogText(log, swagger)
}

/**
 * Extract a message from raw log data.
 */
function formatRawMessage(log) {
  const raw = log.raw || {}
  return raw.message || raw.msg || ''
}

/**
 * Get CSS class for log level.
 */
export function getLogLevelClass(log) {
  const level = log.level || 'info'
  const raw = log.raw || {}
  const statusCode = raw.status_code || raw.status || 200

  // For API logs, only show error/warning styling for actual errors:
  // - HTTP 5xx status codes = error
  // - v1 API responses where ret.status != 0 = error (with exceptions)
  // Normal 401/403 responses are NOT errors - they're expected for unauthenticated requests.
  if (log.source === 'api') {
    const retStatus = raw.response_body?.ret ?? raw.ret
    const endpoint = raw.endpoint || raw.path || raw.call || ''

    // Session/user endpoints returning ret=1 just means "not logged in" - that's normal.
    const isAuthCheckEndpoint =
      endpoint.includes('/session') || endpoint === '/api/user'
    const isNormalAuthResponse = isAuthCheckEndpoint && retStatus === 1

    if (
      statusCode >= 500 ||
      (retStatus !== undefined && retStatus !== 0 && !isNormalAuthResponse)
    ) {
      return 'text-danger'
    }
    // Don't show warning for 4xx - these are normal
    return ''
  }

  // For non-API logs, use the level field
  if (level === 'error') {
    return 'text-danger'
  }
  if (level === 'warn') {
    return 'text-warning'
  }
  if (level === 'debug') {
    return 'text-muted'
  }
  return ''
}

/**
 * Get icon for log source.
 */
export function getLogSourceIcon(source) {
  const icons = {
    api: 'server',
    logs_table: 'list',
    client: 'desktop',
    email: 'envelope',
    batch: 'clock',
    batch_event: 'bolt',
  }
  return icons[source] || 'file-alt'
}

/**
 * Get badge variant for log source.
 */
export function getLogSourceVariant(source) {
  const variants = {
    api: 'info',
    logs_table: 'secondary',
    client: 'primary',
    email: 'success',
    batch: 'dark',
    batch_event: 'warning',
  }
  return variants[source] || 'light'
}

/**
 * Format timestamp for display.
 */
export function formatLogTimestamp(timestamp, format = 'short') {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const ms = date.getMilliseconds().toString().padStart(3, '0')

  if (format === 'short') {
    const time = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    return `${time}.${ms}`
  }

  if (format === 'medium') {
    const dateTime = date.toLocaleString('en-GB', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    return `${dateTime}.${ms}`
  }

  if (format === 'full') {
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return date.toLocaleString('en-GB')
}

/**
 * Composable hook for log formatting.
 */
export function useSystemLogFormatter() {
  return {
    formatLogText,
    getLogLevelClass,
    getLogSourceIcon,
    getLogSourceVariant,
    formatLogTimestamp,
  }
}
