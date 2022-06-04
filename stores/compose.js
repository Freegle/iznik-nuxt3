import { defineStore } from 'pinia'
import { useMessageStore } from '~/stores/message'
import api from '~/api'
import { useAuthStore } from '~/stores/auth'

export const useComposeStore = defineStore({
  id: 'compose',
  persist: {
    enabled: true,
    strategies: [
      {
        // We need to persist this to local storage so that the flows work when logged out - we may navigate away
        // from the page to do login.
        storage: localStorage,
      },
    ],
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
    _attachments: {},
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

      // eslint-disable-next-line no-unused-vars
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
      const attids = []

      if (this._attachments[message.id]) {
        for (const att in this._attachments[message.id]) {
          attids.push(this._attachments[message.id][att].id)
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
    async submitDraft(id, email) {
      console.log('Submit draft', id, email)
      const ret = await this.$api.message.joinAndPost(id, email, (data) => {
        // ret = 8 is posting prohibited, which is due to mod choice not a server error.
        // ret = 9 is banned, ditto.
        console.log('Post failed', data, data.ret, data.ret !== 8)
        return data.ret !== 8 && data.ret !== 9
      })
      console.log('Returned', ret)
      this._progress++
      return ret
    },
    markSubmitted(id, me) {
      console.log('Mark submitted', id)
      this.setMessage({
        message: {
          id,
          submitted: true,
          item: null,
          description: null,
          availablenow: 1,
        },
        me,
      })

      this.setAttachmentsForMessage({
        id,
        attachments: [],
      })
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
      if (postcode && postcode.groupsnear) {
        const pc = { ...postcode }

        pc.groupsnear = []

        for (const group of postcode.groupsnear) {
          pc.groupsnear.push({
            id: group.id,
            nameshort: group.nameshort,
            namedisplay: group.namedisplay,
            type: group.type,
            settings: {
              closed: group.settings.closed,
            },
          })
        }

        console.log('Store pc', pc)
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
    setMessage({ message, me }) {
      message.savedAt = Date.now()
      message.savedBy = me ? me.id : null

      this.messages[message.id] = message

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
    setAvailableNow(params) {
      const id = params.id
      this.ensureMessage(id)
      this.messages[id].availablenow = params.availablenow
      this.messages[id].savedAt = Date.now()
    },
    setDescription(params) {
      const id = params.id
      this.ensureMessage(id)
      this.messages[id].description = params.description
      this.messages[id].savedAt = Date.now()
    },
    addAttachment(params) {
      this._attachments[params.id] = this._attachments[params.id]
        ? this._attachments[params.id]
        : []
      this._attachments[params.id].push(params.attachment)
      console.log('Added attachment', params.id, params.attachment)
      this.attachmentBump++
    },
    setAttachmentsForMessage(params) {
      this._attachments[params.id] = params._attachments
    },
    removeAttachment(params) {
      const newAtts = this._attachments[params.id].filter((obj) => {
        return parseInt(obj.id) !== parseInt(params.photoid)
      })

      this._attachments[params.id] = newAtts
    },
    deleteMessage(params) {
      this.messages = this.messages.filter((m) => m.id !== params.id)
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
      console.log('Submit', messages, params.type)

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
            this.email,
            message,
            this._attachments[message.id]
          )

          let result

          if (message.id <= 0) {
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
              this.email
            )

            result = { id, groupid, newuser, newpassword }
          } else {
            // This is one of our existing messages which we are reposting.  We need to convert it back to a draft,
            // edit it (to update it from our client data), and then submit.
            console.log('Existing message')
            const id = message.id
            await this.backToDraft(id)

            const attids = []

            if (this._attachments[message.id]) {
              for (const att in this._attachments[message.id]) {
                attids.push(this._attachments[message.id][att].id)
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
              this.email
            )

            result = { id, groupid, newuser, newpassword }
          }

          console.log('Got result', result)
          results.push(result)

          const me = useAuthStore().user
          this.markSubmitted(result.id, me)
        }
      }

      console.log('Done')
      this.clearMessages()

      // We might have done this logged out.  By the time it has completed we will have an account, so we want to make
      // sure that the login page pops up rather than the signup page.
      // TODO me.
      // dispatch('auth/loggedInEver', true, {
      //   root: true,
      // })

      return results
    },
    prune() {
      // We want to clear any messages from our local store that are not fairly recent, otherwise we can confusingly
      // show an old message, which may then get edited to be a new one, leaving replies to the old message pointing
      // at the new one.  I'm looking at you, Craig.
      if (this.messages) {
        for (let id = 0; id < this.messages.length; id++) {
          const m = this.messages[id]

          if (!m.savedAt) {
            // This can happen for legacy stores.
            this.messages[id].savedAt = Date.now()
          } else if (Date.now() - m.savedAt > 7 * 24 * 60 * 60 * 1000) {
            this.deleteMessage({
              id,
            })
          }
        }
      }
    },
    clearMessages() {
      this.messages = []
      this._attachments = {}
    },
  },
  getters: {
    ids: (state) => {
      // We return a fake "id" which is the index.  This is a client-side id only.
      const ret = []

      for (let i = 0; i < state.messages.length; i++) {
        ret.push(i)
      }

      return ret
    },
    message: (state) => (id) => {
      const m = state.messages[id]
      m.id = id
      return m
    },
    all: (state) => {
      const ret = []

      for (let id = 0; id < state.messages.length; id++) {
        const m = state.messages[id]
        m.id = id
        ret.push(m)
      }

      return ret
    },
    attachments: (state) => (id) => {
      return state.attachmentBump && state._attachments[id]
        ? state._attachments[id]
        : []
    },
    progress: (state) => {
      return (Math.min(state._progress, state.max - 1) * 100) / state.max
    },
    messageValid: (state) => (postType) => {
      // Is there at least one valid message of this type
      const messages = state.messages.filter((m) => {
        return m.type === postType.value
      })

      let valid = false

      if (messages?.length) {
        valid = true

        for (const message of messages) {
          const atts =
            message.id in state._attachments
              ? Object.values(state._attachments[message.id])
              : []

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
