<template>
  <b-card v-if="someleft" no-body>
    <b-card-header>
      <div class="d-flex justify-content-between">
        <div>Share to community Facebook pages</div>
        <div class="small text-muted">
          {{ timeago(item.date) }}
        </div>
      </div>
    </b-card-header>
    <!-- eslint-disable-next-line-->
    <b-card-body v-html="item.iframe" />
    <b-card-footer :key="'sharelist-' + actioned.length">
      <b-button variant="white" class="mb-1 mr-1" @click="shareAll">
        <v-icon icon="share-alt" />
        Share all
      </b-button>
      <b-button
        v-for="group in groups"
        :key="'socialaction-' + group.id"
        :variant="isActioned(group.id) ? 'white' : 'primary'"
        class="mb-1 mr-1"
        :disabled="isActioned(group.id)"
        @click="share(group)"
      >
        <v-icon v-if="isActioned(group.id)" icon="check" />
        <v-icon v-else-if="isBusy(group.id)" icon="sync" class="fa-spin" />
        <v-icon v-else icon="share-alt" />
        {{ group.namedisplay }}
      </b-button>
      <b-button variant="danger" class="mb-1 mr-1" @click="hideAll">
        <v-icon icon="trash-alt" />
        Hide all
      </b-button>
    </b-card-footer>
  </b-card>
</template>
<script>
import cloneDeep from 'lodash.clonedeep'
import { usePublicityStore } from '@/stores/publicity'

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const publicityStore = usePublicityStore()
    return { publicityStore }
  },
  data: function () {
    return {
      busy: [],
      actioned: [],
    }
  },
  computed: {
    groups() {
      const ret = []

      // Cloning to avoid some strange issues which cause loops.
      const groups = cloneDeep(this.myGroups)

      this.item.uids.forEach((uid) => {
        for (const group of groups) {
          if (group.type === 'Freegle' && group.facebook) {
            group.facebook.forEach((facebook) => {
              if (parseInt(facebook.uid) === parseInt(uid)) {
                group.facebookuid = facebook.uid
                ret.push(group)
              }
            })
          }
        }
      })

      // Sort so we get the buttons in alphabetical order.
      ret.sort((a, b) => {
        return a.namedisplay
          .toLowerCase()
          .localeCompare(b.namedisplay.toLowerCase())
      })

      return ret
    },
    someleft() {
      let ret = false

      this.groups.forEach((group) => {
        if (!this.actioned.includes(group.id)) {
          ret = true
        }
      })

      return ret
    },
  },
  methods: {
    async share(group) {
      this.busy.push(group.id)

      await this.publicityStore.share({
        id: this.item.id,
        uid: group.facebookuid,
      })

      this.busy = this.busy.filter((g) => {
        return g.id !== group.id
      })

      this.actioned.push(group.id)
    },
    async hide(group, noUpdate) {
      this.busy.push(group.id)

      await this.publicityStore.hide({
        id: this.item.id,
        uid: group.facebookuid,
      })

      this.busy = this.busy.filter((g) => {
        return g.id !== group.id
      })

      this.actioned.push(group.id)

      if (!noUpdate) {
        this.updateWork()
      }
    },
    async shareAll() {
      const promises = []

      this.groups.forEach((group) => {
        if (!this.actioned.includes(group.id)) {
          promises.push(this.share(group, false))
        }
      })

      await Promise.all(promises)

      this.updateWork()
    },
    hideAll() {
      this.groups.forEach((group) => {
        if (!this.actioned.includes(group.id)) {
          this.hide(group)
        }
      })
    },
    isActioned(groupid) {
      return this.actioned.includes(groupid)
    },
    isBusy(groupid) {
      return this.busy.includes(groupid)
    },
    updateWork() {
      this.checkWork()
    },
  },
}
</script>
