<template>
  <client-only>
    <b-row class="m-0">
      <b-col cols="0" md="3" class="d-none d-md-block" />
      <b-col cols="12" md="6" class="p-0">
        <NoticeMessage v-if="notFound" class="mt-2" variant="danger">
          Sorry, we can't find that freegler. Please go back and refresh.
        </NoticeMessage>
        <ProfileInfo v-else :id="id" />
      </b-col>
    </b-row>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { ref } from '#imports'
import { useUserStore } from '~/stores/user'
import ProfileInfo from '~/components/ProfileInfo'
import NoticeMessage from '~/components/NoticeMessage'

const userStore = useUserStore()
const route = useRoute()
const id = parseInt(route.params.id)
const notFound = ref(false)

if (id) {
  try {
    await userStore.fetch(id)
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
