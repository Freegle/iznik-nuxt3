<template>
  <div>
    <b-row>
      <b-col cols="3" lg="2" class="font-weight-bold"> Date / Time </b-col>
      <b-col cols="9" lg="4" class="forcebreak font-weight-bold"> User </b-col>
      <b-col cols="12" lg="6" class="forcebreak font-weight-bold">
        Action
      </b-col>
    </b-row>

    <hr class="d-block d-md-none" />

    <ModLog v-for="log in logs" :key="'log-' + log.id" :log="log" />

    <infinite-loading :distance="distance" @infinite="loadMore">
      <template #spinner>
        <b-img lazy src="/loader.gif" alt="Loading" />
      </template>
    </infinite-loading>
  </div>
</template>
<script>
import { useLogsStore } from '~/stores/logs'

export default {
  props: {
    groupid: {
      type: Number,
      required: false,
      default: null,
    },
  },
  emits: ['busy', 'idle'],
  setup() {
    const logsStore = useLogsStore()
    return { logsStore }
  },
  data: function () {
    return {
      distance: 1000,
      limit: 50,
      show: 0,
      busy: false,
    }
  },

  computed: {
    logs() {
      return this.logsStore.list
    },
  },

  methods: {
    async loadMore($state) {
      this.busy = true
      this.$emit('busy')
      const params = this.logsStore.params

      if (this.show < this.logs.length) {
        this.show++
        $state.loaded()
      } else {
        const currentCount = this.logs.length
        try {
          await this.logsStore.fetch({
            limit: this.limit,
            groupid: this.groupid,
            logtype: params.type,
            search: params.search,
          })

          const logs = this.logsStore.list

          if (currentCount === logs.length) {
            $state.complete()
          } else {
            $state.loaded()
            this.show++
          }
        } catch (e) {
          $state.complete()
          console.log('Complete on error', e)
        }
      }

      this.busy = false
      this.$emit('idle')
    },
  },
}
</script>
