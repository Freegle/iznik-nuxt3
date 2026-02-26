import BaseAPI from '@/api/BaseAPI'

export default class ExportAPI extends BaseAPI {
  create() {
    return this.$postv2('/export', { dup: Date.now() })
  }

  status(id, tag) {
    return this.$getv2('/export', { id, tag })
  }
}
