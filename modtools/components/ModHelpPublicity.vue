<template>
  <NoticeMessage v-if="showHelp" variant="info" class="mt-2 mb-2">
    <b-button variant="white" class="float-end" @click="toggleHelp">
      Hide Help
    </b-button>
    <p>
      These are actions you can take to promote your group. For example, you
      will see social media posts which you might like to share to your
      communities' Facebook pages.
    </p>
    <p>
      You don't have to use Facebook yourself to do this. The share to Facebook
      will happen magically on the servers if you click the share buttons below.
    </p>
    <p>
      If you don't want to share a particular item, share any others that you
      do, then click the <em>Hide </em> or <em>Hide All</em>
      button. This will hide it for all mods on this community.
    </p>
    <p>
      We can't do this automatically - as per
      <!-- eslint-disable-next-line -->
      <ExternalLink href="https://developers.facebook.com/docs/facebook-login/permissions#reference-manage_pages">Facebook's guidelines</ExternalLink>
      you need to explicitly decide to publish content on pages that you manage.
    </p>
    <p>
      Read about more ways to promote your group on the wiki
      <!-- eslint-disable-next-line -->
      <ExternalLink href="https://wiki.ilovefreegle.org/Publicity">here</ExternalLink> and
      <ExternalLink href="https://wiki.ilovefreegle.org/Promotion">
        here </ExternalLink
      >.
    </p>
  </NoticeMessage>
  <b-button v-else variant="link" class="float-end pt-0" @click="toggleHelp">
    Help
  </b-button>
</template>
<script setup>
import { useHelpBox } from '~/composables/useHelpBox'

const { hide, toggleHelp, showHelp } = useHelpBox()

const id = ref('publicity')

onMounted(() => {
  hide()
})
</script>
