import BaseAPI from '@/api/BaseAPI'

export default class MessageAPI extends BaseAPI {
  fetch(id, logError = true) {
    return this.$getv2('/message/' + id, {}, logError)
  }
  fetchMT(params, logError = true) {
    return this.$get('/message', params, logError)
  }

  fetchByUser(id, active, logError = true) {
    return this.$getv2(
      '/user/' + id + '/message',
      {
        active: active ? 'true' : 'false',
      },
      logError
    )
  }

  inbounds(swlat, swlng, nelat, nelng, groupid, limit) {
    return this.$getv2('/message/inbounds', {
      swlat,
      swlng,
      nelat,
      nelng,
      groupid,
      limit,
    })
  }

  search(params) {
    return this.$getv2(
      '/message/search/' + encodeURIComponent(params.search),
      params
    )
  }

  mygroups(gid) {
    return this.$getv2('/message/mygroups' + (gid ? '/' + gid : ''))
  }

  fetchMessages(params) {
    return this.$get('/messages', params)
  }

  update(event) {
    return this.$post('/message', event)
  }

  save(event) {
    return this.$patch('/message', event)
  }

  joinAndPost(id, email, logError = true) {
    return this.$post(
      '/message',
      { id, email, action: 'JoinAndPost' },
      logError
    )
  }

  del(id) {
    return this.$del('/message', { id })
  }

  put(data) {
    return this.$put('/message', data)
  }

  intend(id, outcome) {
    return this.$post('/message', {
      action: 'OutcomeIntended',
      id,
      outcome,
    })
  }

  view(id) {
    return this.$post('/message', {
      action: 'View',
      id,
    })
  }

  approve(id, groupid, subject = null, stdmsgid = null, body = null) {
    return this.$post('/message', {
      action: 'Approve',
      id,
      groupid,
      subject,
      stdmsgid,
      body,
    })
  }

  reply(id, groupid, subject = null, stdmsgid = null, body = null) {
    return this.$post('/message', {
      action: 'Reply',
      id,
      groupid,
      subject,
      stdmsgid,
      body,
    })
  }

  reject(id, groupid, subject = null, stdmsgid = null, body = null) {
    return this.$post('/message', {
      action: 'Reject',
      id,
      groupid,
      subject,
      stdmsgid,
      body,
    })
  }

  delete(id, groupid, subject = null, stdmsgid = null, body = null) {
    return this.$post('/message', {
      action: 'Delete',
      id,
      groupid,
      subject,
      stdmsgid,
      body,
    })
  }

  spam(id, groupid) {
    return this.$post('/message', {
      action: 'Spam',
      id,
      groupid,
    })
  }

  hold(id) {
    return this.$post('/message', {
      action: 'Hold',
      id,
    })
  }

  release(id) {
    return this.$post('/message', {
      action: 'Release',
      id,
    })
  }

  approveEdits(id) {
    return this.$post('/message', {
      action: 'ApproveEdits',
      id,
    })
  }

  revertEdits(id) {
    return this.$post('/message', {
      action: 'RevertEdits',
      id,
    })
  }

  partnerConsent(id, partner) {
    return this.$post('/message', {
      action: 'PartnerConsent',
      id,
      partner,
    })
  }

  addBy(id, userid, count) {
    return this.$post('/message', {
      action: 'AddBy',
      id,
      userid,
      count,
    })
  }

  removeBy(id, userid) {
    return this.$post('/message', {
      action: 'RemoveBy',
      id,
      userid,
    })
  }

  async count(browseView, log) {
    return await this.$getv2(
      '/message/count',
      {
        browseView,
      },
      log
    )
  }

  async markSeen(ids) {
    return await this.$post('/messages', {
      action: 'MarkSeen',
      ids,
    })
  }
}
