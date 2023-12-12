<template>
  <b-modal
    ref="modal"
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
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useModal } from '~/composables/useModal'
import DonationAskVideo from '~/components/DonationAskVideo.vue'
import DonationAskQuote from '~/components/DonationAskQuote.vue'
import DonationAskButtons2510 from '~/components/DonationAskButtons2510.vue'
import DonationAskButtons51025 from '~/components/DonationAskButtons51025.vue'
import DonationAskWhatYouCan from '~/components/DonationAskWhatYouCan.vue'
import { useDonationAskModal } from '~/composables/useDonationAskModal'
import { useGroupStore } from '~/stores/group'
import { useDonationStore } from '~/stores/donations'
import Api from '~/api'

const groupStore = useGroupStore()
const donationStore = useDonationStore()

const { modal, hide } = useModal()
const { variant, groupId } = await useDonationAskModal()

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
</script>
