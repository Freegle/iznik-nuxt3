<template>
  <b-card no-body>
    <b-card-body>
      <b-row>
        <b-col cols="12" md="6">
          <ModMember :member="user1" />
        </b-col>
        <b-col cols="12" md="6">
          <ModMember :member="user2" />
        </b-col>
      </b-row>
      <div class="d-flex flex-wrap justify-content-start pills mt-2">
        <b-button v-if="whichposted === 'Both'" variant="warning" class="mr-1">
          Posted: {{ whichposted }}
        </b-button>
        <b-button v-else variant="white" class="mr-1">
          Posted: {{ whichposted }}
        </b-button>
        <b-button variant="white" class="mr-1">
          Joined a group: {{ whichjoined }}
        </b-button>
        <b-button v-if="activeSameDay" variant="secondary" class="mr-1">
          Active same day
        </b-button>
        <b-button v-if="similarNameOrEmail" variant="secondary" class="mr-1">
          Similar name/email
        </b-button>
        <b-button v-if="groupsInCommon" variant="secondary" class="mr-1">
          Groups in common
        </b-button>
        <b-button v-if="probablySame" variant="primary" class="mr-1">
          Probably the same
        </b-button>
      </div>
    </b-card-body>
    <b-card-footer>
      <div class="mt-2">
        <b-button variant="secondary" @click="ask">
          Ask member what they want
        </b-button>
        <b-button variant="white" @click="ignore"> Ignore </b-button>
      </div>
    </b-card-footer>
  </b-card>
</template>
<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { useMemberStore } from '~/stores/member'

const LONG_THRESHOLD = 4

const props = defineProps({
  member: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['processed'])

const memberStore = useMemberStore()

function posted(member) {
  return member.messagehistory && member.messagehistory.length
}

function isMember(member) {
  return member.memberof && member.memberof.length
}

function count(l, r) {
  if (l && r) {
    return 'Both'
  } else if (l) {
    return 'First only'
  } else if (r) {
    return 'Second only'
  } else {
    return 'Neither'
  }
}

function getEmail(member) {
  // Depending on which context we're used it, we might or might not have an email returned.
  let ret = member.email

  if (!member.email && member.emails) {
    member.emails.forEach((e) => {
      if (!e.ourdomain && (!ret || e.preferred)) {
        ret = e.email
      }
    })
  }

  return ret
}

function findLongest(str1, str2) {
  // From https://codereview.stackexchange.com/questions/210940/find-longest-common-string-subsequence
  const s1 = str1 + ''
  const s2 = str2 + ''

  const removeDistinct = (a, b) =>
    a
      .split('')
      // eslint-disable-next-line array-callback-return
      .filter((c) => {
        ;(b + '').includes(c)
      })
      .join('')
  const findFirstSeq = (a, b) => {
    let seq = ''
    let i
    let j = 0
    for (i = 0; i < a.length; i++) {
      const c = a[i]
      while (j++ < b.length) {
        if (seq.length + (b.length - j - 2) < max) {
          return ''
        }
        if (c === b[j - 1]) {
          seq += c
          break
        }
      }
    }
    return seq
  }
  const findSubseq = (a, b) => {
    if (b.length <= max || a.length <= max) {
      return maxSeq
    }
    while (a.length && a.length > max) {
      const seq = findFirstSeq(a, b)
      if (seq.length > max) {
        max = seq.length
        a = a.slice(max)
        maxSeq = seq
      } else {
        a = a.slice(1)
      }
    }
    return maxSeq
  }

  let max = 0
  let maxSeq
  if (s1 === s2) {
    return s1.length
  }
  const s1D = removeDistinct(s1, s2)
  const s2D = removeDistinct(s2, s1)
  if (s1D && s2D) {
    if (s1D === s2D) {
      return s1D.length
    }

    findSubseq(s1D, s2D)
    const ret = findSubseq(s2D, s1D)
    return ret ? ret.length : 0
  } else {
    return 0
  }
}

const user1 = computed(() => {
  const m1 = new Date(props.member.lastaccess)
  const m2 = new Date(props.member.relatedto.lastaccess)

  return m1 > m2 ? props.member : props.member.relatedto
})

const user2 = computed(() => {
  const m1 = new Date(props.member.lastaccess)
  const m2 = new Date(props.member.relatedto.lastaccess)

  return m1 <= m2 ? props.member : props.member.relatedto
})

const posted1 = computed(() => posted(user1.value))
const posted2 = computed(() => posted(user2.value))
const whichposted = computed(() => count(posted1.value, posted2.value))

const joined1 = computed(() => isMember(user1.value))
const joined2 = computed(() => isMember(user2.value))
const whichjoined = computed(() => count(joined1.value, joined2.value))

const activeSameDay = computed(() => {
  return dayjs(user1.value.lastaccess).isSame(
    dayjs(user2.value.lastaccess),
    'day'
  )
})

const groupsInCommon = computed(() => {
  const common = user1.value.memberof.filter((group) => {
    const gid = group.id
    let found = false

    user2.value.memberof.forEach((group2) => {
      if (group2.id === gid) {
        found = true
      }
    })

    return found
  })

  return common && common.length
})

const similarNameOrEmail = computed(() => {
  let ret = false
  let e1 = getEmail(user1.value)
  let e2 = getEmail(user2.value)

  if (e1 && e2) {
    e1 = e1.substring(e1, e1.indexOf('@'))
    e2 = e2.substring(e2, e2.indexOf('@'))

    if (e1 && e2 && findLongest(e1, e2) >= LONG_THRESHOLD) {
      ret = true
    }
  }

  const n1 = user1.value.displayname
  const n2 = user2.value.displayname

  if (n1 && n2 && findLongest(n1, n2) >= LONG_THRESHOLD) {
    ret = true
  }

  return ret
})

const probablySame = computed(() => {
  return (
    similarNameOrEmail.value && (groupsInCommon.value || activeSameDay.value)
  )
})

function updateWork() {
  emit('processed')
}

async function ask() {
  await memberStore.askMerge(props.member.id, {
    user1: user1.value.id,
    user2: user2.value.id,
  })

  updateWork()
}

async function ignore() {
  await memberStore.ignoreMerge(props.member.id, {
    user1: user1.value.id,
    user2: user2.value.id,
  })

  updateWork()
}
</script>
<style scoped>
.pills .btn {
  border-radius: 20px;
}

.pills .btn:hover {
  color: black !important;
  background-color: white !important;
}
</style>
