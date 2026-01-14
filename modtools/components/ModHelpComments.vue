<template>
  <NoticeMessage v-if="showHelp" variant="info" class="mt-2 mb-2">
    <b-button variant="white" class="float-end" @click="toggleHelp">
      Hide Help
    </b-button>
    <p>These are the notes for members on your communities, newest first.</p>
    <p>
      For GDPR reasons we should not keep notes older than three years unless
      they are still relevant. You can delete notes from here.
    </p>
    <p>Soon there will be:</p>
    <ul>
      <li>A button to "bump" the note</li>
      <li>
        A mail warning about notes which will be automatically deleted if not
        reviewed.
      </li>
    </ul>
    <p>...but they're not ready yet.</p>
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
