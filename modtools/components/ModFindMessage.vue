<template>
  <div>
    <b-input-group>
      <b-form-input v-model="term" placeholder="Message id/subject" @keyup.native.enter="search" />
      <b-input-group-append>
        <SpinButton variant="primary" icon-name="search" label="Search" spinclass="text-white" @handle="search" :disabled="!term" />
      </b-input-group-append>
    </b-input-group>
    <!--NoticeMessage v-if="error" class="mt-2" variant="warning">
      Couldn't fetch that message. Almost always this is because the message doesn't exist (or has been very deleted).
    </NoticeMessage-->
  </div>
</template>

<script setup>
const term = ref(null)

const props = defineProps({
  groupid: {
    type: Number,
    required: false,
    default: null
  }
})

const emit = defineEmits(['searched'])

const search = async (callback) => {
  const theterm = term.value.trim()
  emit('searched', theterm)
  if (typeof callback === 'function') {
    callback()
  }
  /*
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
  
    busy.value = false*/
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
