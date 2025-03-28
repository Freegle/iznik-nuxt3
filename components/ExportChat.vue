<template>
  <div>
    <b-row>
      <b-col cols="3">
        {{ dateonly(chat.date) }}
      </b-col>
      <b-col cols="4">
        {{ chat.name }}
      </b-col>
      <b-col cols="1">
        <b-button variant="link" @click="showMessages = true">
          Show messages
        </b-button>
      </b-col>
    </b-row>
    <div v-if="showMessages">
      <div v-for="message in chat.messages" :key="message.id">
        <b-row class="bg-white">
          <b-col cols="4">
            {{ dateonly(message.date) }}
          </b-col>
          <b-col cols="8" class="prewrap">
            {{ message.message }}
          </b-col>
        </b-row>
      </div>
    </div>
  </div>
</template>
<script>
import { dateonly } from '~/composables/useTimeFormat'
export default {
  props: {
    chat: {
      type: Object,
      required: true,
    },
  },
  data: function () {
    return {
      showMessages: false,
    }
  },
  methods: {
    dateonly
  }
}
</script>
