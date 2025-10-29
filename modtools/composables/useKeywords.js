import { setupModMessages } from '~/composables/useModMessages'

const typeOptions = computed(() => {
  const { group } = setupModMessages()
  const thegroup = group.value
  return [
    {
      value: 'Offer',
      text:
        thegroup &&
        thegroup.settings &&
        thegroup.settings.keywords &&
        thegroup.settings.keywords.offer
          ? thegroup.settings.keywords.offer
          : 'OFFER',
    },
    {
      value: 'Wanted',
      text:
        thegroup &&
        thegroup.settings &&
        thegroup.settings.keywords &&
        thegroup.settings.keywords.wanted
          ? thegroup.settings.keywords.wanted
          : 'WANTED',
    },
  ]
})

/* group and groupid no longer used
const keywordGroup = computed(() => {
  return null
  return this.myGroup(groupid)
})

const keywordGroupid = computed(() => {
  return 0
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
}) */

export function setupKeywords() {
  return {
    typeOptions,
    // keywordGroup,
    // keywordGroupid
  }
}
