import BaseAPI from '@/api/BaseAPI'

export default class SocialActionsAPI extends BaseAPI {
  fetch(params) {
    return this.$getv2('/socialactions', params)
  }

  share(id, uid) {
    return this.$postv2('/socialactions', { id, uid, action: 'Do' })
  }

  hide(id, uid) {
    return this.$postv2('/socialactions', { id, uid, action: 'Hide' })
  }

  sharePopularPost(groupid, msgid) {
    return this.$postv2('/socialactions', {
      groupid,
      msgid,
      action: 'DoPopular',
    })
  }

  hidePopularPost(groupid, msgid) {
    return this.$postv2('/socialactions', {
      groupid,
      msgid,
      action: 'HidePopular',
    })
  }
}
