<template>
  <div>
    <b-modal
      id="donationaskmodal"
      v-model="showModal"
      scrollable
      :title="'Please help keep ' + groupName + ' running'"
      size="lg"
      no-stacking
    >
      <template #default>
        <div v-if="variant === 'video'">
          <DonationAskVideo
            :groupid="groupId"
            :groupname="groupName"
            :target="target"
            :raised="raised"
            :target-met="targetMet"
            @score="score"
          />
        </div>
        <div v-else-if="variant === 'quote'">
          <DonationAskQuote
            :groupid="groupId"
            :groupname="groupName"
            :target="target"
            :raised="raised"
            :target-met="targetMet"
            @score="score"
          />
        </div>
        <div v-else-if="variant === 'buttons2510'">
          <DonationAskButtons2510
            :groupid="groupId"
            :groupname="groupName"
            :target="target"
            :raised="raised"
            :target-met="targetMet"
            @score="score"
          />
        </div>
        <div v-else-if="variant === 'buttons51025'">
          <DonationAskButtons51025
            :groupid="groupId"
            :groupname="groupName"
            :target="target"
            :raised="raised"
            :target-met="targetMet"
            @score="score"
          />
        </div>
        <div v-else>
          <DonationAskWhatYouCan
            :groupname="groupName"
            :groupid="groupId"
            :target="target"
            :raised="raised"
            :target-met="targetMet"
            @score="score"
          />
        </div>
      </template>
      <template #footer>
        <b-button variant="secondary" @click="hide">Close</b-button>
      </template>
    </b-modal>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useGroupStore } from '~/stores/group'
import { useDonationStore } from '~/stores/donations'
import { useMiscStore } from '~/stores/misc'
import { useModal } from '~/composables/useModal'
import { useRuntimeConfig } from '#app'
import DonationAskVideo from '~/components/DonationAskVideo.vue'
import DonationAskQuote from '~/components/DonationAskQuote.vue'
import DonationAskButtons2510 from '~/components/DonationAskButtons2510.vue'
import DonationAskButtons51025 from '~/components/DonationAskButtons51025.vue'
import DonationAskWhatYouCan from '~/components/DonationAskWhatYouCan.vue'
import Api from '~/api'

const authStore = useAuthStore()
const groupStore = useGroupStore()
const donationStore = useDonationStore()
const miscStore = useMiscStore()
const runtimeConfig = useRuntimeConfig()
const api = Api(runtimeConfig)

const props = defineProps({
  requestedVariant: { type: String, default: '' },
})

const emit = defineEmits(['hide'])

const variant = ref(null)
const { showModal, hide } = useModal(emit)

const me = authStore.user
const groupId = ref(null)

const groupName = computed(() => {
  if (groupId.value && !targetMet.value) {
    return groupStore?.get(groupId.value)?.namedisplay
  } else {
    return 'Freegle'
  }
})

const { raised, target } = storeToRefs(donationStore)

const targetMet = computed(() => {
  return groupId.value && raised.value > target.value
})

function ask() {
  show(props.requestedVariant)

  miscStore.set({
    key: 'lastdonationask',
    value: new Date().getTime(),
  })
}

const lastAsk = miscStore.get('lastdonationask')
const canAsk =
  !lastAsk || new Date().getTime() - lastAsk > 60 * 60 * 1000 * 24 * 7

const { $bus } = useNuxtApp()
$bus.$on('outcome', (params) => {
  groupId.value = params.groupid
  const { outcome } = params

  if (outcome === 'Taken' || outcome === 'Received') {
    // If someone has set up a regular donation, then we don't ask them to donate again.  Wouldn't be fair to
    // pester them.

    if (!me?.donorrecurring && canAsk) {
      ask()
    }
  }
})

async function show(requestedVariant) {
  // We need to decide which variant of donation ask to show.
  variant.value = requestedVariant

  try {
    if (!requestedVariant) {
      requestedVariant = 'buttons1'

      requestedVariant = await api.bandit.choose({
        uid: 'donation',
      })

      if (requestedVariant) {
        variant.value = requestedVariant.variant
      }
    }
  } catch (e) {
    console.error('Get variant failed')
  }

  showModal.value = true

  // Record the show
  await api.bandit.shown({
    uid: 'donation',
    variant: variant.value,
  })
}

function score(value) {
  api.bandit.chosen({
    uid: 'donation',
    variant: variant.value,
    score: value,
  })
}
</script>
