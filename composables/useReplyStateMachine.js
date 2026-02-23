/**
 * Reply Flow State Machine
 *
 * This composable implements an explicit state machine for the reply flow,
 * replacing the previous watch-based approach that had race conditions.
 *
 * STATE DIAGRAM
 * =============
 *
 *                       ┌─────────────────────────────────────────┐
 *                       │              HAPPY PATHS                │
 *                       └─────────────────────────────────────────┘
 *
 *   ┌──────┐  type   ┌───────────┐  click   ┌────────────┐
 *   │ IDLE │ ──────► │ COMPOSING │ ───────► │ VALIDATING │
 *   └──────┘         └───────────┘   Send   └─────┬──────┘
 *                          ▲                      │
 *                          │ invalid              │ valid
 *                          └──────────────────────┤
 *                                                 │
 *                    ┌────────────────────────────┴───────────────────────┐
 *                    │                                                    │
 *                    ▼ (not logged in)                                    │
 *            ┌────────────────┐                                           │
 *            │ AUTHENTICATING │                                           │
 *            └───────┬────────┘                                           │
 *                    │                                                    │
 *       ┌────────────┼────────────┐                                       │
 *       │            │            │                                       │
 *       ▼ (new)      ▼ (login)    ▼ (social)                              │
 *   Register     Login Modal   OAuth Redirect                             │
 *       │            │            │                                       │
 *       │            │     [state persisted]                              │
 *       │            │            │                                       │
 *       └────────────┴────────────┘                                       │
 *                    │                                                    │
 *                    │ (logged in)                                        │ (logged in)
 *                    │                                                    │
 *                    └──────────────────────┬─────────────────────────────┘
 *                                           │
 *                                           ▼
 *                                   ┌───────────────┐
 *                                   │ JOINING_GROUP │
 *                                   └───────┬───────┘
 *                                           │
 *                                           ▼
 *                                   ┌───────────────┐
 *                                   │ CREATING_CHAT │
 *                                   └───────┬───────┘
 *                                           │
 *                          ┌────────────────┴────────────────┐
 *                          │                                 │
 *                          ▼ (new user)                      ▼ (existing user)
 *                   ┌─────────────────┐               ┌───────────┐
 *                   │ SHOWING_WELCOME │               │ COMPLETED │ ──► emit('sent')
 *                   └────────┬────────┘               └───────────┘
 *                            │ close welcome               ▲
 *                            └─────────────────────────────┘
 *
 *   Note: Reply can happen from Message page (not modal) or Browse/Explore
 *   page (modal). The state machine handles both - emit('sent') triggers
 *   navigation to /chats or modal close as appropriate.
 *
 *                       ┌─────────────────────────────────────────┐
 *                       │            ERROR HANDLING               │
 *                       └─────────────────────────────────────────┘
 *
 *   Any State ──► ERROR ──► (user clicks retry) ──► COMPOSING
 *
 *   Any Processing State ──► (30s timeout) ──► COMPOSING (fallback)
 *
 *   Any State ──► (auth error from server) ──► AUTHENTICATING (force re-login)
 *
 *                       ┌─────────────────────────────────────────┐
 *                       │              EDGE CASES                 │
 *                       └─────────────────────────────────────────┘
 *
 *   Page Refresh / Back Button:
 *     - State persisted to localStorage via reply store
 *     - On remount: restore reply text, resume to COMPOSING
 *     - User clicks Send again to continue
 *
 *   Social Sign-In (OAuth):
 *     - State persisted before redirect
 *     - After callback: check if logged in, restore to COMPOSING
 *     - User clicks Send again to continue
 *
 *   Navigate to Different Message:
 *     - Saved reply for message A stays in store
 *     - Message B starts fresh (IDLE, empty form)
 *     - Return to message A: reply restored
 *
 *   Stale Reply (>24 hours):
 *     - Discarded on init, start fresh
 *
 * STATES
 * ======
 *   IDLE           - Form shown, user hasn't started
 *   COMPOSING      - User is typing reply
 *   VALIDATING     - Form validation in progress
 *   AUTHENTICATING - Waiting for login/registration
 *   JOINING_GROUP  - Joining the message's group
 *   CREATING_CHAT  - Creating chat room
 *   SENDING        - Sending message (unused currently, reserved)
 *   SHOWING_WELCOME - New user welcome modal visible
 *   COMPLETED      - Reply sent successfully
 *   ERROR          - Something went wrong
 */

import { ref, computed, getCurrentInstance, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useMessageStore } from '~/stores/message'
import { useReplyStore } from '~/stores/reply'
import { useMe } from '~/composables/useMe'
import { useReplyToPost } from '~/composables/useReplyToPost'
import { action } from '~/composables/useClientLog'

// State enum
export const ReplyState = {
  IDLE: 'IDLE',
  COMPOSING: 'COMPOSING',
  VALIDATING: 'VALIDATING',
  AUTHENTICATING: 'AUTHENTICATING',
  JOINING_GROUP: 'JOINING_GROUP',
  CREATING_CHAT: 'CREATING_CHAT',
  SENDING: 'SENDING',
  SHOWING_WELCOME: 'SHOWING_WELCOME',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
}

// States where the user has started but not completed
const RESUMABLE_STATES = [
  ReplyState.COMPOSING,
  ReplyState.VALIDATING,
  ReplyState.AUTHENTICATING,
  ReplyState.JOINING_GROUP,
  ReplyState.CREATING_CHAT,
  ReplyState.SENDING,
]

// States that require user to be logged in
const REQUIRES_AUTH_STATES = [
  ReplyState.JOINING_GROUP,
  ReplyState.CREATING_CHAT,
  ReplyState.SENDING,
]

// Event enum for clearer logging
export const ReplyEvent = {
  START_TYPING: 'START_TYPING',
  SUBMIT: 'SUBMIT',
  VALIDATION_PASSED: 'VALIDATION_PASSED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  REGISTRATION_SUCCESS: 'REGISTRATION_SUCCESS',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_REQUIRED: 'LOGIN_REQUIRED',
  LOGIN_CANCELLED: 'LOGIN_CANCELLED',
  GROUP_JOINED: 'GROUP_JOINED',
  ALREADY_MEMBER: 'ALREADY_MEMBER',
  CHAT_CREATED: 'CHAT_CREATED',
  MESSAGE_SENT: 'MESSAGE_SENT',
  WELCOME_CLOSED: 'WELCOME_CLOSED',
  ERROR_OCCURRED: 'ERROR_OCCURRED',
  AUTH_ERROR: 'AUTH_ERROR',
  RETRY: 'RETRY',
  CANCEL: 'CANCEL',
  RESTORED: 'RESTORED',
  STALE_DISCARDED: 'STALE_DISCARDED',
  FALLBACK: 'FALLBACK',
  TIMEOUT: 'TIMEOUT',
}

// 24 hours in milliseconds - replies older than this are considered stale
const STALE_REPLY_THRESHOLD = 24 * 60 * 60 * 1000

// Processing timeout - if stuck for 30 seconds, fallback
const PROCESSING_TIMEOUT = 30 * 1000

function log(message, data = null) {
  const prefix = '[ReplyStateMachine]'
  if (data !== null) {
    console.log(`${prefix} ${message}`, data)
  } else {
    console.log(`${prefix} ${message}`)
  }
}

function logTransition(
  fromState,
  event,
  toState,
  context = {},
  messageId = null
) {
  log(`${fromState} + ${event} → ${toState}`)
  if (Object.keys(context).length > 0) {
    log('  Context:', context)
  }

  // Log to Loki for analytics.
  action('reply_state_transition', {
    from_state: fromState,
    to_state: toState,
    event,
    message_id: messageId,
    ...context,
  })
}

function logError(message, err, state, messageId = null) {
  console.error(`[ReplyStateMachine] ERROR: ${message}`)
  console.error(`[ReplyStateMachine]   Error:`, err?.message || err)
  console.error(`[ReplyStateMachine]   State before error: ${state}`)

  // Log errors to Loki for analytics and debugging.
  action('reply_error', {
    error_message: message,
    error_detail: err?.message || String(err),
    state_before_error: state,
    message_id: messageId,
  })
}

export function useReplyStateMachine(messageId) {
  const instance = getCurrentInstance()
  const authStore = useAuthStore()
  const messageStore = useMessageStore()
  const replyStore = useReplyStore()
  const { me, myid, myGroups, fetchMe } = useMe()
  const { forceLogin, loggedInEver } = storeToRefs(authStore)

  // Core state
  const state = ref(ReplyState.IDLE)
  const error = ref(null)
  const previousState = ref(null)
  const initialized = ref(false)
  let processingTimer = null

  // Reply source for analytics (set by component).
  const replySource = ref(null)

  // Form data
  const replyText = ref('')
  const collectText = ref('')
  const email = ref('')
  const emailValid = ref(false)

  // Registration data
  const isNewUser = ref(false)
  const newUserPassword = ref(null)

  // References (set from component)
  const formRef = ref(null)
  const chatButtonRef = ref(null)
  const emailValidatorRef = ref(null)

  // Computed helpers
  const canSend = computed(() => {
    return (
      state.value === ReplyState.IDLE ||
      state.value === ReplyState.COMPOSING ||
      state.value === ReplyState.ERROR
    )
  })

  const isProcessing = computed(() => {
    return [
      ReplyState.VALIDATING,
      ReplyState.AUTHENTICATING,
      ReplyState.JOINING_GROUP,
      ReplyState.CREATING_CHAT,
      ReplyState.SENDING,
    ].includes(state.value)
  })

  const showWelcomeModal = computed(() => {
    return state.value === ReplyState.SHOWING_WELCOME
  })

  const isComplete = computed(() => {
    return state.value === ReplyState.COMPLETED
  })

  // Check if a saved reply is stale (older than 24 hours)
  function isReplyStale() {
    if (!replyStore.replyingAt) return true
    const age = Date.now() - replyStore.replyingAt
    return age > STALE_REPLY_THRESHOLD
  }

  // Persist current state to the store
  function persistState() {
    replyStore.machineState = state.value
    replyStore.isNewUser = isNewUser.value
    log('State persisted:', { state: state.value, isNewUser: isNewUser.value })
  }

  // Clear persisted state
  function clearPersistedState() {
    replyStore.clearReply()
    log('Persisted state cleared')
  }

  // Start processing timeout - if stuck too long, fallback to COMPOSING
  function startProcessingTimeout() {
    clearProcessingTimeout()
    processingTimer = setTimeout(() => {
      log('Processing timeout reached, falling back to COMPOSING')
      fallbackToComposing('timeout')
    }, PROCESSING_TIMEOUT)
  }

  // Clear processing timeout
  function clearProcessingTimeout() {
    if (processingTimer) {
      clearTimeout(processingTimer)
      processingTimer = null
    }
  }

  // Fallback to COMPOSING state - used when something unexpected happens
  // This ensures the user is never left stuck - they can always retry
  function fallbackToComposing(reason) {
    log('Falling back to COMPOSING', { reason, currentState: state.value })
    clearProcessingTimeout()

    // Preserve the reply text so user doesn't lose their work
    transitionTo(ReplyState.COMPOSING, {
      event: ReplyEvent.FALLBACK,
      reason,
    })
  }

  // Handle authentication errors from the server
  function handleAuthError() {
    log('Auth error from server - user session may have expired')

    // Force re-login
    forceLogin.value = true

    // Go back to authenticating state
    transitionTo(ReplyState.AUTHENTICATING, {
      event: ReplyEvent.AUTH_ERROR,
      reason: 'server_session_expired',
    })
  }

  // Check if an error is an authentication error
  function isAuthError(error) {
    if (!error) return false

    // Check for common auth error patterns
    const errorMessage = error.message || error.toString() || ''
    const errorStatus = error.status || error.response?.status

    return (
      errorStatus === 401 ||
      errorStatus === 403 ||
      errorMessage.includes('not logged in') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('session expired') ||
      errorMessage.includes('login required')
    )
  }

  // Restore reply text from the store
  function restoreReplyFromStore() {
    const savedMessage = replyStore.replyMessage
    if (savedMessage) {
      const collectSeparator = '\r\n\r\nPossible collection times: '
      if (savedMessage.includes(collectSeparator)) {
        const parts = savedMessage.split(collectSeparator)
        replyText.value = parts[0]
        collectText.value = parts[1] || ''
      } else {
        replyText.value = savedMessage
      }
      log('Reply text restored from store', {
        replyLength: replyText.value.length,
        collectLength: collectText.value.length,
      })
    }
  }

  // Initialize state machine - check for pending replies to resume
  function initialize() {
    if (initialized.value) {
      log('Already initialized, skipping')
      return
    }

    log('Initializing state machine', {
      messageId,
      savedMsgId: replyStore.replyMsgId,
      savedState: replyStore.machineState,
      savedAt: replyStore.replyingAt,
      isLoggedIn: !!me.value,
    })

    // Check if there's a saved reply for THIS message
    if (replyStore.replyMsgId === messageId && replyStore.replyMessage) {
      // Check if it's stale
      if (isReplyStale()) {
        log('Found saved reply but it is stale, discarding', {
          age: Date.now() - replyStore.replyingAt,
          threshold: STALE_REPLY_THRESHOLD,
        })
        clearPersistedState()
        state.value = ReplyState.IDLE
        initialized.value = true
        return
      }

      const savedState = replyStore.machineState
      log('Found saved reply for this message', {
        savedState,
        isLoggedIn: !!me.value,
      })

      // Always restore the reply text first
      restoreReplyFromStore()
      isNewUser.value = replyStore.isNewUser || false

      // Determine what state to resume to based on saved state and current login status
      if (savedState === ReplyState.SHOWING_WELCOME) {
        // They were viewing the welcome modal - show it again
        log('Restoring to SHOWING_WELCOME')
        isNewUser.value = true
        transitionTo(ReplyState.SHOWING_WELCOME, {
          event: ReplyEvent.RESTORED,
          reason: 'welcome_modal_pending',
        })
      } else if (savedState === ReplyState.COMPLETED) {
        // Already completed - shouldn't happen but clear state
        log('Saved state was COMPLETED, clearing')
        clearPersistedState()
        state.value = ReplyState.IDLE
      } else if (savedState === ReplyState.ERROR) {
        // Was in error state - restore to COMPOSING so they can retry
        log('Was in ERROR state, restoring to COMPOSING')
        transitionTo(ReplyState.COMPOSING, {
          event: ReplyEvent.RESTORED,
          reason: 'was_error',
        })
      } else if (RESUMABLE_STATES.includes(savedState)) {
        // Check if the saved state requires auth
        if (REQUIRES_AUTH_STATES.includes(savedState)) {
          if (me.value) {
            // User is logged in and was in a state that requires auth
            // This means they were mid-process - restore to COMPOSING so they can re-submit
            log('User logged in, was mid-process - restoring to COMPOSING')
            transitionTo(ReplyState.COMPOSING, {
              event: ReplyEvent.RESTORED,
              reason: 'mid_process_resume',
            })
          } else {
            // User not logged in but was in a state requiring auth
            // This shouldn't happen normally - fallback to COMPOSING
            log(
              'Not logged in but saved state requires auth - fallback to COMPOSING'
            )
            transitionTo(ReplyState.COMPOSING, {
              event: ReplyEvent.FALLBACK,
              reason: 'auth_state_mismatch',
            })
          }
        } else if (savedState === ReplyState.AUTHENTICATING) {
          // Was waiting for login/registration
          if (me.value) {
            // User is now logged in (e.g., social sign-in completed)
            log(
              'User now logged in after AUTHENTICATING - restoring to COMPOSING'
            )
            transitionTo(ReplyState.COMPOSING, {
              event: ReplyEvent.RESTORED,
              reason: 'auth_completed',
            })
          } else {
            // Still not logged in - stay in composing
            log('Still not logged in, restoring to COMPOSING')
            transitionTo(ReplyState.COMPOSING, {
              event: ReplyEvent.RESTORED,
              reason: 'awaiting_login',
            })
          }
        } else {
          // COMPOSING or VALIDATING - just restore to COMPOSING
          log('Restoring to COMPOSING from:', savedState)
          transitionTo(ReplyState.COMPOSING, {
            event: ReplyEvent.RESTORED,
            reason: 'normal_resume',
          })
        }
      } else {
        // Unknown saved state - fallback to COMPOSING
        log('Unknown saved state, falling back to COMPOSING:', savedState)
        transitionTo(ReplyState.COMPOSING, {
          event: ReplyEvent.FALLBACK,
          reason: 'unknown_state',
        })
      }
    } else if (replyStore.replyMsgId && replyStore.replyMsgId !== messageId) {
      // There's a saved reply for a DIFFERENT message - don't interfere
      log('Found saved reply for different message, starting fresh', {
        savedMsgId: replyStore.replyMsgId,
        currentMsgId: messageId,
      })
      state.value = ReplyState.IDLE
    } else {
      // No saved reply - start fresh
      log('No saved reply, starting fresh')
      state.value = ReplyState.IDLE
    }

    initialized.value = true
  }

  // Set refs from component
  function setRefs(refs) {
    if (refs.form) formRef.value = refs.form
    if (refs.chatButton) chatButtonRef.value = refs.chatButton
    if (refs.emailValidator) emailValidatorRef.value = refs.emailValidator
    log('Refs set:', {
      form: !!formRef.value,
      chatButton: !!chatButtonRef.value,
    })

    // Initialize after refs are set (only on first call)
    if (!initialized.value) {
      initialize()
    }
  }

  // Transition to a new state
  function transitionTo(newState, context = {}) {
    previousState.value = state.value
    state.value = newState
    logTransition(
      previousState.value,
      context.event || 'DIRECT',
      newState,
      context,
      messageId
    )

    // Manage processing timeout
    if (isProcessing.value) {
      startProcessingTimeout()
    } else {
      clearProcessingTimeout()
    }

    // Persist state to store (except for transient states)
    if (newState !== ReplyState.VALIDATING) {
      persistState()
    }

    // Clear persisted state when completed
    if (newState === ReplyState.COMPLETED) {
      clearPersistedState()
    }
  }

  // Main entry point: user clicks Send
  async function submit(callback) {
    log('submit() called', {
      state: state.value,
      hasReply: !!replyText.value,
      hasEmail: !!email.value,
      isLoggedIn: !!me.value,
    })

    // Log the submit attempt to Loki.
    action('reply_submit', {
      message_id: messageId,
      is_logged_in: !!me.value,
      has_email: !!email.value,
      reply_length: replyText.value?.length || 0,
      reply_source: replySource.value,
    })

    if (!canSend.value) {
      log('Cannot send in current state:', state.value)
      action('reply_submit_blocked', {
        message_id: messageId,
        current_state: state.value,
        reason: 'canSend_false',
      })
      callback?.()
      return
    }

    transitionTo(ReplyState.VALIDATING, { event: ReplyEvent.SUBMIT })

    // Validate form
    if (!formRef.value) {
      logError('Form ref not set', null, state.value, messageId)
      // Don't go to ERROR - just go back to COMPOSING so user can retry
      fallbackToComposing('form_ref_missing')
      callback?.()
      return
    }

    let validation
    try {
      validation = await formRef.value.validate()
    } catch (e) {
      log('Form validation threw error:', e)
      fallbackToComposing('validation_error')
      callback?.()
      return
    }

    log('Validation result:', validation)

    if (!validation.valid) {
      transitionTo(ReplyState.COMPOSING, {
        event: ReplyEvent.VALIDATION_FAILED,
      })
      callback?.()
      return
    }

    // Save reply to store early so it survives page refresh/social sign-in
    saveReplyToStore()

    // Check if logged in
    if (!me.value) {
      log('Not logged in, need to authenticate')
      // Check email validation for non-logged-in users
      if (!emailValid.value) {
        log('Email not valid, focusing email field')
        emailValidatorRef.value?.focus?.()
        transitionTo(ReplyState.COMPOSING, {
          event: ReplyEvent.VALIDATION_FAILED,
        })
        callback?.()
        return
      }

      transitionTo(ReplyState.AUTHENTICATING, {
        event: ReplyEvent.LOGIN_REQUIRED,
      })
      await handleAuthentication(callback)
    } else {
      log('Already logged in, proceeding to join group check')
      transitionTo(ReplyState.JOINING_GROUP, {
        event: ReplyEvent.VALIDATION_PASSED,
      })
      await handleJoinGroup(callback)
    }
  }

  // Handle registration or login
  async function handleAuthentication(callback) {
    log('handleAuthentication() starting', { email: email.value })

    try {
      // Attempt to register the user
      const ret = await instance.proxy.$api.user.add(email.value, false)
      log('Registration API response:', ret)

      if (ret.ret === 0 && ret.password) {
        // New user registered successfully
        log('New user registered')
        isNewUser.value = true
        newUserPassword.value = ret.password
        loggedInEver.value = true

        // Set auth tokens BEFORE fetchMe, otherwise fetchMe will use stale credentials.
        // The registration response contains JWT and persistent tokens for the new user.
        if (ret.jwt && ret.persistent) {
          log('Setting auth from registration response', {
            userid: ret.persistent?.userid,
          })
          authStore.setAuth(ret.jwt, ret.persistent)
        }

        // Persist the new user flag
        persistState()

        // Transition BEFORE fetchMe to prevent race condition:
        // fetchMe triggers the `me` watcher which calls onLoginSuccess(),
        // which also transitions to JOINING_GROUP and calls handleJoinGroup().
        // By transitioning first, onLoginSuccess()'s guard
        // (state === AUTHENTICATING) fails, preventing double execution.
        transitionTo(ReplyState.JOINING_GROUP, {
          event: ReplyEvent.REGISTRATION_SUCCESS,
          isNewUser: true,
        })

        await fetchMe(true)
        log('Fetched new user data', { myid: myid.value })

        await handleJoinGroup(callback)
      } else {
        // User exists, need to log in
        log('User exists, forcing login')
        forceLogin.value = true

        // The login modal will handle the rest
        // State is persisted - if social sign-in happens, we'll resume on return
        callback?.()
      }
    } catch (e) {
      log('Registration failed:', e.message)

      if (isAuthError(e)) {
        handleAuthError()
        callback?.()
        return
      }

      // Assume existing user and force login
      forceLogin.value = true
      callback?.()
    }
  }

  // Called when login completes (from watch or explicit call)
  async function onLoginSuccess() {
    log('onLoginSuccess() called', {
      state: state.value,
      hasReply: !!replyText.value,
    })

    // Handle login success from AUTHENTICATING state (normal flow)
    if (state.value === ReplyState.AUTHENTICATING && replyText.value) {
      log('Resuming after login from AUTHENTICATING')
      transitionTo(ReplyState.JOINING_GROUP, {
        event: ReplyEvent.LOGIN_SUCCESS,
      })
      await handleJoinGroup()
      return
    }

    // Handle login success from COMPOSING state (user logged in via navbar)
    // In this case, we don't auto-proceed - let them click Send again
    if (state.value === ReplyState.COMPOSING && replyText.value) {
      log('User logged in while composing - they can now click Send')
      // No state change needed - they're already in COMPOSING
      // But we do update the persisted state in case of refresh
      persistState()
      return
    }

    log('Login occurred but not in a resumable state or no reply')
  }

  // Check group membership and join if needed
  async function handleJoinGroup(callback) {
    log('handleJoinGroup() starting', { messageId, myid: myid.value })

    // Double-check we're still logged in
    if (!myid.value) {
      log('No user ID available - auth may have expired')
      handleAuthError()
      callback?.()
      return
    }

    try {
      // Fetch message to get group info
      const msg = await messageStore.fetch(messageId, true)
      log('Message fetched:', { id: msg?.id, groups: msg?.groups?.length })

      if (!msg?.groups || msg.groups.length === 0) {
        logError('No groups on message', null, state.value, messageId)
        transitionTo(ReplyState.ERROR, { event: ReplyEvent.ERROR_OCCURRED })
        error.value = 'Message has no groups'
        callback?.()
        return
      }

      // Check if already a member
      let isMember = false
      let groupToJoin = null

      for (const messageGroup of msg.groups) {
        groupToJoin = messageGroup.groupid
        for (const key of Object.keys(myGroups.value || {})) {
          const group = myGroups.value[key]
          if (messageGroup.groupid === group.id) {
            isMember = true
            break
          }
        }
        if (isMember) break
      }

      log('Group membership check:', { isMember, groupToJoin })

      if (!isMember && groupToJoin) {
        log('Joining group:', groupToJoin)
        await authStore.joinGroup(myid.value, groupToJoin, false)
        log('Group joined successfully')
      }

      transitionTo(ReplyState.CREATING_CHAT, {
        event: isMember ? ReplyEvent.ALREADY_MEMBER : ReplyEvent.GROUP_JOINED,
      })

      await handleCreateChat(callback)
    } catch (e) {
      logError('Failed to join group', e, state.value, messageId)

      if (isAuthError(e)) {
        handleAuthError()
        callback?.()
        return
      }

      transitionTo(ReplyState.ERROR, { event: ReplyEvent.ERROR_OCCURRED })
      error.value = 'Failed to join group: ' + e.message
      callback?.()
    }
  }

  // Create the chat
  async function handleCreateChat(callback) {
    log('handleCreateChat() starting', { chatButtonRef: !!chatButtonRef.value })

    await nextTick()

    if (!chatButtonRef.value) {
      logError('Chat button ref not available', null, state.value, messageId)
      // Don't go to ERROR - fallback to COMPOSING so user can retry
      fallbackToComposing('chat_button_missing')
      callback?.()
      return
    }

    try {
      const { replyToPost: composableReplyToPost } = useReplyToPost()
      log('Calling replyToPost composable')

      const replySent = await composableReplyToPost(chatButtonRef.value)
      log('replyToPost result:', replySent)

      if (replySent) {
        // Check if new user - show welcome modal first
        if (isNewUser.value) {
          log('New user - showing welcome modal')
          action('reply_sent', {
            message_id: messageId,
            user_type: 'new',
            is_new_user: true,
            reply_source: replySource.value,
          })
          transitionTo(ReplyState.SHOWING_WELCOME, {
            event: ReplyEvent.CHAT_CREATED,
          })
          callback?.()
        } else {
          log('Existing user - reply complete')
          action('reply_sent', {
            message_id: messageId,
            user_type: 'existing',
            is_new_user: false,
            reply_source: replySource.value,
          })
          transitionTo(ReplyState.COMPLETED, { event: ReplyEvent.MESSAGE_SENT })
          callback?.()
        }
      } else {
        log('replyToPost returned falsy - may be stale reply')
        transitionTo(ReplyState.ERROR, { event: ReplyEvent.ERROR_OCCURRED })
        error.value =
          'Reply could not be sent (may be stale). Please try again.'
        callback?.()
      }
    } catch (e) {
      logError('Failed to create chat', e, state.value, messageId)

      if (isAuthError(e)) {
        handleAuthError()
        callback?.()
        return
      }

      transitionTo(ReplyState.ERROR, { event: ReplyEvent.ERROR_OCCURRED })
      error.value = 'Failed to send reply: ' + e.message
      callback?.()
    }
  }

  // User closes welcome modal
  function closeWelcomeModal() {
    log('closeWelcomeModal() called', { state: state.value })

    if (state.value === ReplyState.SHOWING_WELCOME) {
      transitionTo(ReplyState.COMPLETED, { event: ReplyEvent.WELCOME_CLOSED })
    }
  }

  // Save reply to store for persistence
  function saveReplyToStore() {
    replyStore.replyMsgId = messageId
    replyStore.replyMessage = replyText.value

    if (collectText.value) {
      replyStore.replyMessage +=
        '\r\n\r\nPossible collection times: ' + collectText.value
    }

    replyStore.replyingAt = Date.now()
    persistState()

    log('Reply saved to store:', {
      msgId: replyStore.replyMsgId,
      messageLength: replyStore.replyMessage?.length,
      at: replyStore.replyingAt,
    })
  }

  // Reset the state machine
  function reset() {
    log('reset() called')
    clearProcessingTimeout()
    state.value = ReplyState.IDLE
    error.value = null
    previousState.value = null
    isNewUser.value = false
    newUserPassword.value = null
    clearPersistedState()
  }

  // Retry after error
  function retry() {
    log('retry() called from state:', state.value)
    error.value = null
    transitionTo(ReplyState.COMPOSING, { event: ReplyEvent.RETRY })
  }

  // User starts typing
  function startTyping() {
    if (state.value === ReplyState.IDLE) {
      transitionTo(ReplyState.COMPOSING, { event: ReplyEvent.START_TYPING })
    }
  }

  // Set the reply source for analytics (called by component).
  function setReplySource(source) {
    replySource.value = source
    log('Reply source set:', source)
  }

  // Get debug info for logging
  function getDebugInfo() {
    return {
      state: state.value,
      previousState: previousState.value,
      error: error.value,
      isNewUser: isNewUser.value,
      hasReply: !!replyText.value,
      hasCollect: !!collectText.value,
      hasEmail: !!email.value,
      emailValid: emailValid.value,
      isLoggedIn: !!me.value,
      myid: myid.value,
      initialized: initialized.value,
      savedMsgId: replyStore.replyMsgId,
      savedState: replyStore.machineState,
    }
  }

  return {
    // State
    state,
    error,
    previousState,

    // Form data
    replyText,
    collectText,
    email,
    emailValid,

    // Registration data
    isNewUser,
    newUserPassword,

    // Computed
    canSend,
    isProcessing,
    showWelcomeModal,
    isComplete,

    // Methods
    setRefs,
    submit,
    onLoginSuccess,
    closeWelcomeModal,
    reset,
    retry,
    startTyping,
    setReplySource,
    getDebugInfo,
    initialize,
    fallbackToComposing,
  }
}
