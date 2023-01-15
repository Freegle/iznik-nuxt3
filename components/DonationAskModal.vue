<template>
  <div>
    <b-modal
      id="donationaskmodal"
      v-model="showModal"
      :title="'Please help keep ' + groupname + ' running'"
      size="lg"
      no-stacking
    >
      <template #default>
        <div v-if="variant === 'video'">
          <DonationAskVideo
            :groupid="groupid"
            :groupname="groupname"
            :target="target"
            :raised="raised"
            :target-met="targetMet"
            @score="score"
          />
        </div>
        <div v-else-if="variant === 'quote'">
          <DonationAskQuote
            :groupid="groupid"
            :groupname="groupname"
            :target="target"
            :raised="raised"
            :target-met="targetMet"
            @score="score"
          />
        </div>
        <div v-else-if="variant === 'buttons2510'">
          <DonationAskButtons2510
            :groupid="groupid"
            :groupname="groupname"
            :target="target"
            :raised="raised"
            :target-met="targetMet"
            @score="score"
          />
        </div>
        <div v-else-if="variant === 'buttons51025'">
          <DonationAskButtons51025
            :groupid="groupid"
            :groupname="groupname"
            :target="target"
            :raised="raised"
            :target-met="targetMet"
            @score="score"
          />
        </div>
        <div v-else>
          <DonationAskWhatYouCan
            :groupid="groupid"
            :groupname="groupname"
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
<script>
import { mapState } from 'pinia'
import { useDonationStore } from '../stores/donations'
import { useGroupStore } from '../stores/group'
import DonationAskVideo from './DonationAskVideo'
import DonationAskQuote from './DonationAskQuote'
import DonationAskButtons2510 from './DonationAskButtons2510'
import DonationAskButtons51025 from './DonationAskButtons51025'
import modal from '@/mixins/modal'
import api from '~/api'

export default {
  components: {
    DonationAskVideo,
    DonationAskQuote,
    DonationAskButtons2510,
    DonationAskButtons51025,
  },
  mixins: [modal],
  props: {
    groupid: {
      type: Number,
      required: false,
      default: null,
    },
  },
  async setup(props) {
    const donationStore = useDonationStore()
    const groupStore = useGroupStore()

    if (props.groupid) {
      await groupStore.fetchGroup(props.groupid)
    }

    const runtimeConfig = useRuntimeConfig()

    return {
      donationStore,
      groupStore,
      api: api(runtimeConfig),
    }
  },
  data() {
    return {
      variant: null,
      monthly: false,
    }
  },
  computed: {
    ...mapState(useDonationStore, ['target', 'raised']),
    groupname() {
      if (this.groupid && !this.targetMet) {
        const group = this.groupStore.get(this.groupid)

        return group?.namedisplay
      }

      return 'Freegle'
    },
    targetMet() {
      // Have we met our per group target?  If so then we'll do a global donation appeal.
      return this.groupid && this.raised > this.target
    },
  },
  methods: {
    async show(variant) {
      // We need to decide which variant of donation ask to show.
      this.variant = variant

      try {
        if (!variant) {
          variant = 'buttons1'

          variant = await this.api.bandit.choose({
            uid: 'donation',
          })

          if (variant) {
            this.variant = variant.variant
          }
        }
      } catch (e) {
        console.error('Get variant failed')
      }

      this.showModal = true

      // Record the show
      await this.api.bandit.shown({
        uid: 'donation',
        variant: this.variant,
      })
    },
    score(value) {
      this.api.bandit.chosen({
        uid: 'donation',
        variant: this.variant,
        score: value,
      })
    },
  },
}
</script>
