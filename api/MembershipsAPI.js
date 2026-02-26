import BaseAPI from '@/api/BaseAPI'

export default class MembershipsAPI extends BaseAPI {
  update(data) {
    return this.$patchv2('/memberships', data)
  }

  joinGroup(data) {
    return this.$putv2('/memberships', data)
  }

  leaveGroup(data) {
    return this.$delv2('/memberships', data)
  }

  async fetch(params, logError = true) {
    const members = await this.$getv2('/memberships', params, logError)
    const member = Array.isArray(members) ? members[0] : members
    return { member }
  }

  async fetchMembers(params) {
    const members = await this.$getv2('/memberships', params)
    return { members, context: null, ratings: [] }
  }

  save(event) {
    return this.$patchv2('/memberships', event)
  }

  del(id) {
    return this.$delv2('/memberships', { id })
  }

  put(data) {
    return this.$putv2('/memberships', data)
  }

  reply(userid, groupid, subject = null, stdmsgid = null, body = null) {
    return this.$postv2('/memberships', {
      action: 'Leave Approved Member',
      userid,
      groupid,
      subject,
      stdmsgid,
      body,
    })
  }

  delete(userid, groupid, subject = null, stdmsgid = null, body = null) {
    return this.$postv2('/memberships', {
      action: 'Delete Approved Member',
      userid,
      groupid,
      subject,
      stdmsgid,
      body,
    })
  }

  remove(userid, groupid) {
    return this.$delv2('/memberships', {
      userid,
      groupid,
    })
  }

  ban(userid, groupid) {
    return this.$delv2('/memberships', {
      userid,
      groupid,
      ban: true,
    })
  }

  unban(userid, groupid) {
    return this.$postv2('/memberships', {
      userid,
      groupid,
      action: 'Unban',
    })
  }

  hold(userid, groupid) {
    return this.$postv2('/memberships', {
      action: 'Hold',
      userid,
      groupid,
    })
  }

  release(userid, groupid) {
    return this.$postv2('/memberships', {
      action: 'Release',
      userid,
      groupid,
    })
  }

  reviewHold(membershipid, groupid) {
    return this.$postv2('/memberships', {
      action: 'ReviewHold',
      membershipid,
      groupid,
    })
  }

  reviewRelease(membershipid, groupid) {
    return this.$postv2('/memberships', {
      action: 'ReviewRelease',
      membershipid,
      groupid,
    })
  }

  happinessReviewed(params) {
    return this.$postv2('/memberships', params)
  }
}
