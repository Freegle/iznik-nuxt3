<template>
  <b-row class="m-0">
    <b-col cols="0" md="3" class="d-none d-md-block" />
    <b-col cols="12" md="6" class="p-0">
      <ProfileInfo :id="id" />
    </b-col>
  </b-row>
</template>
<script>
import { useRoute } from 'vue-router'
import { useUserStore } from '../../stores/user'
import ProfileInfo from '~/components/ProfileInfo'

export default {
  components: {
    ProfileInfo,
  },
  props: {},
  async setup(props) {
    const userStore = useUserStore()
    const route = useRoute()
    const id = parseInt(route.params.id)

    if (id) {
      await userStore.fetch(id)
    }

    return {
      id,
      userStore,
    }
  },
}
</script>
