<template>
  <client-only v-if="me">
    <div class="giftaid-page">
      <div class="giftaid-page__content">
        <p class="giftaid-intro">
          Your kind donation will go even further if we can claim Gift Aid on
          it. Please fill out this form if you are able.
        </p>
        <div class="giftaid-toggle-section">
          <p v-if="oldoptions" class="giftaid-toggle-section__label">
            I'd like Freegle to claim Gift Aid:
          </p>
          <p v-else class="giftaid-toggle-section__label">
            I'd like Freegle to claim Gift Aid on my donation, and any donations
            I make in the future or have made in the past four years:
          </p>
          <OurToggle
            v-model="giftAidAllowed"
            :height="34"
            :width="150"
            :font-size="14"
            :sync="true"
            :labels="{ checked: 'Yes', unchecked: 'No' }"
            color="#61AE24"
            @change="changeGiftAidToggle"
          />
        </div>
        <div v-if="giftAidAllowed" class="giftaid-form">
          <div class="giftaid-form__section">
            <label class="giftaid-form__label" for="fullname">
              Your full (real) name
            </label>
            <b-button
              v-if="
                me &&
                me.displayname &&
                !fullname &&
                me.displayname.indexOf(' ') !== -1
              "
              variant="secondary"
              size="sm"
              class="giftaid-form__autofill"
              @click="fullname = me.displayname"
            >
              Use <strong>{{ me.displayname }}</strong>
            </b-button>
            <b-form-input
              id="fullname"
              v-model="fullname"
              name="fullname"
              autocomplete="given-name"
              placeholder="Your full name"
              :state="triedToSubmit ? !nameInvalid : null"
            />
          </div>
          <div class="giftaid-form__section">
            <label class="giftaid-form__label" for="homeaddress">
              Your home postal address
            </label>
            <div v-for="address in addresses" :key="'address-' + address.id">
              <b-button
                v-if="!homeaddress"
                variant="secondary"
                size="sm"
                class="giftaid-form__autofill"
                @click="homeaddress = address.multiline"
              >
                Use <strong>{{ address.singleline }}</strong>
              </b-button>
            </div>
            <p class="giftaid-form__hint">
              Please make sure you include a postcode.
            </p>
            <p v-if="emailByMistake" class="text-danger">
              This should be a postal address, not an email address.
            </p>
            <b-form-textarea
              id="homeaddress"
              v-model="homeaddress"
              rows="4"
              name="homeaddress"
              placeholder="Your home address"
              :state="triedToSubmit ? !addressInvalid : null"
            />
          </div>
          <div v-if="oldoptions" class="giftaid-form__section">
            <label class="giftaid-form__label">This declaration covers</label>
            <div class="giftaid-form__radios">
              <b-form-radio
                v-model="period"
                name="period"
                value="Past4YearsAndFuture"
              >
                This donation and any donations I make in the future or have
                made in the past four years
              </b-form-radio>
              <b-form-radio v-model="period" name="period" value="Since">
                All donations in the last five years
              </b-form-radio>
              <b-form-radio v-model="period" name="period" value="This">
                Just this donation
              </b-form-radio>
              <b-form-radio v-model="period" name="period" value="Future">
                This and all future donations
              </b-form-radio>
            </div>
          </div>
          <div class="giftaid-form__checkbox">
            <b-form-checkbox v-model="marketingconsent">
              I'm happy for Freegle to keep in touch with me by email about the
              impact of my donation and other ways I can support Freegle in
              future campaigns.
            </b-form-checkbox>
          </div>
          <NoticeMessage variant="info" class="giftaid-form__notice">
            By submitting this declaration I confirm that I am a UK taxpayer and
            understand that if I pay less Income Tax and/or Capital Gains Tax in
            the current tax year than the amount of Gift Aid claimed on all my
            donations it is my responsibility to pay any difference.
          </NoticeMessage>
        </div>
        <div v-else class="giftaid-form__checkbox">
          <b-form-checkbox v-model="marketingconsent">
            I'm happy for Freegle to keep in touch with me by email about ways I
            can support Freegle in future campaigns.
          </b-form-checkbox>
        </div>
        <SpinButton
          icon-name="save"
          size="lg"
          variant="primary"
          label="Submit Gift Aid Declaration"
          class="mt-4"
          @handle="save"
        />
        <NoticeMessage v-if="saved" variant="primary" class="mt-2">
          Thank you. We have saved your Gift Aid Declaration. It's very kind of
          you to help keep Freegle going.
        </NoticeMessage>
        <div class="giftaid-footer">
          <p>Please return to this page and amend your details if you:</p>
          <ul>
            <li>Want to cancel this declaration</li>
            <li>Change your name or home address</li>
            <li>
              No longer pay sufficient tax on your income and/or capital gains.
            </li>
          </ul>
          <SpinButton
            v-if="valid"
            icon-name="trash-alt"
            variant="white"
            label="Remove Gift Aid Consent"
            @handle="remove"
          />
        </div>
      </div>
    </div>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { useAddressStore } from '~/stores/address'
import { useGiftAidStore } from '~/stores/giftaid'
import { useAuthStore } from '~/stores/auth'
import { useMe } from '~/composables/useMe'
import SpinButton from '~/components/SpinButton'
import NoticeMessage from '~/components/NoticeMessage'
import { buildHead } from '~/composables/useBuildHead'
import OurToggle from '~/components/OurToggle'
import {
  ref,
  computed,
  watch,
  onMounted,
  definePageMeta,
  useHead,
  useRuntimeConfig,
} from '#imports'

definePageMeta({
  layout: 'login',
})

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

useHead(
  buildHead(
    route,
    runtimeConfig,
    'Gift Aid',
    'Add gift aid to your donation to Freegle'
  )
)

const addressStore = useAddressStore()
const giftAidStore = useGiftAidStore()
const authStore = useAuthStore()
const { me } = useMe()

const triedToSubmit = ref(false)
const saved = ref(false)
const marketingconsent = ref(false)
const fetchingGiftAid = ref(false)
const giftAidFetched = ref(false)

const addresses = computed(() => addressStore.addresses)
const giftaid = computed(() => giftAidStore.giftaid)

const period = computed({
  get: () =>
    giftAidStore.giftaid.period
      ? giftAidStore.giftaid.period
      : 'Past4YearsAndFuture',
  set: (value) => {
    giftAidStore.giftaid.period = value
  },
})

const fullname = computed({
  get: () => giftAidStore.giftaid?.fullname,
  set: (value) => (giftAidStore.giftaid.fullname = value),
})

const homeaddress = computed({
  get: () => giftAidStore.giftaid?.homeaddress,
  set: (value) => (giftAidStore.giftaid.homeaddress = value),
})

const emailByMistake = computed(() => {
  return homeaddress.value?.includes('@')
})

const giftAidAllowed = computed({
  get() {
    return period.value !== 'Declined'
  },
  set(newValue) {
    if (!newValue) {
      period.value = 'Declined'
    } else {
      period.value = 'Past4YearsAndFuture'
    }
  },
})

const oldoptions = computed(() => {
  let oldoptions = false

  if (
    period.value === 'Since' ||
    period.value === 'This' ||
    period.value === 'Future'
  ) {
    // Older gift aid options from a previous declaration.
    oldoptions = true
  }

  return oldoptions
})

const valid = computed(() => {
  return (
    !giftAidAllowed.value ||
    (period.value &&
      fullname.value &&
      homeaddress.value &&
      !emailByMistake.value)
  )
})

const nameInvalid = computed(() => {
  return !fullname.value || !fullname.value.includes(' ')
})

const addressInvalid = computed(() => {
  return !homeaddress.value || !homeaddress.value.includes(' ')
})

const fetchGiftAidData = async () => {
  // Only fetch if we have a user and valid auth tokens
  if (!me.value) {
    return
  }

  if (!authStore.auth.jwt && !authStore.auth.persistent) {
    console.log('No auth tokens yet, waiting...')
    return
  }

  // Prevent duplicate fetches
  if (fetchingGiftAid.value || giftAidFetched.value) {
    return
  }

  fetchingGiftAid.value = true

  try {
    await addressStore.fetch()
    await giftAidStore.fetch()

    if (!period.value) {
      // We fetched no gift aid info so set it to the default.
      giftaid.value.period = giftAidAllowed.value
        ? 'Past4YearsAndFuture'
        : 'Declined'
    }

    marketingconsent.value = me.value.marketingconsent
    giftAidFetched.value = true
  } catch (e) {
    console.log('Error fetching gift aid data', e)
  } finally {
    fetchingGiftAid.value = false
  }
}

// Fetch gift aid data on mount (after auth has been validated by layout)
onMounted(async () => {
  if (me.value) {
    await fetchGiftAidData()
  }
})

// Watch for subsequent login events
watch(me, async (newVal, oldVal) => {
  if (newVal && !oldVal) {
    await fetchGiftAidData()
  }
})

// Also watch auth tokens in case they're set after the user
watch(
  () => authStore.auth,
  async (newAuth) => {
    if (me.value && (newAuth.jwt || newAuth.persistent)) {
      // User exists and we now have valid tokens, try fetching again
      await fetchGiftAidData()
    }
  },
  { deep: true }
)

watch(marketingconsent, async (newVal) => {
  await authStore.saveAndGet({
    marketingconsent: newVal,
  })
})

async function save(callback) {
  triedToSubmit.value = true

  if (!valid.value) {
    callback()
    return
  }

  if (!giftAidStore.giftaid.period) {
    giftAidStore.giftaid.period = 'Past4YearsAndFuture'
  }

  if (!giftAidAllowed.value) {
    // We might need to fake up some values that the server expects.
    if (!fullname.value) {
      giftAidStore.giftaid.fullname = me.value.displayname
    }

    if (!homeaddress.value) {
      giftAidStore.giftaid.homeaddress = 'N/A'
    }
  }

  await giftAidStore.save()
  saved.value = true
  callback()
}

async function remove(callback) {
  await giftAidStore.remove()
  period.value = 'Past4YearsAndFuture'
  fullname.value = null
  homeaddress.value = null
  callback()
}

function changeGiftAidToggle(val) {
  if (val.value) {
    period.value = 'Since'
  } else {
    period.value = 'Declined'
  }
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.giftaid-page {
  background: $color-gray--lighter;
  min-height: 100vh;
  padding: 1rem;

  @include media-breakpoint-up(md) {
    padding: 1.5rem;
  }
}

.giftaid-page__content {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.giftaid-intro {
  font-size: 0.95rem;
  color: $gray-700;
  margin-bottom: 1.5rem;
}

.giftaid-toggle-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid $gray-200;

  &__label {
    font-weight: 600;
    color: $gray-800;
    margin-bottom: 0.75rem;
  }
}

.giftaid-form {
  &__section {
    margin-bottom: 1.25rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid $gray-200;

    &:last-of-type {
      border-bottom: none;
    }
  }

  &__label {
    display: block;
    font-weight: 600;
    color: $color-green--darker;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
  }

  &__autofill {
    margin-bottom: 0.5rem;
  }

  &__hint {
    font-size: 0.875rem;
    color: $gray-600;
    margin-bottom: 0.5rem;
  }

  &__radios {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__checkbox {
    margin: 1rem 0;
    font-size: 0.9rem;

    :deep(.form-check-label) {
      font-size: 0.9rem;
      color: $gray-700;
    }
  }

  &__notice {
    margin-top: 1rem;
  }
}

.giftaid-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid $gray-200;
  font-size: 0.875rem;
  color: $gray-600;

  p {
    margin-bottom: 0.5rem;
  }

  ul {
    margin-bottom: 1rem;
    padding-left: 1.25rem;
  }

  li {
    margin-bottom: 0.25rem;
  }
}
</style>
