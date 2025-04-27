<template>
  <div>
    <b-row>
      <b-col cols="2"> #{{ post.id }} </b-col>
      <b-col cols="2">
        {{ dateonly(post.arrival) }}
      </b-col>
      <b-col cols="2">
        <span v-if="post.groups && post.groups[0]">
          {{ post.groups[0].namedisplay }}
        </span>
      </b-col>
      <b-col cols="4">
        {{ post.subject }}
      </b-col>
      <b-col cols="2">
        <b-button variant="link" @click="showJSON = true"> Details </b-button>
      </b-col>
    </b-row>
    <vue-json-pretty v-if="showJSON" :data="post" class="bg-white" />
  </div>
</template>
<script setup>
import { ref } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import { useTimeFormat } from '~/composables/useTimeFormat'

defineProps({
  post: {
    type: Object,
    required: true,
  },
})

const { dateonly } = useTimeFormat()
const showJSON = ref(false)
</script>
