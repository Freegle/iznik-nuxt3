<template>
  <div>
    <ModHelpSpammers />
    <div>
      <div>
        <b-tabs v-model="tabIndex" content-class="mt-3" card lazy>
          <b-tab id="Spammers" :active="!hasPermissionSpamAdmin">
            <template #title>
              <h2 class="ml-2 mr-2">Confirmed Spammers</h2>
            </template>
          </b-tab>
          <b-tab v-if="hasPermissionSpamAdmin" id="PendingAdd">
            <template #title>
              <h2 class="ml-2 mr-2">
                Pending Add
                <b-badge v-if="pendingaddcount" variant="danger">
                  {{ pendingaddcount }}
                </b-badge>
              </h2>
            </template>
          </b-tab>
          <b-tab v-if="hasPermissionSpamAdmin" id="Safelisted">
            <template #title>
              <h2 class="ml-2 mr-2">Safelisted</h2>
            </template>
          </b-tab>
          <b-tab v-if="hasPermissionSpamAdmin" id="PendingRemove">
            <template #title>
              <h2 class="ml-2 mr-2">
                Pending Remove
                <b-badge v-if="pendingremovecount" variant="danger">
                  {{ pendingremovecount }}
                </b-badge>
              </h2>
            </template>
          </b-tab>
        </b-tabs>
        <p v-if="tabIndex === 0" spam class="p-2">
          To remove from spammer list, please mail geeks.
        </p>
        <p v-if="tabIndex === 2" spam class="p-2">
          To remove from safe list, please mail geeks.
        </p>
        <ModMemberSearchbox
          v-if="tabIndex === 0"
          spam
          class="mb-2"
          @search="searched"
        />
        <ModMember
          v-for="(spammer, index) in visibleSpammers"
          :key="'spammer-' + tabIndex + '-' + spammer.id"
          :member="spammer.user"
          :sameip="spammer.sameip"
          class="mb-1"
          :index="index"
        />
        <infinite-loading
          :distance="10"
          :identifier="infiniteId"
          @infinite="loadMore"
        >
          <template #no-results> Nothing to show just now. </template>
          <template #no-more />
          <template #spinner>
            <b-img lazy src="/loader.gif" alt="Loading" />
          </template>
        </infinite-loading>
      </div>
    </div>
  </div>
</template>
<script>
import { useAuthStore } from '~/stores/auth'
import { useSpammerStore } from '~/stores/spammer'
import { useModGroupStore } from '@/stores/modgroup'

export default {
  setup() {
    const authStore = useAuthStore()
    const spammerStore = useSpammerStore()
    return { authStore, spammerStore }
  },
  data: function () {
    return {
      infiniteId: 0,
      tabIndex: 0,
      show: 0,
      busy: false,
      search: null,
    }
  },
  computed: {
    pendingaddcount() {
      return this.authStore.work ? this.authStore.work.spammerpendingadd : 0
    },
    pendingremovecount() {
      return this.authStore.work ? this.authStore.work.spammerpendingremove : 0
    },
    spammers() {
      const ret = this.spammerStore.getList(this.collection)

      // Need to move the byuser into the spammer object so that ModSpammer finds it.
      ret.forEach((s) => {
        s.user.spammer.byuser = s.byuser
      })

      return ret
    },
    visibleSpammers() {
      return this.spammers ? this.spammers.slice(0, this.show) : []
    },
    collection() {
      let ret = null

      switch (this.tabIndex) {
        case 0: {
          ret = 'Spammer'
          break
        }
        case 1: {
          ret = 'PendingAdd'
          break
        }
        case 2: {
          ret = 'Whitelisted'
          break
        }
        case 3: {
          ret = 'PendingRemove'
          break
        }
      }

      console.log('Spammer collection', this.tabIndex, ret)
      return ret
    },
  },
  watch: {
    tabIndex(newVal) {
      this.spammerStore.clear()
      this.infiniteId++
    },
    $route(to, from) {
      // Clear store when we move away to prevent items showing again when we come back on potentially a different tab.
      this.spammerStore.clear()
    },
  },
  mounted() {
    const modGroupStore = useModGroupStore()
    modGroupStore.getModGroups()
    // Start in Pending Add if they have rights to see it.
    this.spammerStore.clear()

    if (this.hasPermissionSpamAdmin) {
      if (this.search) {
        this.tabIndex = 0
      } else {
        this.tabIndex = 1
      }
    } else {
      this.tabIndex = 0
    }
  },
  methods: {
    searched(term) {
      this.spammerStore.clear()
      this.search = term
      this.infiniteId++
    },
    async loadMore($state) {
      // console.log('Spammers loadMore', this.show, this.spammers.length)
      this.busy = true

      if (this.show < this.spammers.length) {
        // This means that we will gradually add the members that we have fetched from the server into the DOM.
        // Doing that means that we will complete our initial render more rapidly and thus appear faster.
        this.show++
        $state.loaded()
        this.busy = false
      } else {
        const currentCount = this.spammers.length
        // console.log('fetch',this.search)
        await this.spammerStore.fetch({
          collection: this.collection,
          search: this.search,
          modtools: true,
        })
        this.context = this.spammerStore.getContext()

        if (currentCount === this.spammers.length) {
          this.busy = false
          $state.complete()
        } else {
          $state.loaded()
          this.busy = false
          this.show++
        }
      }
    },
  },
}
</script>
