<template>
  <div
    class="chatMessageWrapper pb-1"
    :class="{ myChatMessage: messageIsFromCurrentUser }"
  >
    <div class="chatMessage forcebreak chatMessage__owner">
      <span v-if="!highlightEmails">
        <span v-if="messageIsNew" class="prewrap font-weight-bold">{{
          emessage
        }}</span>
        <span v-else class="preline forcebreak">{{ emessage }}</span>
        <b-img
          v-if="chatmessage?.image"
          fluid
          :src="chatmessage?.image.path"
          lazy
          rounded
        />
      </span>
      <span v-else>
        <span v-if="messageIsNew" class="font-weight-bold">
          <Highlighter
            :text-to-highlight="emessage"
            :search-words=searchwords
            highlight-class-name="highlight"
            class="prewrap"
          />
        </span>
        <span v-else>
          <Highlighter
            :text-to-highlight="emessage"
            :search-words=searchwords
            highlight-class-name="highlight"
            class="preline forcebreak"
          />
        </span>
        <b-img
          v-if="chatmessage?.image"
          fluid
          :src="chatmessage?.image.path"
          lazy
          rounded
        />
      </span>
    </div>
    <div class="chatMessageProfilePic">
      <ProfileImage
        :image="chatMessageProfileImage"
        class="ml-1 mb-1 mt-1 inline"
        is-thumbnail
        size="sm"
      />
    </div>
  </div>
</template>
<script>
import Highlighter from 'vue-highlight-words'
import ChatBase from '~/components/ChatBase'
import ProfileImage from '~/components/ProfileImage'

export default {
  components: {
    ProfileImage,
    Highlighter,
  },
  extends: ChatBase,
  computed: {
    messageIsNew() {
      return (
        this.chatmessage?.secondsago < 60 ||
        this.chatmessage?.id > this.chat?.lastmsgseen
      )
    },
    searchwords() { // :search-words validator needs string but regexEmail is RegExp
      // :search-words="[regexEmail]"
      // Could try :autoEscape="false"
      let sw = this.regexEmail.toString()
      if(sw.length>2) { sw = sw.substring(1,sw.length-1) }
      console.log('ChatMessageText: Fix Highlighter searchwords') // this.regexEmail.toString())
      // sw = `^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$`
      // sw = `(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))`
      // console.log(sw)
      return [sw]
      //return ["[ch]"]
    }
    
  },
}
</script>
