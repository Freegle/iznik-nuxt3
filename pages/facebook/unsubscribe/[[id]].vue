<template>
  <client-only>
    <b-row class="m-0">
      <b-col cols="0" lg="3" class="d-none d-lg-block" />
      <b-col cols="12" lg="6" class="p-0">
        <NoticeMessage
          v-if="notFound || user?.fullname.indexOf('Deleted User #') !== -1"
          class="mt-2"
          variant="danger"
        >
          Your account has been deleted.
        </NoticeMessage>
        <NoticeMessage v-else-if="user.deleted" class="mt-2" variant="info">
          <p>
            Your account was deleted on <strong>{{ deleted }}</strong
            >. Your data will be removed about two weeks after that.
          </p>
          <p>
            Meanwhile other freeglers can't see your personal data, post or chat
            messages.
          </p>
          <p>
            If you change your mind, you can recover your account by logging
            back in to the site - you'll see a warning and a button to recover
            the account.
          </p>
        </NoticeMessage>
        <NoticeMessage v-else variant="warning">
          <p>Your account is still active.</p>
          <p>If you want to leave, click here:</p>
          <b-button variant="secondary" size="lg" to="/unsubscribe">
            <v-icon icon="trash-alt" />
            Unsubscribe
          </b-button>
        </NoticeMessage>
      </b-col>
    </b-row>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { useUserStore } from '~/stores/user'
import { dateshort } from '~/composables/useTimeFormat'

const userStore = useUserStore()
const route = useRoute()
const id = ref(parseInt(route.params.id))
const notFound = ref(false)
const user = ref(null)
const deleted = computed(() => {
  if (user.value) {
    return dateshort(user.value.deleted)
  }

  return null
})

if (id.value) {
  try {
    user.value = await userStore.fetch(id.value)
  } catch (e) {
    if (e?.response?.status === 404) {
      console.log('User not found')
      notFound.value = true
    } else {
      throw e
    }
  }
}
</script>
