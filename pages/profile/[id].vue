<template>
  <client-only>
    <NoticeMessage v-if="notFound" class="mt-2" variant="danger">
      Sorry, we can't find that freegler. Please go back and refresh.
    </NoticeMessage>
    <!-- Mobile view -->
    <ProfileInfoMobile v-else-if="isMobile" :id="id" />
    <!-- Desktop view -->
    <div v-else class="profile-page">
      <div class="profile-content">
        <ProfileInfo :id="id" />
      </div>
    </div>
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
  return (
    miscStore.breakpoint === 'xs' ||
    miscStore.breakpoint === 'sm' ||
    miscStore.breakpoint === 'md'
  )
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

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.profile-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}
</style>
