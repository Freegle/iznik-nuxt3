<template>
  <client-only>
    <div class="disclaimer">
      <h1 class="disclaimer__title">Disclaimer</h1>

      <div class="disclaimer__content">
        <section class="disclaimer__section">
          <div class="disclaimer__icon">
            <v-icon icon="info-circle" />
          </div>
          <div>
            <p>
              Freegle puts people who have unwanted items in touch with people
              who want those items. Because of how it works, Freegle never sees
              or checks items and they may not be in working order. Posting an
              advert or responding to an advert does not guarantee you will be
              able to get rid of unwanted items or get the items you want. Any
              agreement you reach about any items will be between the person
              requesting or advertising items and you.
            </p>
            <p>
              It is your responsibility to ensure you are not breaking any laws
              in offering or getting goods through Freegle. When something can
              be reused for its original purpose, freegling it is fine (it's
              what we're for!) but if it would legally count as waste (e.g. a
              mixture of low economic value which would require sorting), you
              must not freegle it. If in doubt, check
              <ExternalLink
                href="https://www.gov.uk/government/publications/legal-definition-of-waste-guidance/decide-if-a-material-is-waste-or-not#decide-if-your-material-is-waste"
                >here</ExternalLink
              >.
            </p>
          </div>
        </section>

        <section class="disclaimer__section">
          <div class="disclaimer__icon disclaimer__icon--safety">
            <v-icon icon="shield-alt" />
          </div>
          <div>
            <h2>Safety</h2>
            <p>
              Freeglers are lovely. But many of them will be people you've never
              met before. So please use common sense when posting to Freegle or
              collecting an item. For example:
            </p>
            <ol class="disclaimer__list">
              <li>
                Don't post in public on Freegle telling people when you're going
                to be out.
              </li>
              <li>
                Most collections occur at home, but if you're worried about
                that, arrange to meet in a cafe or other public place.
              </li>
              <li>
                Please ensure your property is physically safe for people who
                collect from you, as we all have a duty of care towards others.
              </li>
            </ol>
          </div>
        </section>

        <section class="disclaimer__section disclaimer__section--alert">
          <div class="disclaimer__icon disclaimer__icon--danger">
            <v-icon icon="exclamation-triangle" />
          </div>
          <div>
            <h2>Scams</h2>
            <p>
              Regrettably, occasionally online scammers target Freegle, often by
              offering high-value items, and then asking you to pay for courier
              charges. We catch a lot of these, and you never see them, but
              sometimes they sneak through.
            </p>
            <p>
              While some communities allow postage, you should never hand over
              money in advance. We don't recommend any specific courier (so if
              you see a message saying we do, it's a scam).
            </p>
            <p>
              If you are unlucky enough to be scammed, please report it to the
              <ExternalLink href="http://www.actionfraud.police.uk/"
                >Police</ExternalLink
              >, and <nuxt-link no-prefetch to="/help">to us</nuxt-link>.
            </p>
          </div>
        </section>
      </div>
    </div>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import ExternalLink from '~/components/ExternalLink.vue'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

useHead(
  buildHead(
    route,
    runtimeConfig,
    'Disclaimer',
    'What you need to know when using Freegle.'
  )
)
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.disclaimer {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;

  @include media-breakpoint-up(md) {
    padding: 2rem;
  }
}

.disclaimer__title {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  color: $colour-success-fg;
  margin-bottom: 1.5rem;

  @include media-breakpoint-up(md) {
    font-size: 2rem;
  }
}

.disclaimer__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.disclaimer__section {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: $gray-800;
  }

  p {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: $gray-700;
    margin-bottom: 0.75rem;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.disclaimer__section--alert {
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  border-left: 3px solid $danger;
}

.disclaimer__icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba($colour-success-fg, 0.1);
  color: $colour-success-fg;
  font-size: 1.25rem;

  &--safety {
    background: rgba($info, 0.1);
    color: $info;
  }

  &--danger {
    background: rgba($danger, 0.1);
    color: $danger;
  }
}

.disclaimer__list {
  padding-left: 1.25rem;
  margin: 0.75rem 0 0;

  li {
    padding: 0.375rem 0;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: $gray-700;
  }
}
</style>
