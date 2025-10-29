<template>
  <b-row class="m-0">
    <b-col cols="0" md="3">
      <VisibleWhen :at="['lg', 'xl', 'xxl']">
        <SidebarLeft />
      </VisibleWhen>
    </b-col>
    <b-col cols="12" md="6" class="bg-white pt-4">
      <b-card-text>
        <NoticeMessage v-if="done" variant="info">
          Thanks! Find more things like this
          <nuxt-link to="/microvolunteering">here</nuxt-link>.
        </NoticeMessage>
        <div v-else>
          <div>
            <h1>Does this post look OK?</h1>
            <MicroVolunteeringCheckMessage :id="msgid" @next="doneIt" />
          </div>
        </div>
        <hr />
        <p>
          If you've changed your mind and want to stop doing this, click here:
        </p>
        <b-button variant="white" class="mt-2 mb-1" @click="stopIt">
          Don't ask me again
        </b-button>
      </b-card-text>
    </b-col>
  </b-row>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { useMiscStore } from '~/stores/misc'
import { useAuthStore } from '~/stores/auth'
import { ref } from '#imports'

const MicroVolunteeringCheckMessage = defineAsyncComponent(() =>
  import('~/components/MicroVolunteeringCheckMessage')
)

definePageMeta({
  layout: 'login',
})

const route = useRoute()
const msgid = parseInt(route.params.id)

const miscStore = useMiscStore()
const authStore = useAuthStore()
const done = ref(false)

async function stopIt() {
  miscStore.set({
    key: 'microvolunteeringinviterejected',
    value: Date.now(),
  })

  await authStore.saveMicrovolunteering('Declined')

  const router = useRouter()
  router.push('/')
}

function doneIt() {
  done.value = true
}
</script>
<style scoped lang="scss">
:deep(label) {
  font-weight: bold;
}
</style>
