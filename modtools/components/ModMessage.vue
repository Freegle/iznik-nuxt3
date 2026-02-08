<template>
  <div>
    <div ref="top" style="position: relative; top: -66px" />
    <b-card bg-variant="white" no-body>
      <b-card-header class="p-1 p-md-2">
        <div class="d-flex justify-content-between">
          <div class="flex-grow-1">
            <NoticeMessage
              v-if="editing && !message.lat && !message.lng"
              variant="danger"
              class="mb-2 mr-2"
            >
              This message needs editing so that we know where it is. Please put
              in a postcode (it doesn't have to be exactly right - do your best
              based on the subject).
              <b-input-group>
                <PostCode
                  class="mt-2"
                  value=""
                  :find="false"
                  @selected="postcodeSelect"
                />
              </b-input-group>
            </NoticeMessage>
            <div v-if="editing && editmessage" class="d-flex flex-wrap">
              <ModGroupSelect
                v-model="editgroup"
                modonly
                class="mr-1"
                size="lg"
                :disabled-except-for="memberGroupIds"
                :disabled="editmessage.fromuser?.tnuserid"
              />
              <div
                v-if="editmessage.item && editmessage.location"
                class="d-flex justify-content-start"
              >
                <b-form-select
                  v-model="editmessage.type"
                  :options="typeOptions"
                  class="type mr-1"
                  size="lg"
                />
                <b-form-input
                  v-model="editmessage.item.name"
                  size="lg"
                  class="mr-1"
                />
              </div>
              <div v-if="editmessage.item && editmessage.location">
                <b-input-group>
                  <PostCode
                    :value="editmessage.location.name"
                    :find="false"
                    @selected="postcodeSelect"
                  />
                </b-input-group>
              </div>
              <div
                v-else
                class="flex-grow-1 pl-0 pl-md-2 pr-0 pr-md-2 fullsubject"
              >
                <label class="mr-2">Subject:</label>
                <b-form-input v-model="editmessage.subject" size="lg" />
                <label class="mr-2">Post type:</label>
                <b-form-select
                  v-model="editmessage.type"
                  :options="typeOptions"
                  class="type mr-1"
                  size="lg"
                />
              </div>
            </div>
            <ModDiff
              v-else-if="editreview && oldSubject && newSubject"
              :old="oldSubject"
              :new="newSubject"
              class="font-weight-bold"
            />
            <div v-else :class="subjectClass + ' font-weight-bold'">
              <Highlighter
                v-if="message.matchedon"
                :search-words="[message.matchedon.word]"
                :text-to-highlight="eSubject"
                highlight-class-name="highlight"
                auto-escape
              />
              <span v-else>
                {{ eSubject }}
              </span>
              <span v-if="message.location" class="text-muted small ms-1">{{
                message.location.name
              }}</span>
              <span
                v-if="
                  message.availableinitially && message.availableinitially > 1
                "
                class="small text-info"
              >
                <b-badge
                  v-if="message.availableinitially === message.availablenow"
                  variant="info"
                >
                  {{ message.availablenow }} available
                </b-badge>
                <b-badge v-else variant="info">
                  {{ message.availableinitially }} available initially,
                  {{ message.availablenow ? message.availablenow : 0 }} now
                </b-badge>
              </span>
            </div>
            <div v-if="message.deadline" class="text-danger small">
              Deadline: end {{ dateonly(message.deadline) }}
            </div>
            <div v-if="message.deliverypossible" class="text-info small">
              Delivery possible
            </div>
            <MessageHistory
              :id="message.id"
              :message="message"
              modinfo
              display-message-link
            />
            <div
              v-if="
                homegroup &&
                message &&
                message.groups &&
                message.groups.length &&
                homegroup !== message.groups[0].namedisplay
              "
              class="small text-danger"
            >
              Possibly should be on {{ homegroup }}
              <span v-if="!homegroupontn"> but group not on TN </span>
            </div>
            <ModMessageDuplicate
              v-for="(duplicate, index) in duplicates"
              :key="'duplicate-' + duplicate.id + '-' + index"
              :message="duplicate"
            />
            <ModMessageCrosspost
              v-for="crosspost in crossposts"
              :key="'crosspost-' + crosspost.id"
              :message="crosspost"
            />
            <div v-if="expanded">
              <ModMessageRelated
                v-for="related in message.related"
                :key="'related-' + related.id"
                :message="related"
              />
            </div>
          </div>
          <div class="d-flex">
            <div
              v-if="summary && message && message.fromuser"
              class="text-info font-weight-bold mr-2"
            >
              {{ message.fromuser.displayname }}
            </div>
            <div v-if="expanded" class="d-flex">
              <div class="d-flex flex-column align-content-end">
                <b-button v-if="!editing" variant="white" @click="startEdit">
                  <v-icon icon="pen" /><span class="d-none d-sm-inline">
                    Edit</span
                  >
                </b-button>
                <b-button
                  v-if="message.source === 'Email'"
                  variant="white"
                  class="mt-2"
                  @click="showEmailSourceModal = true"
                >
                  <v-icon icon="book-open" /><span class="d-none d-sm-inline">
                    View Email Source</span
                  >
                </b-button>
                <SpinButton
                  v-if="message.groups[0].collection === 'Approved'"
                  class="mt-2"
                  variant="white"
                  icon-name="reply"
                  label="Back to Pending"
                  confirm
                  @handle="backToPending"
                />
              </div>
              <div class="ml-2">
                <b-button
                  v-if="summary"
                  variant="white"
                  @click="expanded = !expanded"
                >
                  <v-icon icon="caret-up" />
                </b-button>
              </div>
            </div>
            <div v-else>
              <b-button variant="white" @click="expanded = !expanded">
                <v-icon icon="caret-down" />
              </b-button>
            </div>
          </div>
        </div>
      </b-card-header>
      <b-card-body v-if="expanded" class="p-1 p-md-2">
        <b-row>
          <b-col cols="12" lg="5">
            <NoticeMessage
              v-if="message.type === 'Other'"
              variant="danger"
              class="mb-2"
            >
              This message needs editing so that we know what kind of post it
              is.
            </NoticeMessage>
            <div v-if="expanded">
              <NoticeMessage
                v-if="message.outcomes && message.outcomes.length"
                class="mb-1"
              >
                {{ message.outcomes[0].outcome.toUpperCase() }}
                at
                {{ datetimeshort(message.outcomes[0].timestamp) }}
              </NoticeMessage>
              <div v-if="message.heldby">
                <NoticeMessage variant="warning" class="mb-2">
                  <p v-if="me.id === message.heldby.id">
                    You held this. Other people will see a warning to check with
                    you before releasing it. If you release it, it will stay in
                    Pending.
                  </p>
                  <p v-else>
                    Held by <strong>{{ message.heldby.displayname }}</strong
                    >. Please check with them before releasing it.
                  </p>
                  <ModMessageButton
                    :message="message"
                    variant="warning"
                    icon="play"
                    release
                    label="Release"
                  />
                </NoticeMessage>
              </div>
            </div>
            <div v-if="message.fromuser">
              <ModComments
                :user="message.fromuser"
                @update-comments="updateComments"
              />
              <ModSpammer
                v-if="message.fromuser.spammer"
                :user="message.fromuser"
              />
              <NoticeMessage
                v-if="message.fromuser.activedistance > 50"
                variant="warning"
                class="mb-2"
              >
                This freegler recently active on groups
                {{ message.fromuser.activedistance }} miles apart.
              </NoticeMessage>
            </div>
            <NoticeMessage v-if="outsideUK" variant="warning" class="mb-2">
              This message may be from outside the UK ({{ position.lat }},
              {{ position.lng }}), which means it might be a scam. Please check
              carefully.
            </NoticeMessage>
            <NoticeMessage
              v-if="message.spamreason"
              variant="warning"
              class="mb-2"
            >
              {{ message.spamreason }}
            </NoticeMessage>
            <div
              v-if="
                message.microvolunteering && message.microvolunteering.length
              "
            >
              <ModMessageMicroVolunteering
                v-for="m in message.microvolunteering"
                :key="'microvolunteering-' + m.id"
                :message="message"
                :microvolunteering="m"
                class="mb-1"
              />
              <b-button
                v-if="pending"
                v-b-tooltip.html
                variant="white"
                size="sm"
                title="<p>We ask members to review messages as part of microvolunteering.  When members have proven that they are reliable at microvolunteering, they may be shown Pending messages, so you may see their views here.  This can also show for Pending messages for reposts. <p>You can control whether specific members can do microvolunteering - click on their user id.</p>"
              >
                <v-icon icon="info-circle" /> What's this?
              </b-button>
              <b-button
                v-else
                v-b-tooltip.html
                variant="white"
                size="sm"
                title="<p>We ask members to review messages as part of microvolunteering.  Messages will be sent for review if a couple of members think they shouldn't be on Freegle.</p><p>Consider whether you (or the original poster) can edit the message to improve it.</p><p>You can control whether specific members can do microvolunteering - click on their user id.</p>"
              >
                <v-icon icon="info-circle" /> What's this?
              </b-button>
              <p class="text-muted small" />
            </div>
            <ModMessageWorry v-if="message.worry" :message="message" />
            <div v-if="expanded">
              <!-- eslint-disable-next-line -->
              <b-form-textarea v-if="editing" v-model="message.textbody" rows="8" class="mb-3" />
              <div v-else-if="editreview">
                <h4>Differences:</h4>
                <ModDiff
                  class="mb-3 rounded border border-warning p-2 preline forcebreak font-weight-bold"
                  :old="oldBody"
                  :new="newBody"
                />
                <h4>New version:</h4>
                <div
                  class="mb-3 rounded border border-success p-2 preline forcebreak font-weight-bold"
                >
                  {{ newBody }}
                </div>
              </div>
              <div
                v-else-if="!eBody"
                class="mb-3 rounded border p-2 preline forcebreak font-weight-bold"
              >
                <em>This message is blank.</em>
              </div>
              <div
                v-else
                class="mb-3 rounded border p-2 preline forcebreak font-weight-bold"
              >
                <Highlighter
                  v-if="message.matchedon"
                  :search-words="[message.matchedon.word]"
                  :text-to-highlight="eBody"
                  highlight-class-name="highlight"
                  auto-escape
                />
                <span v-else>
                  {{ eBody }}
                </span>
              </div>
              <div v-if="attachments?.length" class="w-100 d-flex flex-wrap">
                <div
                  v-for="attachment in attachments"
                  :key="'attachment-' + attachment.id"
                  :class="{
                    'd-inline': true,
                    'pr-1': true,
                    addedImage: imageAdded(attachment.id),
                    removeImage: imageRemoved(attachment.id),
                  }"
                >
                  <div class="addedMessage pl-2 font-weight-bold text-success">
                    Added
                  </div>
                  <div
                    class="removedMessage pl-2 font-weight-bold text-warning"
                  >
                    Removed
                  </div>
                  <ModPhoto :message="message" :attachment="attachment" />
                </div>
              </div>
              <MessageReplyInfo
                v-if="!pending || (message.replies && message.replies.length)"
                :message="message"
                class="d-inline"
              />
            </div>
          </b-col>
          <b-col cols="12" lg="3">
            <MessageMap
              v-if="group && position"
              :centerat="{ lat: group.lat, lng: group.lng }"
              :position="{ lat: position.lat, lng: position.lng }"
              locked
              :boundary="group.polygon"
              :height="150"
            />
          </b-col>
          <b-col cols="12" lg="3">
            <div
              class="rounded border border-info p-2 d-flex justify-content-between flex-wrap"
            >
              <ModMessageUserInfo
                v-if="
                  message.fromuser && message.groups && message.groups.length
                "
                :message="message"
                :user="message.fromuser"
                modinfo
                :groupid="message.groups[0].groupid"
              />
              <div v-else>
                <NoticeMessage
                  v-if="
                    message.myrole === 'Non-member' ||
                    message.myrole === 'Member'
                  "
                  variant="danger"
                >
                  Sender only available to mods.
                </NoticeMessage>
                <NoticeMessage v-else variant="danger">
                  Can't identify sender. Could have been purged but perhaps a
                  bug.
                </NoticeMessage>
              </div>
            </div>
            <div class="d-flex justify-content-between flex-wrap">
              <b-button
                v-if="
                  message.fromuser &&
                  !message.fromuser.ljuserid &&
                  !message.fromuser.tnuserid
                "
                variant="link"
                @click="toggleMail"
              >
                <span v-if="showMailSettings">
                  <v-icon icon="cog" />
                  <span class="d-inline d-sm-none"> Hide </span>
                  <span class="d-none d-sm-inline"> Hide mail settings </span>
                </span>
                <span v-else>
                  <v-icon icon="cog" />
                  <span class="d-inline d-sm-none"> Settings </span>
                  <span class="d-none d-sm-inline"> Show mail settings </span>
                </span>
              </b-button>
              <b-button
                v-if="
                  message.fromuser &&
                  message.fromuser.emails &&
                  message.fromuser.emails.length
                "
                variant="link"
                @click="showEmails = !showEmails"
              >
                <span v-if="showEmails">
                  <span class="d-inline d-sm-none"> Hide </span>
                  <span class="d-none d-sm-inline">
                    Hide
                    {{
                      pluralise('email', message.fromuser.emails.length, true)
                    }}
                  </span>
                </span>
                <span v-else>
                  <span class="d-inline d-sm-none">
                    <v-icon icon="envelope" />
                    {{
                      pluralise('email', message.fromuser.emails.length, true)
                    }}
                  </span>
                  <span class="d-none d-sm-inline">
                    Show
                    {{
                      pluralise('email', message.fromuser.emails.length, true)
                    }}
                  </span>
                </span>
              </b-button>
              <b-button variant="link" @click="showActions = !showActions">
                <v-icon icon="hammer" />
                <span v-if="showActions">
                  <span class="d-inline d-sm-none"> Hide </span>
                  <span class="d-none d-sm-inline"> Hide actions </span>
                </span>
                <span v-else>
                  <span class="d-inline d-sm-none"> Actions </span>
                  <span class="d-none d-sm-inline"> Show actions </span>
                </span>
              </b-button>
            </div>
            <SettingsGroup
              v-if="
                showMailSettings &&
                membership &&
                message.groups &&
                message.groups.length
              "
              :emailfrequency="membership.emailfrequency"
              :membership-m-t="membership"
              class="border border-info mt-2 p-1"
              :userid="message.fromuser.id"
              @update:emailfrequency="settingsChange('emailfrequency', $event)"
              @update:eventsallowed="settingsChange('eventsallowed', $event)"
              @update:volunteeringallowed="
                settingsChange('volunteeringallowed', $event)
              "
            />
            <div v-if="showEmails">
              <div v-for="email in message.fromuser.emails" :key="email.id">
                {{ email.email }} <v-icon v-if="email.preferred" icon="star" />
              </div>
            </div>
            <ModMemberActions
              v-if="showActions && message.groups && message.groups.length"
              :userid="message.fromuser.id"
              :groupid="message.groups[0].groupid"
              @commentadded="updateComments"
            />
          </b-col>
        </b-row>
        <div
          v-if="review && message.groups && message.groups.length"
          class="mt-1"
        >
          <b-alert
            v-if="message.groups[0].collection === 'Pending'"
            variant="info"
            show
          >
            <v-icon icon="info-circle" /> Post now in <em>Pending</em>.
          </b-alert>
          <b-alert
            v-if="message.groups[0].collection === 'Approved'"
            variant="info"
            show
          >
            <v-icon icon="info-circle" /> Post now in <em>Approved</em>.
          </b-alert>
        </div>
        <b-row v-if="uploading" class="bg-white">
          <b-col class="p-0">
            <OurUploader v-model="attachments" type="Message" multiple />
          </b-col>
        </b-row>
      </b-card-body>
      <b-card-footer v-if="!noactions && expanded">
        <div v-if="message.heldby && message.heldby.id !== myid">
          This message is held by someone else. The buttons are hidden so you
          don't click them by accident. Please check with them before releasing
          the message.
        </div>
        <NoticeMessage
          v-else-if="!editing && !message.lat && !message.lng"
          variant="danger"
          class="mb-2"
        >
          This message needs editing so that we know where it is.
        </NoticeMessage>
        <div
          v-if="
            pending &&
            (!message.heldby ||
              (message.heldby && message.heldby.id === myid)) &&
            !editing
          "
          class="text-end mb-1"
        >
          <b-button variant="danger" @click="spamReport">
            <v-icon icon="ban" /> Report Spammer
          </b-button>
        </div>
        <ModMessageButtons
          v-if="
            (!message.heldby ||
              (message.heldby && message.heldby.id === myid)) &&
            !editing
          "
          :message="message"
          :modconfig="modconfig"
          :editreview="editreview"
          :cantpost="membership && membership.ourpostingstatus === 'PROHIBITED'"
        />
        <b-button
          v-if="editing"
          variant="secondary"
          class="mr-auto"
          @click="photoAdd"
        >
          <v-icon icon="camera" />&nbsp;Add photo
        </b-button>
        <b-button v-if="editing" variant="white" @click="cancelEdit">
          <v-icon icon="times" /> Cancel
        </b-button>
        <b-button v-if="editing" variant="primary" @click="save">
          <v-icon v-if="saving" icon="sync" class="text-success fa-spin" />
          <v-icon v-else-if="saved" icon="check" class="text-success" />
          <v-icon v-else icon="save" />
          Save
        </b-button>
      </b-card-footer>
    </b-card>
    <ModMessageEmailModal
      v-if="showEmailSourceModal && message.source === 'Email'"
      :id="message.id"
      @hidden="showEmailSourceModal = false"
    />
    <ModSpammerReport
      v-if="showSpamModal"
      ref="spamConfirm"
      :user="message.fromuser"
      :safelist="false"
    />
    <div ref="bottom" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import Highlighter from 'vue-highlight-words'

import { useLocationStore } from '~/stores/location'
import { useMessageStore } from '~/stores/message'
import { useUserStore } from '~/stores/user'

import { setupKeywords } from '~/composables/useKeywords'
import { useMemberStore } from '~/stores/member'
import { useModConfigStore } from '~/stores/modconfig'
import { useMiscStore } from '~/stores/misc'
import { SUBJECT_REGEX } from '~/constants'
import { useMe } from '~/composables/useMe'
import { useModMe } from '~/composables/useModMe'

import { useModGroupStore } from '@/stores/modgroup'

import { twem } from '~/composables/useTwem'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  editreview: {
    type: Boolean,
    required: false,
    default: false,
  },
  noactions: {
    type: Boolean,
    required: false,
    default: false,
  },
  summary: {
    type: Boolean,
    required: false,
    default: false,
  },
  review: {
    type: Boolean,
    required: false,
    default: false,
  },
  search: {
    type: String,
    required: false,
    default: null,
  },
  next: {
    type: Number,
    required: false,
    default: null,
  },
  nextAfterRemoved: {
    type: Number,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['destroy'])

// If viewing message within chat then fromuser is a number and so must be zapped
if (props.message.fromuser && typeof props.message.fromuser === 'number') {
  // eslint-disable-next-line vue/no-mutating-props
  props.message.fromuser = null
}

const locationStore = useLocationStore()
const memberStore = useMemberStore()
const messageStore = useMessageStore()
const miscStore = useMiscStore()
const modconfigStore = useModConfigStore()
const modGroupStore = useModGroupStore()
const userStore = useUserStore()
const { typeOptions } = setupKeywords()
const { me, myid } = useMe()
const { myModGroups, myModGroup } = useModMe()

const top = ref(null)
const bottom = ref(null)
const spamConfirm = ref(null)

const saving = ref(false)
const saved = ref(false)
const showEmailSourceModal = ref(false)
const showSpamModal = ref(false)
const showMailSettings = ref(false)
const showActions = ref(false)
const showEmails = ref(false)
const editing = ref(false)
const expanded = ref(false)
const editgroup = ref(null)
const uploading = ref(false)
const attachments = ref([])
const homegroup = ref(null)
const homegroupontn = ref(false)
const historyGroups = reactive({})
const editmessage = ref(false)

const groupid = computed(() => {
  // moved from mixins/keywords
  let ret = 0

  if (props.message && props.message.groups && props.message.groups.length) {
    ret = props.message.groups[0].groupid
  }
  return ret
})

const messageGroup = computed(() => {
  let ret = null

  if (props.message && props.message.groups && props.message.groups.length) {
    ret = props.message.groups[0].groupid
  }

  return ret
})

const messageHistory = computed(() => {
  return props.message &&
    props.message.fromuser &&
    props.message.fromuser.messagehistory
    ? props.message.fromuser.messagehistory
    : []
})

const group = computed(() => {
  let ret = null

  if (messageGroup.value) {
    ret = myModGroups.value.find((g) => parseInt(g.id) === messageGroup.value)
  }

  return ret
})

const position = computed(() => {
  let ret = null

  if (props.message) {
    if (props.message.location) {
      // This is what we put in for message submitted on FD.
      ret = props.message.location
    } else if (props.message.lat || props.message.lng) {
      // This happens for TN messages
      ret = {
        lat: props.message.lat,
        lng: props.message.lng,
      }
    }
  }

  return ret
})

const outsideUK = computed(() => {
  return (
    position.value &&
    (position.value.lng < -16 ||
      position.value.lat < 49 ||
      position.value.lng > 4 ||
      position.value.lat > 64)
  )
})

const pending = computed(() => {
  return hasCollection('Pending')
})

const eSubject = computed(() => {
  return twem(props.message.subject)
})

const eBody = computed(() => {
  return twem(props.message.textbody)
})

const membership = computed(() => {
  let ret = null

  if (groupid.value) {
    ret =
      props.message.fromuser &&
      props.message.fromuser.memberof &&
      props.message.fromuser.memberof.find((g) => g.id === groupid.value)
  }

  return ret
})

const modconfig = computed(() => {
  let ret = null
  let configid = null

  myModGroups.value.forEach((grp) => {
    if (grp.id === groupid.value) {
      configid = grp.mysettings?.configid
    }
  })

  const configs = modconfigStore.configs
  ret = configs.find((config) => config.id === configid)
  if (!ret) {
    ret = configs.find((config) => config.default)
  }

  return ret
})

const subjectClass = computed(() => {
  let ret = 'text-success'

  if (modconfig.value && modconfig.value.coloursubj) {
    ret =
      props.message.subject?.match &&
      props.message.subject.match(modconfig.value.subjreg)
        ? 'text-success'
        : 'text-danger'
  }

  return ret
})

const oldSubject = computed(() => {
  if (!props.editreview || !props.message || !props.message.edits) {
    return null
  }

  // Edits are in descending time order.
  let oldest = null

  props.message.edits.forEach((edit) => {
    if (edit.reviewrequired && edit.oldsubject) {
      oldest = edit.oldsubject
    }
  })

  return oldest
})

const newSubject = computed(() => {
  if (!props.editreview || !props.message || !props.message.edits) {
    return null
  }

  // Find the newest and oldest texts; intermediates are just confusing.
  // Edits are in descending time order.
  let newest = null

  props.message.edits.forEach((edit) => {
    if (edit.reviewrequired) {
      if (edit.newsubject && !newest) {
        newest = edit.newsubject
      }
    }
  })

  return newest
})

const oldBody = computed(() => {
  if (!props.editreview || !props.message || !props.message.edits) {
    return null
  }

  // Edits are in descending time order.
  let oldest = null

  props.message.edits.forEach((edit) => {
    if (edit.reviewrequired && edit.oldtext) {
      oldest = edit.oldtext
    }
  })

  return oldest
})

const newBody = computed(() => {
  if (!props.editreview || !props.message || !props.message.edits) {
    return null
  }

  // Find the newest and oldest texts; intermediates are just confusing.
  // Edits are in descending time order.
  let newest = props.message.textbody

  props.message.edits.forEach((edit) => {
    if (edit.reviewrequired) {
      if (edit.newtext && !newest) {
        newest = edit.newtext
      }
    }
  })

  return newest
})

const duplicateAge = computed(() => {
  let ret = 31
  let check = false

  props.message.groups.forEach((g) => {
    const grp = myModGroup(g.groupid)

    // console.log("duplicateAge group", group?.settings?.duplicates)
    if (
      grp &&
      grp.settings &&
      grp.settings.duplicates && // TODO: MT group does not have settings
      grp.settings.duplicates.check
    ) {
      check = true
      const msgtype = props.message.type.toLowerCase()
      ret = Math.min(ret, grp.settings.duplicates[msgtype])
    }
  })

  // console.log('checkHistory duplicateAge',check,ret)
  return check ? ret : null
})

const crossposts = computed(() => {
  return checkHistory(false)
})

const duplicates = computed(() => {
  return checkHistory(true)
})

const memberGroupIds = computed(() => {
  return props.message &&
    props.message.fromuser &&
    props.message.fromuser.memberof
    ? props.message.fromuser.memberof.map((g) => g.id)
    : []
})

watch(
  () => props.summary,
  (newVal) => {
    if (newVal && expanded.value) {
      expanded.value = false
    } else if (!newVal && !expanded.value) {
      expanded.value = true
    }
  }
)

watch(
  () => props.nextAfterRemoved,
  (newVal) => {
    if (newVal === props.message.id) {
      // This message is the one after one which has just been removed.  Make sure the top is visible.
      bottom.value.scrollIntoView()
      top.value.scrollIntoView(true)
    }
  }
)

watch(
  messageHistory,
  async (newVal) => {
    // We want to ensure that we have the groups for any message history, so that we can use them in canonSubj.
    // console.log('ModMessage: watch messageHistory',newVal)
    await newVal.forEach(async function (message) {
      if (!historyGroups[message.groupid]) {
        historyGroups[message.groupid] = await modGroupStore.fetchIfNeedBeMT(
          message.groupid
        )
      }
    })
  },
  { immediate: true }
)

onMounted(() => {
  expanded.value = !props.summary
  attachments.value = props.message.attachments
  findHomeGroup()
})

onBeforeUnmount(() => {
  emit('destroy', props.message.id, props.next)
})

function updateComments() {
  // eslint-disable-next-line vue/no-mutating-props
  props.message.fromuser = userStore.byId(props.message.fromuser.id)
}

function imageAdded(id) {
  let ret = false

  if (props.editreview && props.message && props.message.edits) {
    props.message.edits.forEach((edit) => {
      const n = edit.newimages ? JSON.parse(edit.newimages) : []
      const o = edit.oldimages ? JSON.parse(edit.oldimages) : []
      if (n.includes(id) && !o.includes(id)) {
        ret = true
      }
    })
  }

  return ret
}

function imageRemoved(id) {
  let ret = false

  if (props.editreview && props.message && props.message.edits) {
    props.message.edits.forEach((edit) => {
      const n = edit.newimages ? JSON.parse(edit.newimages) : []
      const o = edit.oldimages ? JSON.parse(edit.oldimages) : []
      if (!n.includes(id) && o.includes(id)) {
        ret = true
      }
    })
  }

  return ret
}

function hasCollection(coll) {
  let ret = false

  if (props.message.groups) {
    props.message.groups.forEach((grp) => {
      if (grp.collection === coll) {
        ret = true
      }
    })
  }

  return ret
}

function postcodeSelect(pc) {
  // eslint-disable-next-line vue/no-mutating-props
  props.message.location = pc
}

function startEdit() {
  editmessage.value = props.message
  editing.value = true
  miscStore.modtoolsediting = true
  editmessage.value.groups.forEach((grp) => {
    editgroup.value = grp.groupid
  })
}

async function save() {
  saving.value = true

  const attids = []

  for (const att of attachments.value) {
    attids.push(att.id)
  }

  if (editmessage.value.item && editmessage.value.location) {
    // Well-structured message
    await messageStore.patch({
      id: editmessage.value.id,
      msgtype: editmessage.value.type,
      item: editmessage.value.item.name,
      location: editmessage.value.location.name,
      attachments: attids,
      textbody: editmessage.value.textbody,
    })
  } else {
    // Not
    await messageStore.patch({
      id: editmessage.value.id,
      msgtype: editmessage.value.type,
      subject: editmessage.value.subject,
      attachments: attids,
      textbody: editmessage.value.textbody,
    })
  }

  let alreadyon = false

  editmessage.value.groups.forEach((g) => {
    if (g.groupid === editgroup.value) {
      alreadyon = true
    }
  })

  if (!alreadyon) {
    await messageStore.move({
      id: editmessage.value.id,
      groupid: editgroup.value,
    })
  }

  saving.value = false
  editing.value = false
  miscStore.modtoolsediting = false
}

function settingsChange(param, val) {
  const params = {
    userid: props.message.fromuser.id,
    groupid: groupid.value,
  }
  params[param] = val
  memberStore.update(params)
}

async function toggleMail() {
  showMailSettings.value = !showMailSettings.value

  if (showMailSettings.value) {
    // Get the user into the store for SettingsGroup.
    await userStore.fetch(props.message.fromuser.id)
  }
}

function canonSubj(message) {
  let subj = message.subject
  if (!subj) subj = ''
  const grp = historyGroups[message.groupid]

  if (grp && grp.settings && grp.settings.keywords) {
    // TODO: MT group does not have settings
    const keyword =
      message.type === 'Offer'
        ? grp.settings.keywords.offer
        : grp.settings.keywords.wanted
    if (keyword) {
      subj = subj.replace(keyword, message.type.toUpperCase())
    }
  }

  if (subj.toLocaleLowerCase) {
    subj = subj.toLocaleLowerCase()

    // Remove any group tag
    subj = subj.replace(/^\[.*?\](.*)/, '$1')

    // Remove duplicate spaces
    subj = subj.replace(/\s+/g, ' ')

    subj = subj.trim()

    const matches = SUBJECT_REGEX.exec(subj)
    if (matches?.length > 2) {
      // Well-formed - remove the location.
      subj = matches[1] + ': ' + matches[2].toLowerCase().trim()
    }
  }

  return subj
}

function checkHistory(duplicateCheck) {
  const ret = []
  const subj = canonSubj(props.message)
  const dupids = []
  const crossids = []

  if (
    props.message &&
    props.message.fromuser &&
    props.message.fromuser.messagehistory
  ) {
    props.message.fromuser.messagehistory.forEach((message) => {
      if (
        message.id !== props.message.id &&
        duplicateAge.value &&
        message.daysago <= duplicateAge.value
      ) {
        // if( duplicateCheck) console.log('checkHistory check',message)
        if (canonSubj(message) === subj) {
          // No point displaying any group tag in the duplicate.
          message.subject = message.subject.replace(/\[.*\](.*)/, '$1')

          // Check whether there are groups in common.
          const groupsInCommon = props.message.groups
            .map((g) => g.groupid)
            .filter((g) => g === message.groupid).length

          const key = message.id + '-' + message.arrival

          if (duplicateCheck && groupsInCommon) {
            // Same group - so this is a duplicate
            if (!dupids[key]) {
              dupids[key] = true
              ret.push(message)
            }
          } else if (!duplicateCheck && !groupsInCommon) {
            // Different group - so this is a crosspost.
            if (!crossids[key]) {
              crossids[key] = true
              ret.push(message)
            }
          }
        }
      }
    })
  }
  // if( duplicateCheck) console.log('checkHistory duplicateCheck',ret)
  return ret
}

function photoAdd() {
  // Flag that we're uploading.  This will trigger the render of the filepond instance and subsequently the
  // init callback below.
  uploading.value = true
}

async function findHomeGroup() {
  if (props.message && props.message.lat && props.message.lng) {
    const loc = await locationStore.fetchByLatLng(
      props.message.lat,
      props.message.lng
    )

    if (loc && loc.groupsnear && loc.groupsnear.length) {
      // The group might not be on TN.
      homegroup.value = loc.groupsnear[0].namedisplay
      homegroupontn.value = loc.groupsnear[0].ontn
    }
  }
}

function cancelEdit() {
  editing.value = false
  miscStore.modtoolsediting = false

  // Fetch the message again to revert any changes.
  messageStore.fetch(props.message.id)
}

async function backToPending(callback) {
  await messageStore.backToPending(props.message.id)
  callback()
}

function spamReport() {
  showSpamModal.value = true
  spamConfirm.value?.show()
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
//@import 'color-vars';

.type {
  max-width: 150px;
}

.location {
  max-width: 250px;
}

.fullsubject {
  display: grid;
  grid-template-columns: 200px 1fr;

  grid-column: 2 / 3;

  label {
    grid-column: 1 / 2;
  }

  @include media-breakpoint-down(md) {
    grid-template-columns: 1fr;
  }
}

.addedMessage,
.removedMessage {
  display: none;
}

.addedImage {
  border: 1px solid $color-green--dark !important;

  .addedMessage {
    display: block !important;
  }
}

.removedImage {
  border: 1px solid $color-red--dark !important;

  .removedMessage {
    display: block !important;
  }
}
</style>
