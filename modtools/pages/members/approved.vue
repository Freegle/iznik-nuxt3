<template>
  <div>
    <client-only>
      <ScrollToTop :prepend="groupName" />
      <div class="d-flex justify-content-between flex-wrap">
        <GroupSelect v-model="groupid" modonly remember="membersapproved" />
        groupid {{groupid}}
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
        <p v-if="group" class="mt-1">
          This group has {{ withplural('member', group.membercount, true) }}.
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
import { useGroupStore } from '@/stores/group'
import { useMiscStore } from '@/stores/misc'
import { setupModMembers } from '../../composables/useModMembers'
import { withplural } from '../composables/usePluralize'

export default {
  async setup() {
    const groupStore = useGroupStore()
    const miscStore = useMiscStore()
    const modMembers = setupModMembers()
    //modMembers.collection.value = 'Pending'
    //modMembers.workType.value = 'pending'
    return {
      groupStore,
      miscStore,
      ...modMembers // busy, context, group, groupid, limit, workType, show, collection, messageTerm, memberTerm, distance, summary, members, visibleMembers, work,
    }
  },
  data: function() {
    return {
      collection: 'Approved',
      showAddMember: false,
      showBanMember: false,
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
    search(newVal) {
      if (!newVal) {
        // Cleared box.
        //TODO this.$router.push('/modtools/members/approved/' + this.groupid)
      }
    },
    groupid(newVal) {
      console.log('TODO APPROVED groupid',newVal)
      if (newVal) {
      }
    }
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
