<template>
  <NoticeMessage v-if="showHelp" variant="info" class="mt-2 mb-2">
    <b-button variant="white" class="float-end" @click="toggleHelp">
      Hide Help
    </b-button>
    <p>
      Spammer reports are reviewed before a member appears on the list. Once
      someone is on this list, they will automatically be removed from
      communities unless you've disabled that in Settings. If you think someone
      is on this list wrongly, you can request that they be removed using the
      button below.
    </p>
    <p>
      Safelisted people are those who have good reasons to join many groups, who
      we flag up so that you don't accidentally think they're spammers.
    </p>
    <p>
      <!-- eslint-disable-next-line-->
      Read more <ExternalLink href="https://wiki.ilovefreegle.org/Spammers">on the wiki</ExternalLink>.
    </p>
  </NoticeMessage>
  <b-button v-else variant="link" class="float-end pt-0" @click="toggleHelp">
    Help
  </b-button>
</template>
<script setup>
import { useHelpBox } from '~/composables/useHelpBox'

const { hide, toggleHelp, showHelp } = useHelpBox()

onMounted(() => {
  hide()
})
</script>
