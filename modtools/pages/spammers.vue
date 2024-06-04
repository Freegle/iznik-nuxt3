<template>
  <div>
    <ModHelpSpammers />
    <div>
      <div>
        <b-tabs v-model="tabIndex" content-class="mt-3" card lazy>
          <b-tab id="Spammers" :active="!hasPermissionSpamAdmin">
            <template v-slot:title>
              <h2 class="ml-2 mr-2">
                Confirmed Spammers
              </h2>
            </template>
          </b-tab>
          <b-tab v-if="hasPermissionSpamAdmin" id="PendingAdd">
            <template v-slot:title>
              <h2 class="ml-2 mr-2">
                Pending Add
                <b-badge v-if="pendingaddcount" variant="danger">
                  {{ pendingaddcount }}
                </b-badge>
              </h2>
            </template>
          </b-tab>
          <b-tab v-if="hasPermissionSpamAdmin" id="Whitelisted">
            <template v-slot:title>
              <h2 class="ml-2 mr-2">
                Whitelisted
              </h2>
            </template>
          </b-tab>
          <b-tab v-if="hasPermissionSpamAdmin" id="PendingRemove">
            <template v-slot:title>
              <h2 class="ml-2 mr-2">
                Pending Remove
                <b-badge v-if="pendingremovecount" variant="danger">
                  {{ pendingremovecount }}
                </b-badge>
              </h2>
            </template>
          </b-tab>
        </b-tabs>
        <ModMemberSearchbox v-if="tabIndex === 0" spam class="mb-2" @search="searched" />
        <!--div v-for="spammer in visibleSpammers">
          SPAMMER {{ spammer.id }} {{ spammer.user.id }}
        </div-->
        <ModMember v-for="(spammer, index) in visibleSpammers" :key="'spammer-' + tabIndex + '-' + spammer.id" :member="spammer.user" :sameip="spammer.sameip" class="mb-1" :index="index" />
        <b-img v-if="busy" src="/loader.gif" alt="Loading" width="100px" />
        <div v-else-if="!spammers.length">
          Nothing to show just now.
        </div>
        <infinite-loading :distance="10" @infinite="loadMore">
          <span slot="no-results" />
          <span slot="no-more" />
          <span slot="spinner" />
        </infinite-loading>
      </div>
    </div>
  </div>
</template>
<script>
import { useSpammerStore } from '../stores/spammer'

export default {
  setup() {
    const spammerStore = useSpammerStore()
    return { spammerStore }
  },
  data: function () {
    return {
      tabIndex: 0,
      show: 0,
      busy: false,
      bump: 0,
      search: null
    }
  },
  computed: {
    pendingaddcount() {
      /* TODO const work = this.$store.getters['auth/work']
      return work.spammerpendingadd*/
      return 101
    },
    pendingremovecount() {
      /* TODO const work = this.$store.getters['auth/work']
      return work.spammerpendingremove*/
      return 102
    },
    spammers() {
      const ret = this.spammerStore.getList(this.collection)

      // Need to move the byuser into the spammer object so that ModSpammer finds it.
      ret.forEach(s => {
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
    }
  },
  watch: {
    tabIndex(newVal) {
      this.spammerStore.clear()
      this.bump++
    },
    $route(to, from) {
      // Clear store when we move away to prevent items showing again when we come back on potentially a different tab.
      this.spammerStore.clear()
    }
  },
  mounted() {
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
    searched(term){
      this.spammerStore.clear()
      this.search = term
    },
    async loadMore($state) {
      console.log('Spammers loadMore', this.show, this.spammers.length)
      this.busy = true

      if (this.show < this.spammers.length) {
        // This means that we will gradually add the members that we have fetched from the server into the DOM.
        // Doing that means that we will complete our initial render more rapidly and thus appear faster.
        this.show++
        $state.loaded()
        this.busy = false
      } else {
        const currentCount = this.spammers.length

        await this.spammerStore.fetch({
          collection: this.collection,
          search: this.search,
          modtools: true
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
        /*.catch(e => {
        $state.complete()
        this.busy = false
        console.log('busy false')
        console.log('Complete on error', e)
      })*/
      }
    }
  }
}
</script>
