<template>
  <div>
    <client-only>
      <ScrollToTop :prepend="groupName" />
      <div class="d-flex justify-content-between flex-wrap">
        <GroupSelect v-model="groupid" modonly remember="membersapproved" />
        <div v-if="groupid" class="d-flex">
          <ModMemberTypeSelect :filter="filter" />
          <b-button v-if="groupid" variant="white" class="ml-2" @click="addMember">
            <v-icon icon="plus" /> Add
          </b-button>
          <b-button v-if="groupid" variant="white" class="ml-2" @click="banMember">
            <v-icon icon="trash-alt" /> Ban
          </b-button>
          <ModAddMemberModal v-if="showAddMember" ref="addmodal" :groupid="groupid" @hidden="showAddMember = false"/>
          <ModBanMemberModal v-if="showBanMember" ref="banmodal" :groupid="groupid" @hidden="showBanMember = false"/>
          <ModMergeButton class="ml-2" />
          <ModMemberExportButton class="ml-2" :groupid="groupid" />
        </div>
        <ModMemberSearchbox v-model="search" :groupid="groupid" />
      </div>
      <div v-if="groupid">
        <p v-if="memberCount" class="mt-1">
          This group has {{ memberCount | pluralize('member', { includeNumber: true }) }}.
        </p>
        <NoticeMessage v-if="!members.length && !busy" class="mt-2">
          There are no members to show at the moment.
        </NoticeMessage>

        <ModMembers />
      </div>
      <NoticeMessage v-else variant="info" class="mt-2">
        Please select a community or search for someone across all your communities.
      </NoticeMessage>
    </client-only>
  </div>
</template>
<script>
import { useMiscStore } from '@/stores/misc'
import { setupModMembers } from '../../composables/useModMembers'

export default {
  async setup() {
    const miscStore = useMiscStore()
    const modMembers = setupModMembers()
    //modMembers.collection.value = 'Pending'
    //modMembers.workType.value = 'pending'
    return {
      miscStore,
      ...modMembers // busy, context, group, groupid, limit, workType, show, collection, messageTerm, memberTerm, distance, summary, messages, visibleMessages, work,
    }
  },
  data: function() {
    return {
      collection: 'Approved',
      search: null,
      filter: '0',
      memberCount: 0,
      showAddMember: false,
      showBanMember: false,
    }
  },
  computed: {
    groupName() {
      if (this.groupid) {
        //TODO return this.$store.getters['group/get'](this.groupid)?.namedisplay
      }

      return null
    }
  },
  watch: {
    search(newVal) {
      if (!newVal) {
        // Cleared box.
        //TODO this.$router.push('/modtools/members/approved/' + this.groupid)
      }
    }
  },
  async mounted() {
    if (!this.groupid) {
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
    } else {
      // Make sure we have the member count.
      await this.$store.dispatch('group/fetch', {
        id: this.groupid
      })
      //TODO const group = this.$store.getters['group/get'](this.groupid)
      //TODO this.memberCount = group.membercount
    }
  },
  methods: {
    addMember() {
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
