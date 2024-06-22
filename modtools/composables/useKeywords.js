const keywordTypeOptions = computed(() => {
  return [
    {
      value: 'Offer',
      text: 'OFFER'
      /* TODO  this.group &&
          this.group.settings &&
          this.group.settings.keywords &&
          this.group.settings.keywords.offer
          ? this.group.settings.keywords.offer
          : 'OFFER'*/
    },
    {
      value: 'Wanted',
      text: 'WANTED'
      /* TODO  this.group &&
          this.group.settings &&
          this.group.settings.keywords &&
          this.group.settings.keywords.wanted
          ? this.group.settings.keywords.wanted
          : 'WANTED'*/
    }
  ]
})

const keywordGroup = computed(() => {
  return this.myGroup(this.groupid)
})

const keywordGroupid = computed(() => {
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
})

export function setupKeywords() {
  return {
    keywordTypeOptions,
    keywordGroup, // TODO remove
    keywordGroupid // TODO remove
  }
}