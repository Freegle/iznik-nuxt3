<template>
  <NoticeMessage v-if="showHelp" variant="info" class="mt-2 mb-2">
    <b-button variant="white" class="float-end" @click="toggleHelp">
      Hide Help
    </b-button>
    <p>
      This is the information we get when people mark items as TAKEN or
      RECEIVED. They can add comments, and if they're on the site they might
      click a happy/neutral/unhappy face to indicate how they're feeling.
    </p>
    <p>
      You might like to reply to the people who are unhappy. Often just replying
      to them will make them feel better, even if you can't solve what they're
      unhappy about (for example if another freegler has let them down).
    </p>
    <p>
      Not everyone is unhappy! We just show you those by default because they're
      the ones where you're most likely to want to do something. You can use the
      dropdown filter to view the others.
    </p>
  </NoticeMessage>
  <b-button v-else variant="link" class="float-end pt-0" @click="toggleHelp">
    Help
  </b-button>
</template>
<script setup>
import { useHelpBox } from '~/composables/useHelpBox'

const { hide, toggleHelp, showHelp } = useHelpBox()

const id = ref('feedback')

onMounted(() => {
  hide()
})
</script>
