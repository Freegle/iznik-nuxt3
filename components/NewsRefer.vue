<template>
  <div>
    <notice-message v-if="type === 'ReferToOffer'">
      <p>If you're giving away something, then please:</p>
      <b-button variant="primary" to="/give" class="mb-1">
        Post an OFFER
      </b-button>
      <p>
        We'll tell more people about that, so you'll get a better response. This
        section is just for chat and recommendations.
      </p>
    </notice-message>
    <notice-message v-if="type === 'ReferToWanted'">
      <p>If you're looking for an item, then please:</p>
      <b-button variant="primary" to="/find" class="mb-1">
        Post a WANTED
      </b-button>
      <p>
        We'll tell more people about that, so you'll get a better response. This
        section is just for chat and recommendations.
      </p>
    </notice-message>
    <notice-message v-if="type === 'ReferToTaken'">
      <p>
        If your item has been taken, please go to My Posts, click on the item,
        and use the button to <strong>Mark as TAKEN</strong>.
      </p>
      <b-button variant="primary" to="/myposts" class="mb-1">
        Go to My Posts
      </b-button>
    </notice-message>
    <notice-message v-if="type === 'ReferToReceived'">
      <p>
        If you've got what you were looking for, please go to My Posts, click on
        the item, and use the button to <strong>Mark as RECEIVED</strong>.
      </p>
      <b-button variant="primary" to="/myposts" class="mb-1">
        Go to My Posts
      </b-button>
    </notice-message>
    <div v-if="supportOrAdmin" class="d-flex justify-content-end">
      <b-button variant="link" class="reply__button" @click="deleteReply">
        Delete
      </b-button>
      <ConfirmModal
        v-if="showDeleteModal"
        ref="deleteConfirm"
        title="Delete refer from"
        @confirm="deleteConfirm"
      />
    </div>
  </div>
</template>
<script>
import { useNewsfeedStore } from '../stores/newsfeed'
import NoticeMessage from './NoticeMessage'
const ConfirmModal = () => import('~/components/ConfirmModal.vue')

export default {
  components: { NoticeMessage, ConfirmModal },
  props: {
    id: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    threadhead: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const newsfeedStore = useNewsfeedStore()

    return {
      newsfeedStore,
    }
  },
  data() {
    return {
      showDeleteModal: false,
    }
  },
  methods: {
    deleteReply() {
      this.showDeleteModal = true
      this.waitForRef('deleteConfirm', () => {
        this.$refs.deleteConfirm.show()
      })
    },
    async deleteConfirm() {
      await this.newsfeedStore.delete(this.id, this.threadhead)
    },
  },
}
</script>
<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

.reply__button {
  margin-left: 3px;
  margin-right: 3px;
}
</style>
