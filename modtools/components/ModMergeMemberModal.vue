<template>
  <div>
    <b-modal
      id="addMemberModal"
      ref="modal"
      title="Merge Member"
      size="lg"
      no-stacking
      @shown="onShow"
      @hidden="onHide"
    >
      <template #default>
        <div v-if="merged">We've merged them.</div>
        <div v-else>
          <NoticeMessage variant="danger">
            Please be careful! You can't undo this without geek help (and even
            then it is imperfect). So please be completely sure that these are
            the same users.
          </NoticeMessage>
          <div v-if="supportOrAdmin" class="d-flex justify-content-around">
            <OurToggle
              v-model="byemail"
              class="mt-4"
              :height="30"
              :width="150"
              :font-size="14"
              :sync="true"
              :labels="{
                checked: 'Merge by email',
                unchecked: 'Merge by user id',
              }"
              variant="modgreen"
            />
          </div>
          <div v-if="byemail">
            <p class="mt-2">
              This will merge from the first user into the second user. The
              second user's preferred email will be the preferred email of the
              merged user, so make sure you get this the right way round.
            </p>
            <div class="d-flex justify-content-between flex-wrap">
              <b-form-input
                v-model="email1"
                type="email"
                placeholder="First email"
                class="mt-2 mb-2"
              />
              <b-form-input
                v-model="email2"
                type="email"
                placeholder="Second email (and email of merged user)"
                class="mt-2 mb-2"
              />
            </div>
          </div>
          <div v-else>
            <p class="mt-2">
              This will merge from the first user into the second user. The
              second user's preferred email, if any, will be the preferred email
              of the merged user, so make sure you get this the right way round.
              This is Support-only, as there's more scope for messing up if you
              get the ids wrong - so do be very careful.
            </p>
            <div class="d-flex justify-content-between flex-wrap">
              <b-form-input
                v-model="id1"
                type="number"
                placeholder="First user id"
                class="mt-2 mb-2"
              />
              <b-form-input
                v-model="id2"
                type="number"
                placeholder="Second user id"
                class="mt-2 mb-2"
              />
            </div>
          </div>
          <b-form-input
            v-model="reason"
            placeholder="Enter a reason for the logs"
            class="mt-2 mb-2"
          />
          <NoticeMessage v-if="tn" variant="danger">
            You can't merge TrashNothing members. Please either remove the least
            active of them, or add Notes to each one to say that they're the
            same real person.
          </NoticeMessage>
          <NoticeMessage v-if="error" variant="danger">
            {{ error }}
          </NoticeMessage>
        </div>
      </template>
      <template #footer>
        <b-button variant="white" @click="hide"> Close </b-button>
        <b-button
          v-if="!merged"
          variant="primary"
          :disabled="cantMerge"
          @click="merge"
        >
          Merge
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useOurModal } from '~/composables/useOurModal'
import { useMe } from '~/composables/useMe'

const emit = defineEmits(['hidden'])

const { modal, hide } = useOurModal()
const { supportOrAdmin } = useMe()
const authStore = useAuthStore()

const email1 = ref(null)
const email2 = ref(null)
const id1 = ref(null)
const id2 = ref(null)
const reason = ref(null)
const merged = ref(false)
const byemail = ref(true)
const error = ref(null)

const tn = computed(() => {
  return (
    (email1.value && email1.value.includes('trashnothing')) ||
    (email2.value && email2.value.includes('trashnothing'))
  )
})

const cantMerge = computed(() => {
  if (!reason.value || tn.value) {
    return true
  }

  if (email1.value && email2.value) {
    return false
  }

  if (id1.value && id2.value) {
    return false
  }

  return true
})

function onShow() {}

function onHide() {
  emit('hidden')
}

async function merge() {
  error.value = false
  try {
    if (byemail.value) {
      await authStore.merge({
        email1: email1.value,
        email2: email2.value,
        reason: reason.value,
      })
    } else {
      await authStore.merge({
        id1: id1.value,
        id2: id2.value,
        reason: reason.value,
      })
    }

    merged.value = true
  } catch (e) {
    error.value = e.message
    const statuspos = e.message.indexOf('status:')
    if (statuspos !== -1) {
      error.value = e.message.substring(statuspos)
    }
  }
}
</script>
