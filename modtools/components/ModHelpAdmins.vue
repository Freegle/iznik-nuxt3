<template>
  <NoticeMessage v-if="showHelp" variant="info" class="mt-2 mb-2">
    <b-button variant="white" class="float-end" @click="toggleHelp">
      Hide Help
    </b-button>
    <p>
      ADMINs are sent to everyone on your group, no matter what their mail
      settings are, including members flagged as bouncing.
    </p>
    <p>
      Sometimes you will see centrally suggested ADMINs here for you to
      edit/approve/reject as you choose.
    </p>
    <p>
      Read more about ADMINs
      <!-- eslint-disable-next-line -->
      <ExternalLink href="https://wiki.ilovefreegle.org/Admins">on the wiki</ExternalLink>.
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
