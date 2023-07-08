<template>
  <b-row class="m-0">
    <b-col cols="0" md="3" />
    <b-col cols="12" md="6" class="mt-2">
      <b-card no-body variant="success">
        <b-card-header>
          <h1>Help Freegle win funds to keep going!</h1>
        </b-card-header>
        <b-card-text class="p-2">
          <p>
            Please <b>make us your favourite charity</b> on PayPal Giving Fund
            and (if possible) donate £1 via the <b>Give At Checkout</b> scheme
            when paying for something online. PayPal will be matching donations
            at checkout from 15th July upto a total of £20,000 - so if you can
            donate, it'll get <b>doubled</b>.
          </p>
          <ExternalLink
            href="https://www.paypal.com/signin?returnUri=https%3A%2F%2Fwww.paypal.com%2Ffundraiser%2Fcharity%2F55681%3FsetPreferred%3Dtrue"
          >
            <b-button variant="primary" size="lg">
              Click here to set Freegle as your favourite charity
            </b-button>
          </ExternalLink>
          <p class="mt-2">
            <b
              >Log in to PayPal, if it asks, and then it should set Freegle as
              your favourite charity.</b
            >
          </p>
          <p>Once you <b>see the little red heart</b>, it's set correctly.</p>
          <p>
            <b>You don't have to donate here to set us as the favourite.</b>
          </p>
          <b-img lazy fluid src="/donate/PayPalFavourite.gif" />
          <p>
            Once you've done that, then next time you pay for something online
            using PayPal, you'll see Freegle as the charity to donate £1 to at
            checkout.
            <b
              >If you can afford it, please do so - PayPal will match your
              donation!</b
            >
          </p>
          <p class="mt-3">
            The PayPal page doesn't mention this competition but you can read
            more about it
            <ExternalLink
              href="https://newsroom.uk.paypal-corp.com/Help-a-small-charity-make-a-Big-Impact"
              >here</ExternalLink
            >
            and
            <ExternalLink
              href="https://www.linkedin.com/posts/paypalgivingfund_onetapbigimpact-activity-7082669493499392001-uIxm?utm_source=share&utm_medium=member_desktop"
              >here</ExternalLink
            >.
          </p>
          <p>
            If you don't see the option to set us as your favourite charity, you
            may be using a PayPal Business account - it only works for personal
            accounts.
          </p>
        </b-card-text>
      </b-card>
    </b-col>
  </b-row>
</template>
<script>
import { useRoute } from 'vue-router'
import ExternalLink from '~/components/ExternalLink'
import { buildHead } from '~/composables/useBuildHead'

export default {
  components: { ExternalLink },
  setup() {
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()

    useHead(
      buildHead(
        route,
        runtimeConfig,
        'PayPal Competition',
        'Help Freegle win much-needed funds!'
      )
    )
  },
}
</script>
