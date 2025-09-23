import { useRoute } from 'vue-router'
import { ref, computed } from '#imports'
import { useComposeStore } from '~/stores/compose'
import { useGroupStore } from '~/stores/group'
import { useMessageStore } from '~/stores/message'
import { useAuthStore } from '~/stores/auth'

// Module-level globals
const postType = ref(null)
let email = ref(null)
let group = ref(null)
let postcode = ref(null)
const loggedIn = ref(false)
const submitting = ref(false)
const invalid = ref(false)
const notAllowed = ref(false)
const unvalidatedEmail = ref(false)
const wentWrong = ref(false)
const initialPostcode = ref(null)
let closed = ref(false)
let ids = ref([])
let notblank = ref(false)
let messageValid = ref(false)
let uploadingPhoto = ref(false)
let noGroups = ref(false)
let postcodeValid = ref(false)
let emailIsntOurs = ref(false)

export function setup(type) {
  // We can use this to set up a bunch of data and computed properties in a caller.
  const composeStore = useComposeStore()
  const groupStore = useGroupStore()
  const authStore = useAuthStore()
  const messageStore = useMessageStore()

  // Set the post type
  postType.value = type

  // Set up computed properties
  group = computed({
    set(groupid) {
      composeStore.group = groupid
    },
    get() {
      const groupid = composeStore.group
      return groupid ? groupStore.get(groupid) : null
    },
  })

  postcode = computed({
    get() {
      return composeStore.postcode
    },
    set(pc) {
      return composeStore.setPostcode(pc)
    },
  })

  const me = computed(() => authStore.user)

  email = computed({
    get() {
      // See if we have a local email stored from last time we were logged in.
      let emailValue = composeStore.email

      if (!emailValue && me.value?.email) {
        // If we're logged in, then we have an email from that which takes precedence.
        emailValue = me.value.email
      }

      return emailValue
    },
    set(newValue) {
      composeStore.setEmail(newValue)
    },
  })

  const route = useRoute()
  initialPostcode.value = route.query.postcode
    ? route.query.postcode
    : composeStore.postcode?.name

  // We want to refetch the group in case its closed status has changed.
  const groupid = composeStore.group

  if (groupid) {
    groupStore.fetch(groupid)
  }

  ids = computed(() => {
    // ids of messages we are composing.
    const myid = authStore.user?.id

    const messageIds = []
    composeStore.all.forEach((message) => {
      // We don't want to return messages where we are logged in as one user but the message came from another.
      // This can happen if you repost, don't complete, log in as another user.  The server submit call will
      // fail in that case, so we are better off not showing the message at all and letting them compose from
      // scratch.
      if (
        message.type === type &&
        (!message.savedBy || message.savedBy === myid)
      ) {
        messageIds.push(message.id)
      }
    })

    return messageIds
  })

  // Make sure we're not wrongly set as being in the middle of an upload
  composeStore.uploading = false

  // We also want to prune any old messages from our store.
  composeStore.prune()

  const myid = authStore.user?.id

  if (myid) {
    // Get our own posts so that we can spot duplicates.
    messageStore.fetchByUser(myid, false)
  }

  // Update all the refs with initial values
  loggedIn.value = !!myid
  submitting.value = false
  invalid.value = false
  notAllowed.value = false
  unvalidatedEmail.value = false
  wentWrong.value = false

  // Set up remaining computed properties
  closed = computed(() => group.value?.settings?.closed)

  notblank = computed(() => {
    let ret = false
    const messages = composeStore.all
    if (messages?.length > 0) {
      messages.forEach((message) => {
        const atts = Object.values(composeStore.attachments(message.id))

        ret ||=
          message.type === postType.value &&
          ((message.item && message.item.trim()) ||
            (message.description && message.description.trim()) ||
            atts?.length)
      })
    }

    return ret
  })

  messageValid = computed(() => {
    return composeStore.messageValid(postType)
  })

  uploadingPhoto = computed(() => {
    return composeStore.uploading
  })

  noGroups = computed(() => {
    return composeStore.noGroups
  })

  postcodeValid = computed(() => {
    return composeStore.postcodeValid
  })

  emailIsntOurs = computed(() => {
    let ret = false
    const user = authStore.user
    const em = email.value + ''

    if (email.value && user) {
      ret = !user.emails?.find((e) => {
        return (
          em
            .toLowerCase()
            .trim()
            .localeCompare(e.email.toLowerCase().trim()) === 0
        )
      })
    }

    return ret
  })

  // Return all the refs
  return {
    email,
    postType,
    loggedIn,
    submitting,
    invalid,
    notAllowed,
    unvalidatedEmail,
    wentWrong,
    initialPostcode,
    group,
    postcode,
    closed,
    ids,
    notblank,
    messageValid,
    uploadingPhoto,
    noGroups,
    postcodeValid,
    emailIsntOurs,
  }
}

export async function deleteItem(id) {
  const composeStore = useComposeStore()

  await composeStore.deleteMessage(id)
}

export function postcodeClear() {
  postcode.value = null
  group.value = null
}

export function postcodeSelect(pc) {
  const composeStore = useComposeStore()

  const currentpc = composeStore.postcode

  if (
    !currentpc ||
    currentpc.id !== pc.id ||
    (!currentpc.groupsnear && pc.groupsnear)
  ) {
    // The postcode has genuinely changed, or been set for the first time, or had new group info
    // added.
    //
    // We don't want to go through this code if the postcode is the same, otherwise we'll reset
    // the group (which might have been changed from the first, for example in the give flow
    // if you choose a different group.
    console.log('Set compose postcode', pc)
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
        console.log('Current group not found in list')
        if (pc.groupsnear.length) {
          console.log('Use new nearby group', pc.groupsnear[0].id)
          composeStore.group = pc.groupsnear[0].id
        }
      } else {
        composeStore.group = groupid
      }
    }
  }
}

export function addItem() {
  const composeStore = useComposeStore()
  const authStore = useAuthStore()

  const id = composeStore.add()
  const me = authStore.user

  composeStore.setMessage(
    id,
    {
      id,
      item: null,
      description: null,
      type: postType.value,
      availablenow: 1,
    },
    me
  )
}

export async function freegleIt(type, router) {
  const composeStore = useComposeStore()
  const messageStore = useMessageStore()
  const authStore = useAuthStore()

  submitting.value = true
  unvalidatedEmail.value = false
  wentWrong.value = false
  notAllowed.value = false

  try {
    const results = await composeStore.submit({
      type,
    })

    // The params we pass from the results may crucially include new user information,
    // and depending on timing this may not appear in the first result, so look for one of those first.
    const params = {
      newuser: null,
      newpassword: null,
      ids: [],
      type,
    }

    await results.forEach(async (res) => {
      console.log('Consider result', res, type)
      if (type === 'Offer' && res.id) {
        params.ids.push(res.id)
      }

      if (res.newuser) {
        params.newuser = res.newuser
        params.newpassword = res.newpassword

        // Make sure we're logged in, and so that we have permission to fetch messages
        // below.
        console.log('Login', composeStore.email)
        await authStore.login({
          email: composeStore.email,
          password: params.newpassword,
        })

        // Save the postcode to the new user's settings, just like it would be if they had set it from the Settings page
        if (composeStore.postcode?.id) {
          console.log(
            'Saving postcode to new user settings',
            composeStore.postcode
          )
          const settings = authStore.user?.settings || {}
          settings.mylocation = composeStore.postcode
          await authStore.saveAndGet({
            settings,
          })
        }
      }
    })

    const promises = []

    if (results.length > 0 && results[0].groupid) {
      results.forEach((res) => {
        promises.push(messageStore.fetch(res.id))
      })

      await Promise.all(promises)
    }

    // We pass the data in the history state to avoid it showing up in the URL.
    console.log('Navigate to myposts', params)
    await router.push({
      name: 'myposts',
      state: params,
    })
    console.log('Navigated')
  } catch (e) {
    console.log('Submit failed', e, e?.response?.data?.ret)
    submitting.value = false

    if (e?.message) {
      if (e.message.includes('Unvalidated email')) {
        console.log('unvalidated')
        unvalidatedEmail.value = true
      } else if (e.message.includes('Not allowed to post on this group')) {
        notAllowed.value = true
      } else {
        wentWrong.value = true
      }
    } else {
      wentWrong.value = true
    }
  }

  submitting.value = false
}
