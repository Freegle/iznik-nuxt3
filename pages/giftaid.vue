<template>
  <client-only v-if="me">
    <b-container fluid class="p-0 p-xl-2">
      <b-row class="m-0">
        <b-col cols="0" lg="3" class="d-none d-lg-block p-0 pr-1" />
        <b-col cols="12" lg="6" class="bg-white">
          <h1>Gift Aid for Freegle</h1>
          <p>
            Your kind donation will go even further if we can claim Gift Aid on
            it. Please fill out this form if you are able.
          </p>
          <div v-if="oldoptions">
            <label class="strong"> I'd like Freegle to claim Gift Aid: </label>
            <br />
            <OurToggle
              v-model="giftAidAllowed"
              :height="34"
              :width="150"
              :font-size="14"
              :sync="true"
              :labels="{ checked: 'Yes', unchecked: 'No' }"
              color="#61AE24"
              class="mt-3"
              @change="changeGiftAidToggle"
            />
            <br />
          </div>
          <div v-else>
            <label class="strong">
              I'd like Freegle to claim Gift Aid on my donation, and any
              donations I make in the future or have made in the past four
              years:
            </label>
            <br />
            <OurToggle
              v-model="giftAidAllowed"
              :height="34"
              :width="150"
              :font-size="14"
              :sync="true"
              :labels="{ checked: 'Yes', unchecked: 'No' }"
              color="#61AE24"
              class="mt-3"
              @change="changeGiftAidToggle"
            />
            <br />
          </div>
          <div v-if="giftAidAllowed">
            <b-form-group
              id="fullnamelabel"
              label="Your full (real) name"
              label-for="fullname"
              label-class="label"
            >
              <div
                v-if="
                  me &&
                  me.displayname &&
                  !fullname &&
                  me.displayname.indexOf(' ') !== -1
                "
              >
                <b-button
                  variant="secondary"
                  class="mb-2"
                  @click="fullname = me.displayname"
                >
                  Click here to use <strong>{{ me.displayname }}</strong>
                </b-button>
              </div>
              <b-form-input
                id="fullname"
                v-model="fullname"
                name="fullname"
                autocomplete="given-name"
                placeholder="Your full name"
                class="mb-3"
                :state="triedToSubmit ? !nameInvalid : null"
              />
            </b-form-group>
            <b-form-group
              id="homeaddresslabel"
              label="Your home postal address"
              label-for="homeaddress"
              label-class="label"
            >
              <div v-for="address in addresses" :key="'address-' + address.id">
                <div v-if="!homeaddress">
                  <b-button
                    variant="secondary"
                    class="mb-2"
                    @click="homeaddress = address.multiline"
                  >
                    Click here to use
                    <span class="font-weight-bold">{{
                      address.singleline
                    }}</span>
                  </b-button>
                </div>
              </div>
              <p><strong>Please make sure you include a postcode.</strong></p>
              <p v-if="emailByMistake" class="text-danger">
                This should be a postal address, not an email address.
              </p>
              <b-form-textarea
                id="homeaddress"
                v-model="homeaddress"
                rows="4"
                name="homeaddress"
                placeholder="Your home address"
                class="mb-3"
                :state="triedToSubmit ? !addressInvalid : null"
              />
            </b-form-group>
            <b-form-group
              v-if="oldoptions"
              id="periodlabel"
              label="This declaration covers"
              label-for="period"
              label-class="label"
            >
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
            </b-form-group>
            <b-form-checkbox v-model="marketingconsent" size="lg" class="mt-2">
              I'm happy for Freegle to keep in touch with me by email about the
              impact of my donation and other ways I can support Freegle in
              future campaigns (please tick box).
            </b-form-checkbox>
            <NoticeMessage class="info">
              By submitting this declaration I confirm that I am a UK taxpayer
              and understand that if I pay less Income Tax and/or Capital Gains
              Tax in the current tax year than the amount of Gift Aid claimed on
              all my donations it is my responsibility to pay any difference.
            </NoticeMessage>
          </div>
          <b-form-checkbox
            v-else
            v-model="marketingconsent"
            size="lg"
            class="mt-2"
          >
            I'm happy for Freegle to keep in touch with me by email about ways I
            can support Freegle in future campaigns (please tick box).
          </b-form-checkbox>
          <SpinButton
            icon-name="save"
            size="lg"
            variant="primary"
            label="Submit Gift Aid Declaration"
            class="mt-4"
            @handle="save"
          />
          <NoticeMessage v-if="saved" variant="primary" class="mt-2">
            Thank you. We have saved your Gift Aid Declaration. It's very kind
            of you to help keep Freegle going.
          </NoticeMessage>
          <hr />
          <div class="small mt-2">
            <p>Please return to this page and amend your details if you:</p>
            <ul>
              <li>Want to cancel this declaration</li>
              <li>Change your name or home address</li>
              <li>
                No longer pay sufficient tax on your income and/or capital
                gains.
              </li>
            </ul>
            <SpinButton
              v-if="valid"
              icon-name="trash-alt"
              size="lg"
              variant="white"
              label="Remove Gift Aid Consent"
              class="mt-2 mb-2"
              @handle="remove"
            />
          </div>
        </b-col>
        <b-col cols="0" lg="3" class="d-none d-lg-block p-0 pl-1" />
      </b-row>
    </b-container>
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
@import 'assets/css/_color-vars.scss';
:deep(.label) {
  font-weight: bold;
  color: $color-green--darker;
}

:deep(input[type='checkbox']) {
  border: 2px solid $color-red;
  border-radius: 4px;
}
</style>
