<template>
  <div>
    <b-row>
      <b-col>
        <b-card v-if="!modtools" border-variant="warning">
          <b-card-title>
            <h4>
              <v-icon icon="exclamation-triangle" scale="2" />&nbsp;You reported
              someone
            </h4>
          </b-card-title>
          <b-card-text>
            This has been passed to our volunteers, who will get back to you
            soon.
          </b-card-text>
        </b-card>
        <b-card v-else border-variant="warning">
          <b-card-title>
            <h4 v-if="otheruser">
              <v-icon icon="exclamation-triangle" scale="2" />&nbsp;{{
                otheruser?.displayname
              }}
              reported someone
            </h4>
          </b-card-title>
          <b-card-text>
            {{ emessage }}
            <ModChatViewButton
              :id="chatmessage.refchatid"
              class="mt-2"
              :pov="chatmessage.userid"
            />
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import { useMiscStore } from '../stores/misc'
import ChatBase from '~/components/ChatBase'

export default {
  extends: ChatBase,
  computed: {
    modtools() {
      const miscStore = useMiscStore()
      return miscStore.modtools
    },
  },
}
</script>
