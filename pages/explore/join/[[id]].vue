<template>
  <client-only v-if="me">
    <div>
      <b-row class="m-0">
        <b-col cols="12" lg="6" class="p-0" offset-lg="3">
          <NoticeMessage v-if="invalid" variant="danger" class="mt-2">
            That community name is invalid - please check it.
          </NoticeMessage>
          <div v-else>
            <ExploreGroup v-if="id" :id="id" />
          </div>
        </b-col>
      </b-row>
    </div>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { useGroupStore } from '~/stores/group'
import { useAuthStore } from '~/stores/auth'
import {
  ref,
  onMounted,
  defineAsyncComponent,
  definePageMeta,
  useRouter,
} from '#imports'
import { useMe } from '~/composables/useMe'
import NoticeMessage from '~/components/NoticeMessage'

const ExploreGroup = defineAsyncComponent(() =>
  import('~/components/ExploreGroup.vue')
)

definePageMeta({
  layout: 'login',
})

const authStore = useAuthStore()
const groupStore = useGroupStore()
const { me, oneOfMyGroups, myid } = useMe()

const route = useRoute()
const router = useRouter()
const id = parseInt(route.params.id) || null
const invalid = ref(false)

if (id) {
  try {
    await groupStore.fetch(id)
  } catch (e) {
    console.error('Invalid group', e)
    invalid.value = true
  }
} else {
  router.push('/explore')
}

async function join() {
  const group = groupStore?.get(id)

  await authStore.joinGroup(myid.value, id, true)

  // Route back.
  router.push('/explore/' + group.nameshort)
}

onMounted(() => {
  if (me.value) {
    if (!oneOfMyGroups(id)) {
      // Logged in on load - join
      join()
    } else {
      router.go(-1)
    }
  }
})
</script>
