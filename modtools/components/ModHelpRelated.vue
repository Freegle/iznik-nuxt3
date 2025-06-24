<template>
  <NoticeMessage v-if="showHelp" variant="info" class="mt-2 mb-2">
    <b-button variant="white" class="float-end" @click="toggleHelp">
      Hide Help
    </b-button>
    <p>
      These are members who have
      <strong>used the same device for different members</strong>. By merging
      members who are really the same person, we can help them avoid confusion
      and missing messages - which results in fewer support requests to you!
    </p>
    <p>
      It suggests they're probably the same person if they have a similar name
      or email, and:
    </p>
    <ul>
      <li>they have groups in common, or</li>
      <li>they are both active on the same device on the same day</li>
    </ul>
    <p>
      If you don't think they're probably the same person, then click
      <em>Ignore</em>.
    </p>
    <p>
      If you think they're probably the same person, you can ask them what they
      want to do. This will send them a mail like this:
    </p>
    <div style="font-style: italic; padding-left: 1rem">
      <p>
        We think you might have two separate accounts on Freegle, perhaps by
        mistake?
      </p>
      <p>
        Name1 (email1)<br />
        Name2 (email2)
      </p>
      <p>
        If these are both you, then you might miss replies or see other
        confusing things. Shall we combine them for you? If you don't recognise
        one of them, just ignore this email.
      </p>
      <b-button variant="primary" disabled class="mb-2">
        Click here to let us know
      </b-button>
    </div>
    <p>The email addresses are masked out a bit for privacy.</p>
    <p>
      This takes them to a page where they can merge the accounts and decide
      which email address they prefer to use, or leave the two accounts
      separate.
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
