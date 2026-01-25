<template>
  <div>
    <NoticeMessage
      v-for="word in message.worry"
      :key="'worry-' + message.id + '-' + word.worryword.id"
      variant="warning"
      class="mb-1"
    >
      <p>
        Flagged for review: "<span class="text-danger font-weight-bold">{{
          word.worryword.keyword
        }}</span
        >".
        <b-button
          v-if="!expand"
          variant="link"
          class="p-0 align-top"
          @click="expand = true"
        >
          Click for more info
        </b-button>
        <b-button
          v-else
          variant="link"
          class="p-0 align-top"
          @click="expand = false"
        >
          Hide more info
        </b-button>
      </p>
      <div v-if="expand">
        <p v-if="word.worryword.type === 'Review'">
          This post contains a keyword which means it's flagged up for review.
          If you can't see anything wrong with it, then it's fine.
        </p>
        <p v-if="word.worryword.type === 'Regulated'">
          This post looks as though it might contain a regulated substance.
          These are not legal on Freegle. If in doubt please check on
          <ExternalLink href="https://discourse.ilovefreegle.org/">
            Central
          </ExternalLink>
          first.
        </p>
        <p v-if="word.worryword.type === 'Reportable'">
          This post looks as though it might contain a reportable substance.
          These may need to be reported to the police. Please ask the member
          about it to see what their reason is, and if in doubt discuss on
          <ExternalLink href="https://discourse.ilovefreegle.org/">
            Central </ExternalLink
          >.
        </p>
        <p v-if="word.worryword.type === 'Medicine'">
          This post looks as though it might contain a drug, medicine or
          supplement. These are not legal on Freegle. Please do not approve this
          without checking on
          <ExternalLink href="https://discourse.ilovefreegle.org/">
            Central
          </ExternalLink>
          first.
        </p>
        <p>
          You can find more information
          <ExternalLink href="https://wiki.ilovefreegle.org/Worry_Words">
            here </ExternalLink
          >.
        </p>
      </div>
    </NoticeMessage>
  </div>
</template>
<script>
export default {
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  data: function () {
    return {
      expand: false,
    }
  },
}
</script>
