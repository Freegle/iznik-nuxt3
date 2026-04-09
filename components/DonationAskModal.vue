<template>
  <b-modal
    ref="modal"
    :title="''"
    hide-header
    hide-footer
    size="lg"
    no-stacking
    body-class="p-3 bg-transparent overflow-visible"
    content-class="bg-transparent border-0"
    modal-class="donation-modal-stripe"
    @show="logOpen"
  >
    <template #default>
      <div v-if="thankyou">
        <DonationThank />
      </div>
      <div v-else>
        <div v-if="variant === 'rateapp'">
          <RateAppAsk @hide="hide" />
        </div>
        <div v-else class="bg-white rounded p-3">
          <p v-if="donated" class="mb-3">
            You've already donated to Freegle (on {{ donated }}). Thank you.
          </p>
          <DonationAskStripe
            :groupid="groupId"
            :groupname="groupName"
            :target="target"
            :raised="raised"
            :target-met="targetMet"
            :donated="donated"
            :amounts="[1, 5, 10]"
            :default="1"
            @score="score"
            @success="thankyou = true"
            @cancel="hide"
          />
        </div>
      </div>
    </template>
  </b-modal>
</template>
<script setup>
import { storeToRefs } from 'pinia'
import { useOurModal } from '~/composables/useOurModal'
import DonationAskStripe from '~/components/DonationAskStripe.vue'
import { useDonationAskModal } from '~/composables/useDonationAskModal'
import { useGroupStore } from '~/stores/group'
import { useDonationStore } from '~/stores/donations'
import Api from '~/api'
import { useAuthStore } from '~/stores/auth'
import { dateshort } from '~/composables/useTimeFormat'
import { action } from '~/composables/useClientLog'
import RateAppAsk from '~/components/RateAppAsk.vue'

const groupStore = useGroupStore()
const donationStore = useDonationStore()
const authStore = useAuthStore()

const thankyou = ref(false)
const openedAt = ref(null)
const engagedLogged = ref(false)
let engagedTimer = null

const { modal, hide: rawHide } = useOurModal()
const { variant, groupId, show } = await useDonationAskModal()

function logOpen() {
  openedAt.value = Date.now()
  engagedLogged.value = false

  action('donation_modal_open', {
    variant: variant.value,
    groupId: groupId.value,
  })

  engagedTimer = setTimeout(() => {
    if (openedAt.value) {
      engagedLogged.value = true
      action('donation_modal_engaged', {
        variant: variant.value,
        groupId: groupId.value,
        elapsed_ms: Date.now() - openedAt.value,
      })
    }
  }, 2000)
}

function hide() {
  const timeOpen = openedAt.value ? Date.now() - openedAt.value : null

  if (!thankyou.value) {
    action('donation_modal_dismissed', {
      variant: variant.value,
      groupId: groupId.value,
      time_open_ms: timeOpen,
      engaged: engagedLogged.value,
    })
  }

  if (engagedTimer) {
    clearTimeout(engagedTimer)
    engagedTimer = null
  }

  openedAt.value = null
  rawHide()
}

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

function score(value) {
  const runtimeConfig = useRuntimeConfig()
  const api = Api(runtimeConfig)

  api.bandit.chosen({
    uid: 'donation',
    variant: variant.value,
    score: value,
  })
}

const donated = computed(() => {
  const me = authStore.user

  return me?.donated ? dateshort(me.donated) : null
})
show()
</script>

<style scoped lang="scss">
:deep(.donation-modal-stripe) {
  .modal-dialog {
    overflow: visible;
  }

  .modal-content {
    overflow: visible;
  }
}
</style>
