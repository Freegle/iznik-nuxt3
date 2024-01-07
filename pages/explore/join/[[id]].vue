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
<script>
import { useRoute } from 'vue-router'
import { useGroupStore } from '../../../stores/group'
import { useAuthStore } from '../../../stores/auth'
import { useRouter } from '#imports'
import NoticeMessage from '~/components/NoticeMessage'
const ExploreGroup = defineAsyncComponent(() =>
  import('~/components/ExploreGroup.vue')
)

export default {
  components: {
    NoticeMessage,
    ExploreGroup,
  },
  async setup() {
    definePageMeta({
      layout: 'login',
    })
    const authStore = useAuthStore()
    const groupStore = useGroupStore()

    const route = useRoute()
    const router = useRouter()
    const id = parseInt(route.params.id) || null
    let invalid = false

    if (id) {
      try {
        await groupStore.fetch(id)
      } catch (e) {
        console.error('Invalid group', e)
        invalid = true
      }
    } else {
      router.push('/explore')
    }

    return {
      id,
      groupStore,
      authStore,
      invalid,
    }
  },
  mounted() {
    if (this.me) {
      if (!this.oneOfMyGroups(this.id)) {
        // Logged in on load - join
        this.join()
      } else {
        const router = useRouter()
        router.go(-1)
      }
    }
  },
  methods: {
    async join() {
      const group = this.groupStore?.get(this.id)

      await this.authStore.joinGroup(this.myid, this.id, true)

      // Route back.
      const router = useRouter()
      router.push('/explore/' + group.nameshort)
    },
  },
}
</script>
