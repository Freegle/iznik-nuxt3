<template>
  <NoticeMessage v-if="showHelp" variant="info" class="mt-2 mb-2">
    <b-button variant="white" class="float-end" @click="toggleHelp">
      Hide Help
    </b-button>
    <p>
      These are people who have completed gift aid declarations which have not
      yet been reviewed.
    </p>
    <p>Please check the name, address and postcode:</p>
    <ul>
      <li>
        If it looks fine, then click <em>Looks Good</em>. We will then correlate
        this with their donations, and use that information later when
        submitting a Gift Aid claim.
      </li>
      <li>
        It'll try to identify the postcode. If it's not found it, see if you can
        figure it out. If the name or address is wrong but in an obvious way,
        please fix it. Then click <em>Save Changes</em>, and if you're happy
        with it, <em>Looks Good</em>
      </li>
      <li>
        If it's missing key information, then please click on their email
        address and ask them to provide it. You can then do the correction here.
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
