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
    async approve(params) {
      await api(this.config).memberships.approveMember(
        params.id,
        params.groupid,
        params.subject,
        params.stdmsgid,
        params.body
      )
    },
    async reject(params) {
      await api(this.config).memberships.rejectMember(
        params.id,
        params.groupid,
        params.subject,
        params.stdmsgid,
        params.body
      )
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

      // V2 API expects context as a simple ID value
      if (params.context && typeof params.context === 'object') {
        params.context = params.context.id
      }

      const { members, context, ratings } = await api(
        this.config
      ).memberships.fetchMembers(params)

      // console.log('fetchMembers', this.instance, instance, members.length)

      if (this.instance === instance) {
        for (let i = 0; i < members.length; i++) {
          // Ensure collection and groupid are set from params as fallback.
          if (!members[i].collection) members[i].collection = params.collection
          if (!members[i].groupid) members[i].groupid = params.groupid
        }
        received += members.length

        if (params.collection === 'Related') {
          // V2 API returns {id, user1, user2} pairs.  Store each pair keyed
          // by its id, and create synthetic member entries for each user so
          // that ModMember can look them up.
          members.forEach((pair) => {
            pair.rawindex = this.rawindex++
            pair.collection = 'Related'
            this.list[pair.id] = pair

            // Synthetic member entries so ModMember can resolve them.
            for (const uid of [pair.user1, pair.user2]) {
              if (!this.list[uid]) {
                this.list[uid] = {
                  id: uid,
                  userid: uid,
                  collection: 'Related',
                  rawindex: this.rawindex++,
                  _syntheticRelated: true,
                }
              }
            }
          })
        } else if (params.collection === 'Spam') {
          // V2 API returns one row per membership. V1 grouped by userid and
          // nested all memberships under one entry.  Replicate that here so
          // the review page shows one card per user.
          const byUser = {}
          members.forEach((member) => {
            const uid = member.userid
            if (!byUser[uid]) {
              byUser[uid] = {
                ...member,
                memberships: [],
              }
            }
            byUser[uid].memberships.push({
              id: member.id,
              membershipid: member.id,
              groupid: member.groupid,
              added: member.added,
              collection: member.collection,
              role: member.role,
              heldby: member.heldby,
              reviewrequestedat: member.reviewrequestedat,
              reviewedat: member.reviewedat,
              reviewreason: member.reviewreason,
            })
          })
          Object.values(byUser).forEach((member) => {
            member.rawindex = this.rawindex++
            this.list[member.id] = member
          })
        } else if (params.search && !params.groupid) {
          // When searching across all groups, deduplicate by userid — a user
          // can appear once per group they belong to but the card already shows
          // all their memberships, so keep only the first entry per user.
          const seen = {}
          members.forEach((member) => {
            const uid = member.userid
            if (!seen[uid]) {
              seen[uid] = true
              member.rawindex = this.rawindex++
              this.list[member.userid] = member
            }
          })
        } else {
          members.forEach((member) => {
            member.rawindex = this.rawindex++
            this.list[member.id] = member
          })
        }

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
      await api(this.config).memberships.reviewIgnore(
        params.userid,
        params.groupid
      )

      // Remove just the acted-on membership from the member's memberships
      // array, not the whole entry. If the member is in review on multiple
      // groups, the mod needs to act on each one (#324).
      const key = Object.keys(this.list).find(
        (k) => parseInt(this.list[k].userid) === parseInt(params.userid)
      )
      if (key && this.list[key].memberships) {
        this.list[key].memberships = this.list[key].memberships.filter(
          (m) => parseInt(m.groupid) !== parseInt(params.groupid)
        )
        // Remove the whole entry only when no memberships remain.
        if (this.list[key].memberships.length === 0) {
          delete this.list[key]
        }
      }
    },

    async updateMembership(params) {
      await api(this.config).memberships.save(params)
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
        happiness: String(params.happinessid),
        action: 'HappinessReviewed',
      })
    },
    async reviewHold(params) {
      await api(this.config).memberships.reviewHold(
        params.userid,
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
        params.userid,
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
    ratingById: (state) => (id) => {
      return state.ratings.find((r) => parseInt(r.id) === parseInt(id))
    },
  },
})
