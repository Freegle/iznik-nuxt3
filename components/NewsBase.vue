<template>
  <div />
</template>
<script>
import { useNewsfeedStore } from '../stores/newsfeed'
import { useUserStore } from '../stores/user'
import { twem } from '~/composables/useTwem'
import { URL_REGEX } from '~/constants'

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
      let ret = this.newsfeed.message ? twem(this.newsfeed.message) : null

      if (ret) {
        // Remove leading spaces/tabs.
        let regExp = /^[\t ]+/gm
        ret = ret.replace(regExp, '')

        // Remove duplicate blank lines.
        const EOL = ret.match(/\r\n/gm) ? '\r\n' : '\n'
        regExp = new RegExp('(' + EOL + '){3,}', 'gm')
        ret = ret.replace(regExp, EOL + EOL)
      }

      if (this.newsfeed.type === 'Alert') {
        // Make links clickable.
        ret = ret.replace(URL_REGEX, '<a href="$1" target="_blank">$1</a>')
      }

      return ret
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
