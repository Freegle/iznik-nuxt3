import { defineStore } from 'pinia'
import api from '~/api'
import { useAuthStore } from '~/stores/auth'

export const useMemberStore = defineStore({
  id: 'member',
  state: () => ({
    list: {}, // membershipid: member
    // The context from the last fetch, used for fetchMore.
    context: null,
    // For spotting when we clear under the feet of an outstanding fetch
    instance: 1,
    ratings: [],
    rawindex: 0,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    clear() {
      this.list = {}
      this.context = null
      this.instance = 1
      this.ratings = []
      this.rawindex = 0
    },
    reviewHeld(params) {
      Object.keys(this.list).forEach((key) => {
        if (
          parseInt(this.list[key].membershipid) ===
          parseInt(params.membershipid)
        ) {
          this.list[key].heldby = params.heldby
        }
      })
    },
    async reply(params) {
      await api(this.config).memberships.reply(
        params.id,
        params.groupid,
        params.subject,
        params.stdmsgid,
        params.body
      )
    },
    async delete(params) {
      await api(this.config).memberships.delete(
        params.id,
        params.groupid,
        params.subject,
        params.stdmsgid,
        params.body
      )
      let foundid = false
      for (const membership of Object.values(this.list)) {
        if (
          membership.userid === params.id &&
          membership.groupid === params.groupid
        ) {
          foundid = membership.id
        }
      }
      if (foundid) {
        delete this.list[foundid]
      }
    },
    async fetchMembers(params) {
      // console.log('useMemberStore fetchMembers',params)
      let received = 0
      // Watch out for the store being cleared under the feet of this fetch. If that happens then we throw away the
      // results.
      const instance = this.instance

      // Convert context object to URL-safe format (URLSearchParams can't serialize objects)
      if (params.context && params.context.id) {
        params['context[id]'] = params.context.id
        delete params.context
      }

      const { members, context, ratings } = await api(
        this.config
      ).memberships.fetchMembers(params)

      // console.log('fetchMembers', this.instance, instance, members.length)

      if (this.instance === instance) {
        for (let i = 0; i < members.length; i++) {
          // The server doesn't return the collection but this is useful to have in the store.
          members[i].collection = params.collection
        }
        received += members.length
        members.forEach((member) => {
          // console.log('member',member.displayname,member.id)
          member.rawindex = this.rawindex++
          this.list[member.id] = member
        })

        if (ratings && ratings.length) {
          this.ratings = ratings
        }

        this.context = context
      }
      // console.log('useMemberStore fetchMembers this.list',this.list)
      return received
    },
    async fetch(params) {
      // Don't log errors on fetches of individual members
      // console.log('useMemberStore fetch', params)
      const { member } = await api(this.config).memberships.fetch(params)
      // const { member } = await this.$api.memberships.fetch(params, data => {
      //  return data.ret !== 3
      // })
      this.list[member.id] = member
      // console.log('useMemberStore fetch this.list',this.list)
    },

    async spamignore(params) {
      await api(this.config).user.save({
        id: params.userid,
        groupid: params.groupid,
        suspectcount: 0,
        suspectreason: null,
      })
    },

    async remove(userid, groupid, membershipid) {
      // membershipid may be undefined
      // Remove approved member.
      this.context = null
      await api(this.config).memberships.remove(userid, groupid)

      // Remove from list: either use given membershipid or find matching userid/groupid
      if (membershipid) {
        // const member = this.list[membershipid]
        delete this.list[membershipid]
      } else {
        let foundid = false
        for (const membership of Object.values(this.list)) {
          if (membership.userid === userid && membership.groupid === groupid) {
            foundid = membership.id
          }
        }
        if (foundid) {
          delete this.list[foundid]
        }
      }
    },
    async update(params) {
      const data = await api(this.config).memberships.update(params)
      return data
    },
    async add(params) {
      this.context = null
      const ret = await api(this.config).memberships.put(params)
      return ret.id
    },
    async ban(userid, groupid) {
      await api(this.config).memberships.ban(userid, groupid)
    },
    async unban(userid, groupid) {
      await api(this.config).memberships.unban(userid, groupid)
    },
    async happinessReviewed(params) {
      await api(this.config).memberships.happinessReviewed({
        userid: params.userid,
        groupid: params.groupid,
        happinessid: params.happinessid,
        action: 'HappinessReviewed',
      })
    },
    async reviewHold(params) {
      await api(this.config).memberships.reviewHold(
        params.membershipid,
        params.groupid
      )
      const authStore = useAuthStore()
      const me = authStore.user
      this.reviewHeld({
        heldby: {
          id: me.id,
        },
        membershipid: params.membershipid,
      })
    },

    async reviewRelease(params) {
      await api(this.config).memberships.reviewRelease(
        params.membershipid,
        params.groupid
      )
      this.reviewHeld({
        heldby: null,
        membershipid: params.membershipid,
      })
    },
    async askMerge(id, params) {
      console.log('useMemberStore askMerge', id, params)
      await api(this.config).merge.ask(params)
      delete this.list[id]
    },
    async ignoreMerge(id, params) {
      console.log('useMemberStore ignoreMerge', id, params)
      await api(this.config).merge.ignore(params)
      delete this.list[id]
    },
  },
  getters: {
    getByGroup: (state) => (groupid) => {
      const ret = Object.values(state.list).filter((member) => {
        return parseInt(member.groupid) === parseInt(groupid)
      })
      // console.log('memberStore:',groupid, ret.length)
      return ret
    },
    get: (state) => (id) => {
      const ret = Object.values(state.list).filter((member) => {
        return parseInt(member.id) === parseInt(id)
      })
      if (ret) return ret[0]
      return ret
    },
    // getRatings: state => state.ratings
  },
})
