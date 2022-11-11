<template>
  <div>
    <b-row class="pb-1">
      <b-col>
        <div v-if="chatmessage.userid != myid" class="media">
          <div v-if="!refmsg">
            This chat message refers to a post which has been deleted.
          </div>
          <b-card v-else border-variant="warning" class="ml-2">
            <b-card-title>
              <b-img
                v-if="refmsg?.attachments?.length > 0"
                class="float-end"
                rounded
                thumbnail
                generator-unable-to-provide-required-alt=""
                lazy
                :src="refmsg.attachments[0].paththumb"
                width="70px"
                @error="brokenImage"
              />
              <ProfileImage
                :image="otheruser.profile.paththumb"
                class="mr-1 mb-1 mt-1 inline"
                is-thumbnail
                size="sm"
              />
              <span class="small black"
                >Sorry...this is no longer promised to you:</span
              >
              <br />
              <h4>
                {{ refmsg.subject }}
              </h4>
            </b-card-title>
            <b-card-text>
              <div :class="emessage ? 'media-body chatMessage' : 'media-body'">
                <span>
                  <span
                    v-if="
                      chatmessage.secondsago < 60 ||
                      chatmessage.id > chat.lastmsgseen
                    "
                    class="prewrap font-weight-bold"
                    >{{ emessage }}</span
                  >
                  <span v-else class="preline forcebreak">{{ emessage }}</span>
                  <b-img
                    v-if="chatmessage.image"
                    fluid
                    :src="chatmessage.image.path"
                    lazy
                    rounded
                  />
                </span>
              </div>
            </b-card-text>
          </b-card>
        </div>
        <div v-else class="media float-end">
          <div v-if="!refmsg">
            This chat message refers to a post which has been deleted.
          </div>
          <b-card v-else border-variant="warning">
            <b-card-title>
              <b-img
                v-if="
                  refmsg && refmsg.attachments && refmsg.attachments.length > 0
                "
                class="float-end"
                rounded
                thumbnail
                generator-unable-to-provide-required-alt=""
                lazy
                :src="refmsg.attachments[0].paththumb"
                width="70px"
                @error="brokenImage"
              />
              <ProfileImage
                :image="me.profile.path"
                class="mr-1 mb-1 mt-1 inline"
                is-thumbnail
                size="sm"
              />
              <span class="small black"
                >You cancelled your promise to
                <strong>{{ otheruser.displayname }}</strong> for:</span
              >
              <br />
              <h4>
                {{ refmsg.subject }}
              </h4>
            </b-card-title>
            <b-card-text>
              <div :class="emessage ? 'media-body chatMessage' : 'media-body'">
                <span>
                  <span
                    v-if="
                      chatmessage.secondsago < 60 ||
                      chatmessage.id > chat.lastmsgseen
                    "
                    class="prewrap font-weight-bold"
                    >{{ emessage }}</span
                  >
                  <span v-else class="preline forcebreak">{{ emessage }}</span>
                  <b-img
                    v-if="chatmessage.image"
                    fluid
                    :src="chatmessage.image.path"
                    lazy
                    rounded
                  />
                </span>
              </div>
            </b-card-text>
          </b-card>
        </div>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import { fetchReferencedMessage } from '../composables/useChat'
import ChatBase from '~/components/ChatBase'
import ProfileImage from '~/components/ProfileImage'

export default {
  components: {
    ProfileImage,
  },
  extends: ChatBase,
  async setup(props) {
    await fetchReferencedMessage(props.chatid, props.id)
  },
}
</script>
