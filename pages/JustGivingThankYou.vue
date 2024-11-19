<template>
  <client-only v-if="me">
    <b-container fluid>
      <b-row class="m-0">
        <b-col cols="12" lg="6" offset-lg="3" class="bg-white">
          <h1>Thank you!</h1>
          <p>
            It's very kind of you to donate to us. We realise that there are a
            lot of charities asking for your help.
          </p>
          <p>
            We love to hear why people freegle, and this helps us get more
            people doing it. If you'd like to do that, click here:
          </p>
          <b-button variant="primary" to="/stories" class="mb-2"
            >Tell us your story</b-button
          >
          <p>
            If you'd like to support us more without it costing you a penny, you
            can use <b>Give As You Live</b> - when you shop online, they donate.
            Click
            <a href="https://www.giveasyoulive.com/join/freegle">here</a> to
            learn more.
          </p>
          <p>
            Freegle is run by volunteers - if you'd like to volunteer with us
            then drop us a line at
            <a href="mailto:volunteers@ilovefreegle.org"
              >volunteers@ilovefreegle.org</a
            >
            with a bit about yourself.
          </p>
          <p>
            But most importantly, keep freegling! The planet and your neighbours
            will be grateful.
          </p>
        </b-col>
      </b-row>
    </b-container>
  </client-only>
</template>
<script>
import { useAuthStore } from '~/stores/auth'
import { useDonationStore } from '~/stores/donations'

export default {
  components: {},
  async setup(props) {
    definePageMeta({
      layout: 'login',
    })

    const authStore = useAuthStore()
    const donationStore = useDonationStore()

    console.log(authStore.user)
    if (authStore.user?.id) {
      // We don't get detailed reporting from JustGiving, so record a zero-value donation here.  This will trigger
      // a Supporter button.  Obviously this would also allow non-donors to get the button if they were savvy enough,
      // but if you're looking at this code and thinking about that, just ask yourself what your mother would want you
      // to do.
      await donationStore.add(authStore.user.id, 0, new Date().toISOString())
    }

    return {
      authStore,
      donationStore,
    }
  },
}
</script>
