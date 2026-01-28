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
<script setup>
import { useGroupStore } from '~/stores/group'

const props = defineProps({
  groupid: {
    type: Number,
    required: true,
  },
  facebook: {
    type: Object,
    required: true,
  },
})

const groupStore = useGroupStore()

async function unlink() {
  await groupStore.removeFacebook({
    uid: props.facebook.uid,
    groupid: props.groupid,
  })
}
</script>
