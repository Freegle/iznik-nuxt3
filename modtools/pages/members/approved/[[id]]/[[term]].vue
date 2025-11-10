<template>
  <div>
    <client-only>
      <ScrollToTop :prepend="groupName" />
      <div class="d-flex justify-content-between flex-wrap">
        <ModGroupSelect
          v-model="chosengroupid"
          modonly
          remember="membersapproved"
        />
        <div v-if="groupid" class="d-flex">
          <ModMemberTypeSelect v-model="filter" />
          <b-button
            v-if="groupid"
            variant="white"
            class="ml-2"
            @click="addMember"
          >
            <v-icon icon="plus" /> Add
          </b-button>
          <b-button
            v-if="groupid"
            variant="white"
            class="ml-2"
            @click="banMember"
          >
            <v-icon icon="trash-alt" /> Ban
          </b-button>
          <ModAddMemberModal
            v-if="showAddMember"
            ref="addmodal"
            :groupid="groupid"
            @hidden="showAddMember = false"
          />
          <ModBanMemberModal
            v-if="showBanMember"
            ref="banmodal"
            :groupid="groupid"
            @hidden="showBanMember = false"
          />
          <ModMergeButton class="ml-2" />
          <ModMemberExportButton class="ml-2" :groupid="groupid" />
        </div>
        <ModMemberSearchbox :search="search" @search="startsearch" />
      </div>
      <div v-if="id || term">
        <p v-if="groupid && group" class="mt-1">
          This group has {{ pluralise('member', group.membercount, true) }}.
        </p>
        <NoticeMessage v-if="!members.length" class="mt-2">
          There are no members to show at the moment.
        </NoticeMessage>
        <ModMembers />
        <infinite-loading
          direction="top"
          force-use-infinite-wrapper="true"
          :distance="distance"
          :identifier="bump"
          @infinite="loadMore"
        >
          <template #no-results>
            There are no members to show at the moment.
          </template>
          <template #no-more>
            <p class="p-2">END OF LIST</p>
          </template>
          <template #spinner>
            <b-img lazy src="/loader.gif" alt="Loading" />
          </template>
        </infinite-loading>
      </div>
      <NoticeMessage v-else variant="info" class="mt-2">
        Please select a community or search for someone across all your
        communities.
      </NoticeMessage>
    </client-only>
  </div>
</template>
<script>
import { useMiscStore } from '@/stores/misc'
import { useMemberStore } from '@/stores/member'
import { useModGroupStore } from '@/stores/modgroup'
import { setupModMembers } from '@/composables/useModMembers'
import { pluralise } from '@/composables/usePluralise'

export default {
  async setup() {
    const memberStore = useMemberStore()
    const miscStore = useMiscStore()
    const modMembers = setupModMembers(true)
    modMembers.context.value = null
    modMembers.collection.value = 'Approved'
    return {
      memberStore,
      miscStore,
      ...modMembers, // bump, busy, context, group, groupid, limit, search, filter, show, sort, collection, messageTerm, memberTerm, nextAfterRemoved, distance, members, visibleMembers, loadMore
    }
  },
  data: function () {
    return {
      chosengroupid: 0,
      showAddMember: false,
      showBanMember: false,
    }
  },
  computed: {
    id() {
      const route = useRoute()
      if ('id' in route.params && route.params.id)
        return parseInt(route.params.id)
      return 0
    },
    term() {
      const route = useRoute()
      if ('term' in route.params && route.params.term) return route.params.term
      return null
    },
    groupName() {
      if (this.group) {
        return this.group.namedisplay
      }
      return null
    },
  },
  watch: {
    filter(newVal) {
      // console.log('[[term]] filter', newVal)
      this.bump++
      this.memberStore.clear()
    },
    chosengroupid(newVal) {
      // console.log('chosengroupid', newVal)
      const router = useRouter()
      if (newVal !== this.id) {
        if (newVal === 0) {
          // console.log('chosengroupid GO HOME')
          router.push('/members/approved/')
        } else {
          // console.log('chosengroupid GOTO',newVal)
          router.push('/members/approved/' + newVal)
        }
      } else {
        // console.log('chosengroupid SAME')
      }
    },
    /* groupid(newVal) {
      console.log('[[term]] groupid', newVal)
      this.bump++
      this.memberStore.clear()
    }, */
  },
  mounted() {
    const route = useRoute()
    this.groupid = this.id
    this.chosengroupid = this.id
    this.search = ''
    if ('term' in route.params && route.params.term)
      this.search = route.params.term
    // console.log('members approved mounted', this.groupid, this.search)

    const modGroupStore = useModGroupStore()
    modGroupStore.getModGroups()

    // reset infiniteLoading on return to page
    this.memberStore.clear()

    if (!this.groupid) {
      // If we have not selected a group, check if we are only a mod on one.  If so, then go to that group so that
      // we don't need to bother selecting it.
      let countmod = 0
      let lastmod = null
      this.myGroups.forEach((g) => {
        if (g.role === 'Moderator' || g.role === 'Owner') {
          countmod++
          lastmod = g.id
        }
      })

      if (countmod === 1) {
        this.groupid = lastmod
        const router = useRouter()
        router.push('/members/approved/' + lastmod)
      }
    }
    if (this.term) {
      // Turn off sorting for searches
      this.sort = false
    } else {
      this.sort = true
    }
    // this.bump++
  },
  methods: {
    async addMember() {
      this.showAddMember = true
      this.$refs.addmodal?.show()
    },
    banMember() {
      this.showBanMember = true
      this.$refs.banmodal?.show()
    },
    startsearch(search) {
      // console.log('[[term]] startsearch', search)
      // Initiate search again even if search has not changed
      search = search.trim()
      this.search = search
      this.context = null
      this.memberStore.clear()
      const router = useRouter()
      let newpath = '/members/approved/'
      if (search) {
        newpath = '/members/approved/' + this.groupid + '/' + search
      } else if (this.groupid) {
        newpath = '/members/approved/' + this.groupid
      }
      if (newpath !== router.currentRoute.value.path) {
        router.push(newpath)
      } else {
        this.bump++
      }
    },
  },
}
</script>
