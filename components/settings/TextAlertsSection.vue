<template>
  <b-card
    border-variant="info"
    header-bg-variant="info"
    header-text-variant="white"
    class="mt-2"
    no-body
  >
    <template #header>
      <h2 class="bg-info header--size5 mb-0">
        <v-icon icon="bell" />
        Text Alerts
      </h2>
    </template>
    <b-card-body class="p-0 pl-3 pr-3 pt-3">
      <p>
        We can send SMS alerts to your phone when you have a new message on
        Freegle or a handover soon.
      </p>
      <SettingsPhone class="mb-3" />
      <div v-if="me?.phone">
        <NoticeMessage
          v-if="!notificationSettings.email"
          variant="warning"
          class="mb-2"
        >
          Email notifications must be turned on for SMS alerts to be sent.
        </NoticeMessage>
        <NoticeMessage
          v-else-if="
            me.phonelastsent &&
            (!me.phonelastclicked || me.phonelastclicked < me.phonelastsent)
          "
          variant="warning"
          class="mb-2"
        >
          <p>
            We've stopped sending you SMS alerts, because you don't seem to be
            clicking on them. We do this to save Freegle money.
          </p>
          <ul>
            <li>
              If you don't want to get SMS alerts, please click
              <em>Remove</em> above to remove your number.
            </li>
            <li>
              If you do still want to receive SMS alerts again, please remove
              and re-add your mobile number, and we'll start again.
            </li>
          </ul>
          <p>It costs Freegle to send these - if you can, please:</p>
          <donation-button />
        </NoticeMessage>
        <NoticeMessage v-else variant="warning" class="mb-2">
          <p>It costs Freegle to send these - if you can, please:</p>
          <donation-button />
        </NoticeMessage>
      </div>
    </b-card-body>
  </b-card>
</template>

<script setup>
import { computed } from 'vue'
import { useMe } from '../../composables/useMe'
import SettingsPhone from '~/components/SettingsPhone'
import NoticeMessage from '~/components/NoticeMessage'
import DonationButton from '~/components/DonationButton'

const { me } = useMe()

const notificationSettings = computed(() => {
  const ret = {
    email: true,
    emailmine: false,
    push: true,
    facebook: true,
    app: true,
  }

  const settings = me.value?.settings?.notifications

  if (settings) {
    if ('email' in settings) {
      ret.email = settings.email
    }
    if ('emailmine' in settings) {
      ret.emailmine = settings.emailmine
    }
    if ('push' in settings) {
      ret.push = settings.push
    }
    if ('facebook' in settings) {
      ret.facebook = settings.facebook
    }
    if ('app' in settings) {
      ret.app = settings.app
    }
  }

  return ret
})
</script>
