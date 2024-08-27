<template>
  <div>
    <client-only>
      <ScrollToTop :prepend="groupName" />
      <div class="d-flex justify-content-between flex-wrap">
        <GroupSelect v-model="groupid" modonly remember="membersapproved" />
        <div v-if="groupid" class="d-flex">
          <ModMemberTypeSelect v-model="filter" />
          <b-button v-if="groupid" variant="white" class="ml-2" @click="addMember">
            <v-icon icon="plus" /> Add
          </b-button>
          <b-button v-if="groupid" variant="white" class="ml-2" @click="banMember">
            <v-icon icon="trash-alt" /> Ban
          </b-button>
          <ModAddMemberModal v-if="showAddMember" ref="addmodal" :groupid="groupid" @hidden="showAddMember = false" />
          <ModBanMemberModal v-if="showBanMember" ref="banmodal" :groupid="groupid" @hidden="showBanMember = false" />
          <ModMergeButton class="ml-2" />
          <ModMemberExportButton class="ml-2" :groupid="groupid" />
        </div>
        <ModMemberSearchbox v-model="search" :groupid="groupid" />
      </div>
      <div v-if="groupid && group">
        <p class="mt-1">
          This group has {{ withplural('member', group.membercount, true) }}.
        </p>
        <NoticeMessage v-if="!members.length && !busy" class="mt-2">
          There are no members to show at the moment.
        </NoticeMessage>

        <ModMembers />
        <infinite-loading direction="top" force-use-infinite-wrapper="true" :distance="distance" @infinite="loadMore" :identifier="bump">
          <span slot="no-results" />
          <span slot="no-more" />
          <span slot="spinner">
            <b-img lazy src="~/static/loader.gif" alt="Loading" />
          </span>
        </infinite-loading>
      </div>
      <NoticeMessage v-else variant="info" class="mt-2">
        Please select a community or search for someone across all your communities.
      </NoticeMessage>
    </client-only>
  </div>
</template>
<script>
import { useGroupStore } from '@/stores/group'
import { useMiscStore } from '@/stores/misc'
import { useMemberStore } from '../stores/member'
import { setupModMembers } from '../../composables/useModMembers'
import { withplural } from '../composables/usePluralize'

export default {
  async setup() {
    const groupStore = useGroupStore()
    const memberStore = useMemberStore()
    const miscStore = useMiscStore()
    const modMembers = setupModMembers()
    modMembers.collection.value = 'Approved'
    return {
      groupStore,
      memberStore,
      miscStore,
      ...modMembers // busy, context, group, groupid, limit, workType, show, collection, messageTerm, memberTerm, distance, summary, members, visibleMembers, work,
    }
  },
  data: function () {
    return {
      showAddMember: false,
      showBanMember: false,
      bump: 0
    }
  },
  computed: {
    groupName() {
      if (this.group) {
        return this.group.namedisplay
      }
      return null
    }
  },
  watch: {
    filter(newVal){
      console.log('NEW filter', newVal)
      this.bump++
      this.memberStore.clear()
    }
    /*search(newVal) {
      if (!newVal) {
        // Cleared box.
        //TODO this.$router.push('/modtools/members/approved/' + this.groupid)
      }
    },
    groupid(newVal) {
      console.log('TODO APPROVED groupid', newVal)
      if (newVal) {
      }
    }*/
  },
  async mounted() {
    console.log("approved mounted")
    if (!this.groupid) {
      console.log("approved mounted no groupid")
      // If we have not selected a group, check if we are only a mod on one.  If so, then go to that group so that
      // we don't need to bother selecting it.  We do this here because the interaction with createGroupRoute would
      // be complex.
      let countmod = 0
      let lastmod = null
      this.myGroups.forEach(g => {
        if (g.role === 'Moderator' || g.role === 'Owner') {
          countmod++
          lastmod = g.id
        }
      })

      if (countmod === 1) {
        //TODO this.$router.push('/modtools/members/approved/' + lastmod)
      }
    }
  },
  methods: {
    async loadMore($state) {
      if (!this.group) {
        $state.complete()
        return
      }
      this.busy = true
      if (this.show < this.members.length) {
        this.show++
        $state.loaded()
      } else {
        if (this.members.length === this.group.membercount) {
          $state.complete()
        } else {
          this.limit += this.distance

          await this.memberStore.fetchMembers({
            groupid: this.groupid,
            collection: this.collection,
            modtools: true,
            summary: false,
            context: this.context,
            limit: this.limit,
            search: this.search,
            filter: this.filter
          })

          if( this.show < this.members.length){
            this.show++
          }
          //this.show = this.members.length
          if (this.show === this.group.membercount) {
            $state.complete()
          }
          else {
            $state.loaded()
          }
        }
      }
      this.busy = false
    },
    async addMember() {
      this.showAddMember = true
      this.$refs.addmodal?.show()
    },
    banMember() {
      this.showBanMember = true
      this.$refs.banmodal?.show()
    }
  }
}
</script>
