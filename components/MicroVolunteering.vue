<template>
  <div id="microvolunteering">
    <client-only v-if="me">
      <b-modal
        v-model="showInvite"
        scrollable
        variant="info"
        size="lg"
        no-stacking
        no-fade
      >
        <template #header>
          <h1 class="w-100">Help keep Freegle running smoothly</h1>
        </template>
        <template #default>
          <b-card-text>
            <p v-if="mod" class="text-muted small">
              (This is something members see. You're seeing it too even though
              you're a mod, so you can see what it looks like to them.)
            </p>
            <p>
              <strong
                >Would you like to keep freegling smooth and safe for people?
                You can help!</strong
              >
            </p>
            <p>
              If you're up for it, we can show you the occasional thing on
              Freegle that needs checking over to make sure it's ok.
            </p>
            <p>
              It'll only take a few seconds, and you'll be helping out other
              people in the Freegle community. Plus you'll get a little
              "Supporter" badge, which other people can see, to say thank you.
            </p>
            <p>
              We'll also keep in touch by email about what's happening in
              Freegle and other ways you can support Freegle in future.
            </p>
          </b-card-text>
        </template>
        <template #footer>
          <div class="d-flex justify-content-between w-100 flex-wrap">
            <b-button
              variant="primary"
              class="mb-1"
              @click="inviteResponse(true)"
            >
              Yes, I'm happy to do that
            </b-button>
            <b-button
              variant="secondary"
              class="mb-1"
              @click="inviteResponse(false)"
            >
              No, that's not my thing
            </b-button>
          </div>
        </template>
      </b-modal>
      <b-modal
        v-model="showTask"
        scrollable
        variant="info"
        size="lg"
        :no-close-on-backdrop="force"
        :hide-header-close="force"
        :no-close-on-esc="force"
        no-fade
      >
        <template #header>
          <div class="d-flex flex-column w-100">
            <div v-if="task">
              <h1 class="header--size3 w-100">
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
                <span v-else-if="task.type === 'SearchTerm'"> Word Match </span>
                <span v-else-if="task.type === 'PhotoRotate'">
                  Photo Rotate
                </span>
              </h1>
              <div class="font-weight-bold">
                These little things help Freegle run smoothly. Thank you!
              </div>
            </div>
          </div>
        </template>
        <template #default>
          <b-card-text>
            <p v-if="mod" class="text-muted small">
              (This is something members see. You're seeing it too even though
              you're a mod, so you can see what it looks like to them.)
            </p>
            <div v-if="task" :key="bump">
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
              <div v-else-if="task.type === 'Survey'">
                <MicroVolunteeringSurvey @done="considerNext" />
              </div>
              <div v-else>Unknown task {{ task }}</div>
            </div>
          </b-card-text>
        </template>
        <template v-if="!force" #footer>
          <div class="d-flex justify-content-between flex-wrap w-100">
            <b-button
              v-if="inviteAccepted && !force"
              variant="link"
              class="mb-1"
              @click="stopIt"
            >
              Don't ask me again
            </b-button>
            <b-button variant="secondary" class="mb-1" @click="doneForNow">
              Ask again tomorrow
            </b-button>
          </div>
        </template>
      </b-modal>
    </client-only>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import { useMicroVolunteeringStore } from '../stores/microvolunteering'
import { useMiscStore } from '../stores/misc'
import { useAuthStore } from '../stores/auth'
import { ref } from '#imports'

const MicroVolunteeringFacebook = defineAsyncComponent(() =>
  import('./MicroVolunteeringFacebook')
)
const MicroVolunteeringPhotosRotate = defineAsyncComponent(() =>
  import('./MicroVolunteeringPhotosRotate')
)
const MicroVolunteeringCheckMessage = defineAsyncComponent(() =>
  import('./MicroVolunteeringCheckMessage')
)
const MicroVolunteeringSimilarTerms = defineAsyncComponent(() =>
  import('./MicroVolunteeringSimilarTerms')
)
const MicroVolunteeringSurvey = defineAsyncComponent(() =>
  import('./MicroVolunteeringSurvey')
)

export default {
  components: {
    MicroVolunteeringCheckMessage,
    MicroVolunteeringPhotosRotate,
    MicroVolunteeringSimilarTerms,
    MicroVolunteeringFacebook,
    MicroVolunteeringSurvey,
  },
  props: {
    force: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props, { emit }) {
    const microVolunteeringStore = useMicroVolunteeringStore()
    const miscStore = useMiscStore()
    const authStore = useAuthStore()
    const debug = true

    if (debug) {
      miscStore.set({
        key: 'microvolunteeringlastask',
        value: null,
      })
    }

    const me = authStore.user

    const showInvite = ref(false)
    const fetchTask = ref(false)
    const inviteAccepted = computed(() => {
      return me?.trustlevel && me.trustlevel !== 'Declined'
    })

    if (me) {
      const now = dayjs()
      const daysago = now.diff(dayjs(me.added), 'days')

      // Ask no more than once per hour.  Only want to ask if we're logged in, because otherwise a) we don't know if we've
      // already declined and b) we couldn't save a decline.
      const lastAsk = miscStore.get('microvolunteeringlastask')
      const askDue =
        !lastAsk || Date.now() - new Date(lastAsk).getTime() > 60 * 60 * 1000

      // Check if we're on a group with microvolunteering enabled.
      let allowed = false
      authStore.groups.forEach((g) => {
        if (g.microvolunteeringallowed) {
          allowed = true
        }
      })

      if (!allowed) {
        // Not on a group with this function enabled.
      } else if (!askDue) {
        // Challenged recently, so return verified.  That's true even for if it's forced - we don't want to bombard
        // people.
        emit('verified')
      } else if (props.force) {
        // Forced.  Get task in mounted().
        fetchTask.value = true
      } else if (daysago > 7) {
        // They're not a new member.  We might want to ask them.
        if (me?.trustlevel === 'Declined') {
          // We're not forced to do this, and they've said they don't want to.
          emit('verified')
        } else if (inviteAccepted.value) {
          // They're up for this.  Get a task in mounted().
          fetchTask.value = true
        } else {
          // We don't know if they want to.  Ask.
          showInvite.value = true
        }
      }
    }

    return {
      authStore,
      microVolunteeringStore,
      miscStore,
      showInvite,
      fetchTask,
      inviteAccepted,
    }
  },
  data() {
    return {
      maybeShow: false,
      showTask: false,
      task: null,
      message: null,
      todo: 5,
      done: 0,
      types: ['CheckMessage', 'PhotoRotate', 'Survey'],
      bump: 1,
    }
  },
  async mounted() {
    if (this.fetchTask) {
      await this.getTask()
    }

    this.maybeShow = this.showInvite
  },
  methods: {
    async getTask() {
      // Try to get a task.
      this.task = await this.microVolunteeringStore.challenge({
        types: this.types,
      })

      if (this.task) {
        this.miscStore.set({
          key: 'microvolunteeringlastask',
          value: Date.now(),
        })

        if (this.task.type === 'CheckMessage') {
          this.showTask = true
        } else if (this.task.type === 'SearchTerm') {
          this.showTask = true
        } else if (this.task.type === 'Facebook') {
          this.showTask = true
        } else if (this.task.type === 'PhotoRotate') {
          this.showTask = true
        } else if (this.task.type === 'Survey') {
          this.showTask = true
        } else {
          this.doneForNow()
        }

        console.log('Show?', this.showTask)
      } else {
        // Nothing to do.
        this.doneForNow()
      }

      this.bump++
    },
    async stopIt() {
      this.miscStore.set({
        key: 'microvolunteeringinviterejected',
        value: Date.now(),
      })

      await this.authStore.saveMicrovolunteering('Declined')

      this.doneForNow()
    },
    considerNext() {
      this.todo--
      this.done++

      if (this.todo <= 0) {
        this.doneForNow()
      } else {
        this.getTask()
      }
    },
    async inviteResponse(response) {
      if (response) {
        this.miscStore.set({
          key: 'microvolunteeringinviteaccepted',
          value: Date.now(),
        })

        await this.authStore.saveMicrovolunteering('Basic')

        // The wording in here covers us for marketing consent.
        await this.authStore.saveAndGet({
          marketingconsent: 1,
        })

        await this.getTask()
      } else {
        this.miscStore.set({
          key: 'microvolunteeringinviterejected',
          value: Date.now(),
        })

        await this.authStore.saveMicrovolunteering('Declined')
      }

      this.fetchMe() // TODO ['me', 'groups']

      this.showInvite = false
    },
    doneForNow() {
      this.showTask = false
      this.$emit('verified')

      // Snooze this until tomorrow.
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0)
      tomorrow.setMinutes(0)

      this.miscStore.set({
        key: 'microvolunteeringlastask',
        value: Date.now(),
      })
    },
  },
}
</script>
<style scoped lang="scss">
:deep(label) {
  font-weight: bold;
}
</style>
