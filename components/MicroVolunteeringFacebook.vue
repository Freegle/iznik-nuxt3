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
<script>
import { useMicroVolunteeringStore } from '../stores/microvolunteering'

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup() {
    const microVolunteeringStore = useMicroVolunteeringStore()

    return {
      microVolunteeringStore,
    }
  },
  computed: {
    postId() {
      return this.id.substring(this.id.indexOf('_') + 1)
    },
  },
  methods: {
    async skip() {
      await this.microVolunteeringStore.respond({
        facebook: this.id,
        response: 'Reject',
      })

      this.considerNext()
    },
    async done() {
      await this.microVolunteeringStore.respond({
        facebook: this.id,
        response: 'Approve',
      })

      this.considerNext()
    },
  },
}
</script>
