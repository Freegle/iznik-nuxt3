import { defineStore } from 'pinia'
import { useMessageStore } from '~/stores/message'
import api from '~/api'
import { useAuthStore } from '~/stores/auth'

const defaultOffer = {
  id: 0,
  type: 'Offer',
  text: '',
  attachments: [],
}
const defaultWanted = {
  id: 1,
  type: 'Wanted',
  text: '',
  attachments: [],
}

export const useComposeStore = defineStore({
  id: 'compose',
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
  // We allow composing of multiple posts for the same location/email, so messages and attachments are indexed by
  // id.  The id is a client-only index; it becomes a real id once the items are posted.
  state: () => ({
    api: null,
    email: null,
    emailAt: null,
    postcode: null,
    group: null,
    messages: [],
    attachmentBump: 1,
    _progress: 1,
    max: 4,
    uploading: false,
    lastSubmitted: 0,
  }),
  actions: {
    init(config) {
      this.config = config
      this.$api = api(config)
    },
    calculateSteps(type) {
      let steps = 0

      for (const id in this.messages) {
        const message = this.messages[id]

        if (message.type === type && !message.submitted) {
          if (message.id < 0) {
            // 1) Create draft 2) Submit
            steps += 2
          } else {
            // 1) Edit message 2) Convert to draft 3) Submit
            steps += 3
          }
        }
      }

      // Add an extra step to be used immediately to show we've started.
      this._progress = 1
      this.max = steps + 2
    },
    async createDraft(message, email) {
      if (!this.$api) {
        throw new Error('Compose store not initialized - $api is not available')
      }
      if (!this.postcode?.id) {
        throw new Error(
          'No postcode set - please go back and enter your postcode'
        )
      }

      const attids = []

      // Extract the server attachment id from message.attachments.
      if (message.attachments) {
        for (const attachment of message.attachments) {
          attids.push(attachment.id)
        }
      }

      const data = {
        collection: 'Draft',
        locationid: this.postcode.id,
        messagetype: message.type,
        item: message.item,
        textbody: message.description,
        availablenow: message.availablenow,
        attachments: attids,
        groupid: this.group,
        email,
      }

      const { id } = await this.$api.message.put(data)
      this._progress++
      return id
    },
    async submitDraft(id, email, options = {}) {
      console.log('Submit draft', id, email, options)
      const ret = await this.$api.message.joinAndPost(id, email, {
        deadline: options.deadline,
        deliverypossible: options.deliverypossible,
        logError: (data) => {
          // ret = 8 is posting prohibited, which is due to mod choice not a server error.
          // ret = 9 is banned, ditto.
          console.log('Post failed', data, data.ret, data.ret !== 8)
          return data.ret !== 8 && data.ret !== 9
        },
      })
      console.log('Returned', ret)

      if (ret.ret === 0) {
        // Fetch the submitted message - if we're on My Posts, for example, we want to update what we see.
        const messageStore = useMessageStore()
        messageStore.fetch(id, true)
      }

      this._progress++
      return ret
    },
    markSubmitted(id, me) {
      this.setMessage(
        id,
        {
          id,
          submitted: true,
          item: null,
          description: null,
          availablenow: 1,
        },
        me
      )

      this.setAttachmentsForMessage(id, [])
    },
    async backToDraft(id) {
      console.log('Back to draft', id)
      const messageStore = useMessageStore()
      await messageStore.update({
        id,
        action: 'RejectToDraft',
      })

      this._progress++
    },
    async updateIt(
      id,
      locationid,
      messagetype,
      item,
      textbody,
      attachments,
      availablenow,
      groupid
    ) {
      const data = {
        id,
        locationid,
        messagetype,
        item,
        textbody,
        attachments,
        groupid,
        availablenow,
      }

      const messageStore = useMessageStore()
      await messageStore.patch(data)

      this._progress++
    },
    setEmail(email) {
      this.email = email
      this.emailAt = Date.now()
    },
    setPostcode(postcode) {
      // Want to make sure we don't store too much data.
      console.log('Set postcode', postcode?.name)
      if (postcode?.groupsnear) {
        const pc = { ...postcode }

        pc.groupsnear = []

        for (const group of postcode.groupsnear) {
          pc.groupsnear.push({
            id: group.id,
            nameshort: group.nameshort,
            namedisplay: group.namedisplay,
            settings: {
              closed: group.settings?.closed,
            },
          })
        }

        this.postcode = pc
      }
    },
    add() {
      const id = this.messages.length
      this.ensureMessage(id)
      return id
    },
    ensureMessage(id) {
      if (!this.messages[id]) {
        this.messages[id] = {
          id,
        }
      }
    },
    setMessage(id, message, me) {
      message.savedAt = Date.now()
      message.savedBy = me ? me.id : null

      this.messages[id] = message
      console.log('Set message', id, message.id)

      if (message && message.submitted) {
        this.lastSubmitted = Math.max(
          this.lastSubmitted ? this.lastSubmitted : 0,
          message.id
        )
      }
    },
    setType(params) {
      const id = params.id
      this.ensureMessage(id)
      this.messages[id].type = params.type
      this.messages[id].savedAt = Date.now()
    },
    setItem(params) {
      const id = params.id
      this.ensureMessage(id)
      this.messages[id].item = params.item
      this.messages[id].savedAt = Date.now()
    },
    setAvailableNow(id, availablenow) {
      this.ensureMessage(id)
      this.messages[id].availablenow = availablenow
      this.messages[id].savedAt = Date.now()
    },
    setDeliveryPossible(id, deliveryPossible) {
      this.ensureMessage(id)
      this.messages[id].deliveryPossible = deliveryPossible
      this.messages[id].savedAt = Date.now()
    },
    setDeadline(id, deadline) {
      this.ensureMessage(id)
      this.messages[id].deadline = deadline
      this.messages[id].savedAt = Date.now()
    },
    setDescription(params) {
      const id = params.id
      this.ensureMessage(id)
      this.messages[id].description = params.description
      this.messages[id].savedAt = Date.now()
    },
    addAttachment(params) {
      console.log('Add attachment', params, this.messages[params.id])
      this.ensureMessage(params.id)
      this.messages[params.id].attachments = this.messages[params.id]
        .attachments
        ? this.messages[params.id].attachments
        : []
      this.messages[params.id].attachments.push(params.attachment)
      this.attachmentBump++
    },
    setAttachmentsForMessage(id, attachments) {
      this.ensureMessage(id)
      this.messages[id].attachments = attachments
      this.attachmentBump++
    },
    removeAttachment(params) {
      console.log('Remove attachment', JSON.stringify(params))
      let newAtts = []

      this.ensureMessage(params.id)

      if (this.messages[params.id]?.attachments) {
        newAtts = this.messages[params.id].attachments.filter((obj) => {
          return parseInt(obj.id) !== parseInt(params.photoid)
        })
      }

      this.messages[params.id].attachments = newAtts
    },
    deleteMessage(id) {
      this.messages = this.messages.filter((m) => m.id !== id)
    },
    async submit(params) {
      // This is the most important bit of code in the client :-).  We have our messages in the compose store.
      //
      // For messages we've just created, the server has a two stage process - create a draft and submit it, so that's
      // what we do.
      //
      // For messages which we are reposting, we need to edit them to pick up updated, convert them back into a draft,
      // and then submit them.
      const results = []
      const messages = this.messages
      console.log('Submit', JSON.parse(JSON.stringify(messages)), params.type)

      this.calculateSteps(params.type)

      // Before we do anything, give a spurious sense of progress.
      this._progress++

      for (const id in messages) {
        console.log('ID ', id)
        const message = messages[id]

        if (message.type === params.type && !message.submitted) {
          console.log(
            'Submit message',
            id,
            message.id,
            message.repostof,
            this.email,
            message,
            this.messages[message.id].attachments
          )

          let result

          // Build options for submitDraft with deadline/delivery if set
          const submitOptions = {}
          if (message.deadline) {
            submitOptions.deadline = new Date(message.deadline).toISOString()
          }
          if (message.deliveryPossible !== undefined) {
            submitOptions.deliverypossible = message.deliveryPossible
          }

          if (!message.repostof) {
            // This is a draft we have composed on the client, which doesn't have a corresponding server message yet.
            // We need to:
            // - create a drafted
            // - submit it
            // - mark it in our store as submitted.
            console.log('Create draft')
            const id = await this.createDraft(message, this.email)
            console.log('Created draft', id)

            const { groupid, newuser, newpassword } = await this.submitDraft(
              id,
              this.email,
              submitOptions
            )

            result = { id, groupid, newuser, newpassword }
          } else {
            // This is one of our existing messages which we are reposting.  We need to convert it back to a draft,
            // edit it (to update it from our client data), and then submit.
            const id = message.repostof
            await this.backToDraft(id)

            const attids = []

            if (message.attachments) {
              for (const att in message.attachments) {
                attids.push(message.attachments[att].id)
              }
            }

            await this.updateIt(
              id,
              this.postcode.id,
              message.type,
              message.item,
              message.description,
              attids,
              'availablenow' in message ? message.availablenow : 1,
              this.group
            )

            const { groupid, newuser, newpassword } = await this.submitDraft(
              id,
              this.email,
              submitOptions
            )

            result = { id, groupid, newuser, newpassword }
          }

          console.log('Got result', result)
          results.push(result)

          const me = useAuthStore().user
          this.markSubmitted(message.id, me)
        }
      }

      console.log('Done')
      this.clearMessages()

      // We might have done this logged out.  By the time it has completed we will have an account, so we want to make
      // sure that the login page pops up rather than the signup page.
      useAuthStore().loggedInEver = true

      return results
    },
    prune() {
      if (this.messages && !Array.isArray(this.messages)) {
        // This is bad data.
        console.log('Bad compose messages, discard')
        this.messages = []
      }

      if (this.messages) {
        // Remove empty.
        this.messages = this.messages.filter((m) => m)

        // We want to clear any messages from our local store that are not fairly recent, otherwise we can confusingly
        // show an old message, which may then get edited to be a new one, leaving replies to the old message pointing
        // at the new one.  I'm looking at you, Craig.
        //
        // Also remove messages for other users.
        for (let id = 0; id < this.messages.length; id++) {
          const m = this.messages[id]

          if (!m.savedAt) {
            // This can happen for legacy stores.
            this.messages[id].savedAt = Date.now()
          } else if (Date.now() - m.savedAt > 7 * 24 * 60 * 60 * 1000) {
            this.deleteMessage(id)
          }

          const myid = useAuthStore().user?.id

          if (m.savedBy && (!myid || m.savedBy !== myid)) {
            // This is probably not ours.
            this.deleteMessage(id)
          }
        }
      }
    },
    clearMessages() {
      this.messages = []
    },
  },
  getters: {
    message: (state) => (id) => {
      const m = state.messages[id]

      if (m) {
        m.id = id
      }

      return m
    },
    all: (state) => {
      const ret = []
      let gotOffer = false
      let gotWanted = false

      for (let id = 0; id < state.messages.length; id++) {
        const m = state.messages[id]

        if (m) {
          if (m.type === 'Offer') {
            gotOffer = true
          }

          if (m.type === 'Wanted') {
            gotWanted = true
          }

          m.id = id
          ret.push(m)
        }
      }

      // We want to ensure that we always return at least one offer or wanted.
      //
      // This can also happen, it seems, during the initial load before the Pinia
      // state has been restored.  We used to try to spot when the store didn't have the right messages and fix them
      // up, but because the state hadn't been restored we actually lost what was in there.
      if (!gotOffer) {
        const m = defaultOffer
        m.id = ret.length
        ret.push(m)
      }
      if (!gotWanted) {
        const m = defaultWanted
        m.id = ret.length
        ret.push(m)
      }

      return ret
    },
    attachments: (state) => (id) => {
      return state.attachmentBump && state.messages[id]?.attachments
        ? state.messages[id].attachments
        : []
    },
    progress: (state) => {
      return (Math.min(state._progress, state.max - 1) * 100) / state.max
    },
    messageValid: (state) => (postType) => {
      // Is there at least one valid message of this type
      let valid = false

      if (state.messages?.length) {
        const messages = state.messages.filter((m) => {
          return m?.type === postType.value
        })

        valid = true

        for (const message of messages) {
          const atts = message.attachments ? message.attachments : []

          // A message is valid if there is an item, and either a description or a photo.
          if (
            !message.item ||
            !message.item.trim() ||
            ((!message.description || !message.description.trim()) &&
              !atts.length)
          ) {
            valid = false
          }
        }
      }

      return valid
    },
    postcodeValid: (state) => {
      return state.postcode?.name
    },
    noGroups: (state) => {
      return !state.postcode?.groupsnear?.length
    },
  },
})
