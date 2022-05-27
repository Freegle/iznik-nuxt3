import { useRouter, useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import { useComposeStore } from '~/stores/compose'
import { useGroupStore } from '~/stores/group'
import { useMessageStore } from '~/stores/message'

export function getId() {
  const composeStore = useComposeStore()

  // Find a new id.  Use the messages because ids is filtered by type.
  let nextId = -1
  const messages = composeStore.messages

  for (const [, message] in messages) {
    nextId = Math.min(message.id, nextId)
  }

  nextId--

  return nextId
}

export function setup() {
  // We can use this to set up a bunch of data and computed properties in a caller.
  const composeStore = useComposeStore()
  const groupStore = useGroupStore()

  const group = computed({
    set(groupid) {
      composeStore.group = groupid
    },
    get() {
      const groupid = composeStore.group
      return groupid ? groupStore.get(groupid) : null
    },
  })

  const postcode = computed({
    get() {
      return composeStore.postcode
    },
    set(pc) {
      return composeStore.setPostcode(pc)
    },
  })

  // TODO me
  const me = null

  const email = computed({
    get() {
      // See if we have a local email stored from last time we were logged in.
      let email = composeStore.email

      if (!email && me && me.email) {
        // If we're logged in, then we have an email from that which takes precedence.
        email = me.email
      }

      return email
    },
    set(newValue) {
      composeStore.setEmail(newValue)
    },
  })

  const route = useRoute()
  const initialPostcode = route.query.postcode ?? postcode?.name

  // We want to refetch the group in case its closed status has changed.
  const groupid = composeStore.group

  if (groupid) {
    groupStore.fetch({
      id: groupid,
    })
  }

  // Make sure we're not wrongly set as being in the middle of an upload
  composeStore.uploading = false

  // We also want to prune any old messages from our store.
  composeStore.prune()

  return {
    postType: ref(null),
    submitting: ref(false),
    invalid: ref(false),
    notAllowed: ref(false),
    wentWrong: ref(false),
    initialPostcode,
    group,
    closed: computed(() => group?.settings?.closed),
    ids: computed(() => {
      // ids of messages we are composing.
      const messages = composeStore.messages
      // TODO me
      const myid = null

      let ids = []
      for (const [id, message] in messages) {
        // We don't want to return messages where we are logged in as one user but the message came from another.
        // This can happen if you repost, don't complete, sign in as another user.  The server submit call will
        // fail in that case, so we are better off not showing the message at all and letting them compose from
        // scratch.
        if (
          id &&
          message.id &&
          message.type === this.postType &&
          (!message.savedBy || message.savedBy === myid)
        ) {
          ids.push(message.id)
        }
      }

      if (ids.length === 0) {
        ids = [getId()]
      }

      return ids
    }),
    notblank: computed(() => {
      let ret = false
      const messages = composeStore.messages
      if (messages?.length > 0) {
        const message = messages[0]

        const atts = Object.values(composeStore.attachments(message.id))

        ret =
          (message.item && message.item.trim()) ||
          (message.description && message.description.trim()) ||
          atts.length
      }

      return ret
    }),
    messageValid: computed(() => {
      const messages = Object.values(composeStore.messages).filter((m) => {
        return m.id && m.type === this.postType
      })

      let valid = false

      if (messages?.length && this.ids) {
        valid = true

        for (const message of messages) {
          const atts = Object.values(composeStore.attachments(message.id))

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
    }),
    uploadingPhoto: computed(() => {
      return composeStore.uploading
    }),
    noGroups: computed(() => {
      return !postcode?.groupsnear?.length
    }),
    postcodeValid: computed(() => {
      return postcode?.name
    }),
    emailIsntOurs: computed(() => {
      let ret = false

      if (email && me) {
        ret = !me.emails.find((e) => {
          return (
            email
              .toLowerCase()
              .trim()
              .localeCompare(e.email.toLowerCase().trim()) === 0
          )
        })
      }

      return ret
    }),
  }
}

export async function deleteItem() {
  const composeStore = useComposeStore()

  await composeStore.setAttachmentsForMessage({
    id: this.ids[this.ids.length - 1],
    attachments: [],
  })

  await composeStore.clearMessage({
    id: this.ids[this.ids.length - 1],
  })
}

export function postcodeClear() {
  this.postcode = null
  this.group = null
}

export function postcodeSelect(pc) {
  const composeStore = useComposeStore()

  const currentpc = composeStore.postcode

  if (!currentpc || currentpc.id !== pc.id) {
    // The postcode has genuinely changed or been set for the first time.  We don't want to go through this code
    // if the postcode is the same, otherwise we'll reset the group (which might have been changed from the first,
    // for example in the give flow if you choose a different group.
    composeStore.setPostcode(pc)

    // If we don't have a group currently which is in the list near this postcode, choose the closest.  That
    // allows people to select further away groups if they wish.
    const groupid = composeStore.group

    if (pc && pc.groupsnear) {
      let found = false
      for (const group of pc.groupsnear) {
        if (parseInt(group.id) === parseInt(groupid)) {
          found = true
        }
      }

      if (!found) {
        if (pc.groupsnear.length) {
          this.group = pc.groupsnear[0].id
        }
      } else {
        this.group = groupid
      }
    }
  }
}

export function addItem() {
  const composeStore = useComposeStore()

  const id = getId()

  composeStore.setMessage({
    id,
    item: null,
    description: null,
    type: this.postType,
    availablenow: 1,
  })
}

export async function freegleIt(type) {
  const composeStore = useComposeStore()
  const messageStore = useMessageStore()
  const router = useRouter()

  this.submitting = true

  try {
    const results = await composeStore.submit({
      type,
    })

    // The params we pass from the results may crucially include new user information,
    // and depending on timing this may not appear in the first result, so look for one of those first.
    const params = {
      justPosted: [],
      newuser: null,
      newpassword: null,
    }

    results.forEach((res) => {
      if (res.newuser) {
        params.newuser = res.newuser
        params.newpassword = res.newpassword

        // Fetch the session so that we know we're logged in, and so that we have permission to fetch messages
        // below.
        // TODO me
        // await this.fetchMe(['groups'], true)
      }
    })

    const promises = []

    if (results.length > 0 && results[0].groupid) {
      results.forEach((res) => {
        params.justPosted.push(res.id)

        promises.push(
          messageStore.fetch({
            id: res.id,
          })
        )
      })

      await Promise.all(promises)

      router.push({
        name: 'myposts',
        params,
      })
    } else {
      // Was probably already submitted
      router.push({
        name: 'myposts',
      })
    }
  } catch (e) {
    console.log('Submit failed', e)
    if (e.message.includes('Not allowed to post on this group')) {
      this.notAllowed = true
    } else {
      this.wentWrong = true
    }
  }
}

export function emailInUse(email) {
  // If we are logged in, and we have an email address in hand which is not one of our own, then this is
  // worth knowing because it suggests that the user is confused and has multiple accounts.  Check with the
  // server whether this email is in use by another account.
  // TODO email in use
  return false
  // return this.$store.dispatch('user/emailIsInUse', {
  //   email,
  // })
}
