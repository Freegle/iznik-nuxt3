import BaseAPI from '@/api/BaseAPI'

export default class ConfigAPI extends BaseAPI {
  fetchv2(key) {
    return this.$getv2('/config/' + key)
  }

  // Admin config endpoints
  fetchAdminv2(key) {
    return this.$getv2('/config/admin/' + key)
  }

  patchAdminv2(data) {
    return this.$postOverride('PATCH', '/config/admin', data)
  }

  // Individual worry word management
  addWorrywordv2(data) {
    return this.$postv2('/config/admin/worry_words', data)
  }

  deleteWorrywordv2(id) {
    return this.$requestv2('DELETE', `/config/admin/worry_words/${id}`, {})
  }

  // Individual spam keyword management
  addSpamKeywordv2(data) {
    return this.$postv2('/config/admin/spam_keywords', data)
  }

  deleteSpamKeywordv2(id) {
    return this.$requestv2('DELETE', `/config/admin/spam_keywords/${id}`, {})
  }
}
