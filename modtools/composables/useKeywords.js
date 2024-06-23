import { setupModMessages } from '../composables/useModMessages'

const keywordTypeOptions = computed(() => {
  const { group } = setupModMessages()
  const thegroup = group.value
  return [
    {
      value: 'Offer',
      text: thegroup &&
        thegroup.settings &&
        thegroup.settings.keywords &&
        thegroup.settings.keywords.offer
        ? thegroup.settings.keywords.offer
        : 'OFFER'
    },
    {
      value: 'Wanted',
      text: thegroup &&
        thegroup.settings &&
        thegroup.settings.keywords &&
        thegroup.settings.keywords.wanted
        ? thegroup.settings.keywords.wanted
        : 'WANTED'
    }
  ]
})

/*const keywordGroup = computed(() => {
  console.log('TODO: keywordGroup as above')
  return null
  return this.myGroup(groupid)
})

const keywordGroupid = computed(() => {
  console.log('TODO: keywordGroupid as above')
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
})*/

export function setupKeywords() {

  return {
    keywordTypeOptions,
    // TODO keywordGroup,
    // TODO keywordGroupid
  }
}