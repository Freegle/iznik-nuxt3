<template>
  <b-modal
    ref="modal"
    scrollable
    title="Giving a Thumbs Down..."
    ok-title="Submit"
    @ok="doSomeoneDown"
  >
    <p>
      Please tell us why you're doing this. Your local volunteers may see what
      you put, but the other freegler won't.
    </p>
    <div class="mt=2">
      <b-form-group v-slot="{ ariaDescribedby }" label="What went wrong?">
        <b-form-radio
          v-model="reason"
          :aria-describedby="ariaDescribedby"
          name="reason"
          value="NoShow"
          >No Show</b-form-radio
        >
        <b-form-radio
          v-model="reason"
          :aria-describedby="ariaDescribedby"
          name="reason"
          value="Punctuality"
          >Was late or early</b-form-radio
        >
        <b-form-radio
          v-model="reason"
          :aria-describedby="ariaDescribedby"
          name="reason"
          value="Ghosted"
          >Stopped replying</b-form-radio
        >
        <b-form-radio
          v-model="reason"
          :aria-describedby="ariaDescribedby"
          name="reason"
          value="Rude"
          >Unpleasant behaviour</b-form-radio
        >
        <b-form-radio
          v-model="reason"
          :aria-describedby="ariaDescribedby"
          name="reason"
          value="Other"
          >Something else</b-form-radio
        >
      </b-form-group>
    </div>
    <div class="mt-2">
      <label class="font-weight-bold" for="text">
        Please give a bit of detail.
      </label>
      <b-form-textarea
        id="text"
        v-model="text"
        rows="3"
        placeholder="Explain what happened here..."
      />
    </div>
    <b-alert v-model="showError" variant="danger" class="mt-2">
      Please select a reason and add some detail. Thanks.
    </b-alert>
  </b-modal>
</template>
<script setup>
import { useUserStore } from '~/stores/user'
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['rated'])

const { modal, hide } = useOurModal()

const showError = ref(false)
const reason = ref(null)
const text = ref(null)

const userStore = useUserStore()

async function rate(rating, reason, text) {
  await userStore.rate(props.id, rating, reason, text)
}

async function doSomeoneDown(e) {
  showError.value = false

  if (!reason.value || !text.value) {
    showError.value = true
  } else {
    emit('rated', 'Down')
    await rate('Down', reason.value, text.value)
    hide()
  }

  e.preventDefault()
}
</script>
