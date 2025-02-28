<template>
  <b-modal ref="modal" scrollable :title="title" size="lg" no-stacking>
    <template #default>
      <div v-if="thankyou">
        <DonationThank />
      </div>
      <div v-else>
        <p v-if="donated">
          You've already donated to Freegle (on {{ donated }}). Thank you.
        </p>
        <div v-if="variant === 'buttons2510'">
          <DonationAskStripe
            :groupid="groupId"
            :groupname="groupName"
            :target="target"
            :raised="raised"
            :target-met="targetMet"
            :donated="donated"
            :amounts="[2, 5, 10]"
            :default="2"
            @score="score"
            @success="thankyou = true"
          />
        </div>
        <div v-else-if="variant === 'buttons51025'">
          <DonationAskStripe
            :groupid="groupId"
            :groupname="groupName"
            :target="target"
            :raised="raised"
            :target-met="targetMet"
            :donated="donated"
            :amounts="[5, 10, 25]"
            :default="5"
            @score="score"
            @success="thankyou = true"
          />
        </div>
        <div v-else-if="variant === 'stripe'">
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
          />
        </div>
      </div>
    </template>
    <template #footer>
      <b-button variant="secondary" @click="hide">Close</b-button>
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

const props = defineProps({
  variant: {
    type: String,
    required: false,
    default: null,
  },
})

const groupStore = useGroupStore()
const donationStore = useDonationStore()
const authStore = useAuthStore()

const thankyou = ref(false)

const { modal, hide } = useOurModal()
const { variant, groupId, show } = await useDonationAskModal(props.variant)

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

const title = computed(() => {
  if (donated.value) {
    return 'Thank you for helping keep ' + groupName.value + ' running'
  } else {
    return 'Please help keep ' + groupName.value + ' running'
  }
})
show()
</script>
