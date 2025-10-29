<template>
  <div>
    <div>
      <v-icon icon="check" class="text-success" /> Linked to
      <a :href="'https://facebook.com/' + facebook.id">{{ facebook.name }}</a>
      <span class="text-muted small">
        {{ dateshort(facebook.authdate) }}
      </span>
    </div>
    <b-button variant="white" class="mt-1" @click="unlink">
      <v-icon icon="trash-alt" /> Unlink
    </b-button>
  </div>
</template>
<script>
import { useGroupStore } from '~/stores/group'
export default {
  props: {
    groupid: {
      type: Number,
      required: true,
    },
    facebook: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const groupStore = useGroupStore()
    return { groupStore }
  },
  methods: {
    async unlink() {
      await this.groupStore.removeFacebook({
        uid: this.facebook.uid,
        groupid: this.groupid,
      })
    },
  },
}
</script>
