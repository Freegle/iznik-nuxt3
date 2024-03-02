<template>
  <div>
    <b-input-group>
      <b-form-input v-model="term" placeholder="Message id/subject" @keyup.native.enter="search" />
      <b-input-group-append>
        <SpinButton variant="primary" icon-name="search" label="Search" spinclass="text-white" :handler="search" :disabled="!term" />
      </b-input-group-append>
    </b-input-group>
    <NoticeMessage v-if="error" class="mt-2" variant="warning">
      Couldn't fetch that message. Almost always this is because the message doesn't exist (or has been very deleted).
    </NoticeMessage>
  </div>
</template>

<script setup>
import { useMessageStore } from '~/stores/message'
const messageStore = useMessageStore()

const term = ref(null)
const busy = ref(false)
const error = ref(false)

const props = defineProps({
  groupid: {
    type: Number,
    required: false,
    default: null
  }
})

const search = async () => {
  busy.value = true
  error.value = false
  const term = term.value.trim()

  await messageStore.clearContext()
  await messageStore.clear()

  this.$emit('searched', term)

  if (term) {
    if (!isNaN(term)) {
      // This is a raw message id
      await searchById(term)
    } else if (term.substring(0, 1) === '#' && !isNaN(term.substring(1))) {
      // This is a #id
      await searchById(term.substring(1))
    } else {
      await searchBySubject(this.term)
    }
  }

  busy.value = false
}

const searchById = async (id) => {
  busy.value = true
  error.value = false

  try {
    await messageStore.fetch({
      id: id,
      messagehistory: true
    })
  } catch (e) {
    console.log("Couldn't fetch", e)
    this.error = true
  }

  busy.value = false
}

const searchBySubject = async (subj) => {
  busy.value = true
  error.value = false

  await messageStore.search({
    term: subj,
    groupid: props.groupid
  })

  busy.value = false
}
</script>
<style scoped>
input {
  max-width: 320px;
}
</style>
