<template>
  <NoticeMessage v-if="showHelp" variant="info" class="mt-2 mb-2">
    <b-button variant="white" class="float-end" @click="toggleHelp">
      Hide Help
    </b-button>
    <p>
      We have some automated checks that spot unusual member behaviour.
      Sometimes these will be people who are spammers/scammers, sometimes they
      may be overenthusiastic members who need a bit of guidance, and sometimes
      they may just be perfectly good members who just happen to be caught in
      the net.
    </p>
    <p>
      Please review their posting history and logs. There is no national rule
      about how many groups it is reasonable for one person to join, that is up
      to group discretion. Please don't ban a multijoiner unless you have clear
      evidence of 'wrongdoing'.
    </p>
    <p>You may or may not want to do something about them on your group:</p>
    <ul>
      <li>
        You can ignore them until they join other groups or something else
        unusual happens.
      </li>
      <li>You can remove them from a group.</li>
      <li>
        To report them as a spammer, add a note, or other things, click the link
        to go to their membership on your group.
      </li>
    </ul>
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
