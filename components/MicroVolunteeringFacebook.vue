<template>
  <div>
    <div class="d-flex justify-content-around">
      <iframe
        title="Facebook post share"
        :src="
          'https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FFreegle%2Fposts%2F' +
          postId +
          '&show_text=true'
        "
        width="552"
        height="576"
        style="border: none; overflow: hidden"
        scrolling="no"
        frameborder="0"
        allowfullscreen="true"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      />
    </div>
    <div class="d-flex flex-wrap justify-content-around mt-3">
      <b-button variant="secondary" size="lg" @click="skip">
        Skip this one
      </b-button>
      <ShareNetwork
        network="facebook"
        :url="'https://www.facebook.com/Freegle/posts/' + postId"
        title="Sharing Freegle post'"
        hashtags="freegle,free,reuse"
        @close="close"
      >
        <b-button variant="secondary" size="lg" class="facebook">
          <v-icon :icon="['fab', 'facebook']" /> Share on Facebook
        </b-button>
      </ShareNetwork>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import VueSocialSharing from 'vue-social-sharing'
import { useMicroVolunteeringStore } from '~/stores/microvolunteering'
import { useNuxtApp } from '#app'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['next'])

const microVolunteeringStore = useMicroVolunteeringStore()

// We install this plugin here rather than from the plugins folder to reduce page load side in the mainline case
const nuxtApp = useNuxtApp()
nuxtApp.vueApp.use(VueSocialSharing)

const postId = computed(() => {
  return props.id.substring(props.id.indexOf('_') + 1)
})

async function skip() {
  await microVolunteeringStore.respond({
    facebook: props.id,
    response: 'Reject',
  })

  considerNext()
}

async function done() {
  await microVolunteeringStore.respond({
    facebook: props.id,
    response: 'Approve',
  })

  considerNext()
}

function considerNext() {
  emit('next')
}

function close() {
  // Called when the social sharing dialog is closed
  done()
}
</script>
