<template>
  <div />
</template>
<script>
import { useNewsfeedStore } from '../stores/newsfeed'
import { useUserStore } from '../stores/user'
import { twem } from '~/composables/useTwem'

export default {
  components: {},
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      replyingTo: null,
      threadcomment: null,
      showNewsPhotoModal: false,
      showNewsShareModal: false,
    }
  },
  computed: {
    emessage() {
      return this.newsfeed.message ? twem(this.newsfeed.message) : null
    },
    newsfeed() {
      const newsfeedStore = useNewsfeedStore()
      return newsfeedStore.byId(this.id)
    },
    userid() {
      return this.newsfeed?.userid
    },
    user() {
      const userStore = useUserStore()
      return userStore.byId(this.userid)
    },
  },
  methods: {
    brokenImage(event) {
      event.target.src = '/defaultprofile.png'
    },
    share() {
      this.showNewsShareModal = true
    },
    showPhotoModal() {
      this.showNewsPhotoModal = true
    },
  },
}
</script>
