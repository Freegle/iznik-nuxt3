<template>
  <div>
    <b-modal
      v-if="group"
      id="modAffiliationModal"
      ref="modal"
      size="lg"
      no-stacking
    >
      <template #title class="w-100">
        Please confirm affiliation for {{ group.nameshort }}
      </template>
      <template #default>
        <p>
          At the 2016 Freegle AGM, we voted that each local group should confirm
          once a year that it still wants to be affiliated with Freegle
          nationally.
        </p>
        <p>
          You might like to review the
          <!-- eslint-disable-next-line -->
          <ExternalLink href="https://wiki.ilovefreegle.org/Group_Affiliation_Requirements_Policy">Basic Requirements of a Freegle group</ExternalLink>
          and
          <!-- eslint-disable-next-line -->
          <ExternalLink href="https://wiki.ilovefreegle.org/Our_Aims">Our Aims</ExternalLink>.
        </p>
        <p>
          Any moderator on the group can do this, even a backup mod, but if you
          need to discuss it with your other mods then you can click
          <em>Not now</em> and we'll ask you again tomorrow.
        </p>
        <p>
          If your group no longer wishes to be affiliated with Freegle, please
          mail
          <!-- eslint-disable-next-line -->
          <ExternalLink href="mailto:board@ilovefreegle.org">board@ilovefreegle.org</ExternalLink>.
        </p>
      </template>
      <template #footer>
        <b-button variant="secondary" @click="hide"> Not now </b-button>
        <b-button variant="primary" @click="confirm">
          Yes, we still want to be affiliated
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import { useOurModal } from '~/composables/useOurModal'
import { useGroupStore } from '@/stores/group'

export default {
  props: {
    groupid: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const groupStore = useGroupStore()
    const { modal, hide } = useOurModal()
    return { groupStore, modal, hide }
  },
  data: function () {
    return {}
  },
  computed: {
    group() {
      return this.myGroup(this.groupid)
    },
  },
  methods: {
    async confirm() {
      await this.groupStore.confirmAffiliation({
        id: this.groupid,
      })
      this.hide()
    },
  },
}
</script>
