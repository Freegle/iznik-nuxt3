<template>
  <div>
    <b-row>
      <b-col>
        <b-card border-variant="warning">
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
