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
    const ret = await this.$getv2('/memberships', params)

    // Happiness collection returns { members, ratings }; others return an array.
    if (ret && ret.members !== undefined) {
      return { members: ret.members, context: null, ratings: ret.ratings || [] }
    }

    return { members: ret, context: null, ratings: [] }
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

  approveMember(userid, groupid, subject = null, stdmsgid = null, body = null) {
    return this.$postv2('/memberships', {
      action: 'Approve',
      userid,
      groupid,
      subject,
      stdmsgid,
      body,
    })
  }

  rejectMember(userid, groupid, subject = null, stdmsgid = null, body = null) {
    return this.$postv2('/memberships', {
      action: 'Reject',
      userid,
      groupid,
      subject,
      stdmsgid,
      body,
    })
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

  reviewIgnore(userid, groupid) {
    return this.$postv2('/memberships', {
      action: 'ReviewIgnore',
      userid,
      groupid,
    })
  }

  reviewHold(userid, groupid) {
    return this.$postv2('/memberships', {
      action: 'ReviewHold',
      userid,
      groupid,
    })
  }

  reviewRelease(userid, groupid) {
    return this.$postv2('/memberships', {
      action: 'ReviewRelease',
      userid,
      groupid,
    })
  }

  happinessReviewed(params) {
    return this.$postv2('/memberships', params)
  }
}
