<template>
  <b-row class="m-0">
    <b-col cols="0" md="3">
      <VisibleWhen :at="['lg', 'xl', 'xxl']">
        <SidebarLeft />
      </VisibleWhen>
    </b-col>
    <b-col cols="12" md="6" class="bg-white pt-4">
      <NoticeMessage v-if="!allowed" variant="warning">
        <p>
          You are not a member of any Freegle communities who have chosen to
          allow microvolunteering.
        </p>
        <p>
          If you'd like to discuss this with your Freegle volunteers, you can
          contact them from the <nuxt-link to="/help">Help</nuxt-link> page.
        </p>
      </NoticeMessage>
      <b-card-text v-else-if="!inviteAccepted">
        <h1 class="w-100">Help keep Freegle running smoothly</h1>
        <p v-if="mod" class="text-muted small">
          (This is something members see. You're seeing it too even though
          you're a mod, so you can see what it looks like to them.)
        </p>
        <p>
          <strong
            >Would you like to keep freegling smooth and safe for people? You
            can help!</strong
          >
        </p>
        <p>
          If you're up for it, we can show you the occasional thing on Freegle
          that needs checking over to make sure it's ok.
        </p>
        <p>
          It'll only take a few seconds, and you'll be helping out other people
          in the Freegle community. Plus you'll get a little "Supporter" badge,
          which other people can see, to say thank you.
        </p>
        <p>
          We'll also keep in touch by email about what's happening in Freegle
          and other ways you can support Freegle in future.
        </p>
        <div class="d-flex justify-content-between w-100 flex-wrap">
          <SpinButton
            variant="primary"
            label="Yes, I'm happy to do that"
            icon-name="save"
            size="lg"
            :handle-param="true"
            @handle="inviteResponse"
          />
          <SpinButton
            variant="secondary"
            label="No, that's not my thing"
            icon-name="save"
            size="lg"
            :handle-param="false"
            @handle="inviteResponse"
          />
        </div>
      </b-card-text>
      <b-card-text v-else>
        <NoticeMessage v-if="!showTask || !todo" variant="info">
          <p>Thanks! You're all caught up!</p>
          <div v-if="!todo">
            <p>If you're really keen:</p>
            <b-button variant="primary" class="mt-2" @click="getEvenMore"
              >Do some more!</b-button
            >
          </div>
        </NoticeMessage>
        <div v-else-if="task" :key="bump">
          <h1>
            <span class="float-end">
              <span class="small d-inline-flex justify-content-start">
                <v-icon
                  v-for="i in done"
                  :key="'hearta-' + i"
                  class="mr-1 text-danger"
                  icon="heart"
                />
                <v-icon
                  v-for="i in todo"
                  :key="'heartb-' + i"
                  class="mr-1 text-faded"
                  icon="heart"
                />
              </span>
            </span>
            <span v-if="task.type === 'CheckMessage'">
              Does this post look OK?
            </span>
            <span v-else-if="task.type === 'Invite'">
              Get more people freegling!
            </span>
            <span v-else-if="task.type === 'SearchTerm'"> Word Match </span>
            <span v-else-if="task.type === 'PhotoRotate'"> Photo Rotate </span>
          </h1>
          <div v-if="task.type === 'CheckMessage'">
            <MicroVolunteeringCheckMessage
              :id="task.msgid"
              @next="considerNext"
            />
          </div>
          <div v-else-if="task.type === 'SearchTerm'">
            <MicroVolunteeringSimilarTerms
              :term="task.terms"
              @next="considerNext"
            />
          </div>
          <div v-else-if="task.type === 'Facebook'">
            <MicroVolunteeringFacebook
              :id="task.facebook.postid"
              @next="considerNext"
            />
          </div>
          <div v-else-if="task.type === 'PhotoRotate'">
            <MicroVolunteeringPhotosRotate
              :photos="task.photos"
              @done="considerNext"
            />
          </div>
          <div v-else-if="task.type === 'Survey2'">
            <MicroVolunteeringSurvey :url="task.url" @done="considerNext" />
          </div>
          <div v-else-if="task.type === 'Invite'">
            <MicroVolunteeringInvite @next="considerNext" />
          </div>
          <div v-else>Unknown task {{ task }}</div>
        </div>
        <hr />
        <p>
          If you've changed your mind and want to stop doing this, click here:
        </p>
        <div class="d-flex justify-content-between flex-wrap w-100 mt-2">
          <b-button
            v-if="inviteAccepted"
            variant="white"
            class="mb-1"
            @click="stopIt"
          >
            Don't ask me again
          </b-button>
          <b-button variant="secondary" class="mb-1" @click="doneForNow">
            Ask again tomorrow
          </b-button>
        </div>
      </b-card-text>
    </b-col>
  </b-row>
</template>
<script setup>
import { useMicroVolunteeringStore } from '~/stores/microvolunteering'
import { useMiscStore } from '~/stores/misc'
import { useAuthStore } from '~/stores/auth'
import { ref } from '#imports'
import { useMe } from '~/composables/useMe'

const MicroVolunteeringFacebook = defineAsyncComponent(() =>
  import('~/components/MicroVolunteeringFacebook')
)
const MicroVolunteeringPhotosRotate = defineAsyncComponent(() =>
  import('~/components/MicroVolunteeringPhotosRotate')
)
const MicroVolunteeringCheckMessage = defineAsyncComponent(() =>
  import('~/components/MicroVolunteeringCheckMessage')
)
const MicroVolunteeringSimilarTerms = defineAsyncComponent(() =>
  import('~/components/MicroVolunteeringSimilarTerms')
)
const MicroVolunteeringSurvey = defineAsyncComponent(() =>
  import('~/components/MicroVolunteeringSurvey')
)
const MicroVolunteeringInvite = defineAsyncComponent(() =>
  import('~/components/MicroVolunteeringInvite')
)

definePageMeta({
  layout: 'login',
})

const microVolunteeringStore = useMicroVolunteeringStore()
const miscStore = useMiscStore()
const authStore = useAuthStore()
const debug = false

if (debug) {
  miscStore.set({
    key: 'microvolunteeringlastask',
    value: null,
  })
}

// Use me and myGroups computed properties from useMe composable for consistency
const { me, myGroups, fetchMe } = useMe()

const inviteAccepted = ref(
  me.value?.trustlevel && me.value.trustlevel !== 'Declined'
)

const allowed = ref(debug)

if (me.value) {
  // Check if we're on a group with microvolunteering enabled.
  // myGroups already destructured from useMe() above

  if (myGroups.value && myGroups.value.length) {
    myGroups.value.forEach((g) => {
      if (g.microvolunteeringallowed) {
        allowed.value = true
      }
    })
  }
}

const showTask = ref(false)
const todo = ref(5)
const done = ref(0)
const bump = ref(1)
const task = ref(null)

if (allowed.value) {
  await getTask()
}

async function getTask() {
  // Try to get a task.
  task.value = await microVolunteeringStore.challenge({
    types: ['CheckMessage', 'PhotoRotate', 'Survey2', 'Invite'],
  })

  if (task.value) {
    miscStore.set({
      key: 'microvolunteeringlastask',
      value: Date.now(),
    })

    if (task.value.type === 'CheckMessage') {
      showTask.value = true
    } else if (task.value.type === 'SearchTerm') {
      showTask.value = true
    } else if (task.value.type === 'Facebook') {
      showTask.value = true
    } else if (task.value.type === 'PhotoRotate') {
      showTask.value = true
    } else if (task.value.type === 'Survey2') {
      showTask.value = true
    } else if (task.value.type === 'Invite') {
      showTask.value = true
    }
  }

  bump.value++
}

async function stopIt() {
  miscStore.set({
    key: 'microvolunteeringinviterejected',
    value: Date.now(),
  })

  await authStore.saveMicrovolunteering('Declined')

  const router = useRouter()
  router.push('/')
}

function considerNext() {
  todo.value--
  done.value++

  if (todo.value <= 0) {
    // That's enough.
    showTask.value = false
  } else {
    getTask()
  }
}

async function inviteResponse(callback, response) {
  if (response) {
    miscStore.set({
      key: 'microvolunteeringinviteaccepted',
      value: Date.now(),
    })

    await authStore.saveMicrovolunteering('Basic')

    // The wording in here covers us for marketing consent.
    await authStore.saveAndGet({
      marketingconsent: 1,
    })

    inviteAccepted.value = true

    if (myGroups.value && myGroups.value.length) {
      myGroups.value.forEach((g) => {
        if (g.microvolunteeringallowed) {
          allowed.value = true
        }
      })
    }

    await getTask()
  } else {
    miscStore.set({
      key: 'microvolunteeringinviterejected',
      value: Date.now(),
    })

    await authStore.saveMicrovolunteering('Declined')
  }

  fetchMe(true)

  callback()
}

function doneForNow() {
  showTask.value = false

  // Snooze this until tomorrow.
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0)
  tomorrow.setMinutes(0)

  miscStore.set({
    key: 'microvolunteeringlastask',
    value: tomorrow.getTime(),
  })
}

function getEvenMore() {
  todo.value = 5
  done.value = 0

  getTask()
}
</script>
<style scoped lang="scss">
:deep(label) {
  font-weight: bold;
}
</style>
