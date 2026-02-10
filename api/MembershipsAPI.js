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

  fetch(params, logError = true) {
    return this.$get('/memberships', params, logError)
  }

  fetchMembers(params) {
    // console.error('MembershipsAPI fetchMembers', params)
    return this.$get('/memberships', params)
  }

  save(event) {
    return this.$patchv2('/memberships', event)
  }

  del(id) {
    return this.$del('/memberships', { id })
  }

  put(data) {
    return this.$put('/memberships', data)
  }

  reply(userid, groupid, subject = null, stdmsgid = null, body = null) {
    return this.$post('/memberships', {
      action: 'Leave Approved Member',
      userid,
      groupid,
      subject,
      stdmsgid,
      body,
    })
  }

  delete(userid, groupid, subject = null, stdmsgid = null, body = null) {
    return this.$post('/memberships', {
      action: 'Delete Approved Member',
      userid,
      groupid,
      subject,
      stdmsgid,
      body,
    })
  }

  remove(userid, groupid) {
    return this.$del('/memberships', {
      userid,
      groupid,
    })
  }

  ban(userid, groupid) {
    return this.$del('/memberships', {
      userid,
      groupid,
      ban: true,
    })
  }

  unban(userid, groupid) {
    return this.$post('/memberships', {
      userid,
      groupid,
      action: 'Unban',
    })
  }

  hold(userid, groupid) {
    return this.$post('/memberships', {
      action: 'Hold',
      userid,
      groupid,
    })
  }

  release(userid, groupid) {
    return this.$post('/memberships', {
      action: 'Release',
      userid,
      groupid,
    })
  }

  reviewHold(membershipid, groupid) {
    return this.$post('/memberships', {
      action: 'ReviewHold',
      membershipid,
      groupid,
    })
  }

  reviewRelease(membershipid, groupid) {
    return this.$post('/memberships', {
      action: 'ReviewRelease',
      membershipid,
      groupid,
    })
  }

  happinessReviewed(params) {
    return this.$post('/memberships', params)
  }
}
