export default {
  computed: {
    keywordTypeOptions() {
      return [
        {
          value: 'Offer',
          text:
            this.group &&
            this.group.settings &&
            this.group.settings.keywords &&
            this.group.settings.keywords.offer
              ? this.group.settings.keywords.offer
              : 'OFFER'
        },
        {
          value: 'Wanted',
          text:
            this.group &&
            this.group.settings &&
            this.group.settings.keywords &&
            this.group.settings.keywords.wanted
              ? this.group.settings.keywords.wanted
              : 'WANTED'
        }
      ]
    },
    keywordGroup() {
      return this.myGroup(this.groupid)
    },
    keywordGroupid() {
      let ret = null

      if (this.member) {
        ret = this.member.groupid
      } else if (
        this.message &&
        this.message.groups &&
        this.message.groups.length
      ) {
        ret = this.message.groups[0].groupid
      }

      return ret
    }
  }
}