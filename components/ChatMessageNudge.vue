<template>
  <div>
    <b-row>
      <b-col>
        <div v-if="!otheruser || chatmessage.userid != me.id" class="media">
          <b-card border-variant="warning">
            <b-card-title>
              <h4><v-icon icon="bell" />&nbsp;You've been nudged!</h4>
            </b-card-title>
            <b-card-text>
              {{ otheruser ? otheruser.displayname : 'Someone' }} is waiting for
              you to reply.
            </b-card-text>
          </b-card>
        </div>
        <div v-else class="media float-end">
          <b-card border-variant="warning">
            <b-card-title>
              <h4><v-icon icon="bell" />&nbsp;You nudged them.</h4>
            </b-card-title>
          </b-card>
        </div>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import ChatBase from '~/components/ChatBase'

export default {
  extends: ChatBase,
}
</script>
