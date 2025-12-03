<template>
  <client-only>
    <NoticeMessage v-if="notFound" class="mt-2" variant="danger">
      Sorry, we can't find that freegler. Please go back and refresh.
    </NoticeMessage>
    <!-- Mobile view -->
    <ProfileInfoMobile v-else-if="isMobile" :id="id" />
    <!-- Desktop view -->
    <b-row v-else class="m-0">
      <b-col cols="0" lg="3" class="d-none d-lg-block" />
      <b-col cols="12" lg="6" class="p-0">
        <ProfileInfo :id="id" />
      </b-col>
      <b-col cols="0" lg="3" class="d-none d-lg-block" />
    </b-row>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { ref, computed, defineAsyncComponent } from '#imports'
import { useUserStore } from '~/stores/user'
import { useMiscStore } from '~/stores/misc'
import ProfileInfo from '~/components/ProfileInfo'
import NoticeMessage from '~/components/NoticeMessage'

const ProfileInfoMobile = defineAsyncComponent(() =>
  import('~/components/ProfileInfoMobile')
)

const userStore = useUserStore()
const miscStore = useMiscStore()
const route = useRoute()
const id = parseInt(route.params.id)
const notFound = ref(false)

const isMobile = computed(() => {
  return miscStore.breakpoint === 'xs' || miscStore.breakpoint === 'sm'
})

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
