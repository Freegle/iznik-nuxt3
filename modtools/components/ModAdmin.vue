<template>
  <div>
    <b-card no-body>
      <b-card-header class="clickme" @click.prevent="expanded = !expanded">
        <b-row>
          <b-col cols="6" md="2">
            <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{
              admin.id
            }}
          </b-col>
          <b-col cols="6" md="3" class="small">
            Created {{ timeago(admin.created) }}
            <span v-if="!admin.pending">
              <span v-if="admin.complete">
                Sent {{ timeago(admin.complete) }}
              </span>
              <span v-else> Queued for send </span>
            </span>
          </b-col>
          <b-col cols="12" md="4">
            {{ admin.subject }}
          </b-col>
          <b-col cols="12" md="3">
            <span class="d-block float-end">
              <v-icon v-if="!expanded" icon="caret-down" />
              <v-icon v-else icon="caret-up" />
            </span>
            {{ groupname }}
          </b-col>
        </b-row>
      </b-card-header>
      <b-card-body v-if="expanded">
        <NoticeMessage v-if="admin.heldby" variant="warning" class="mb-2">
          Held
          <span v-if="holder"> by {{ holder.displayname }} </span>. Please check
          before releasing it.
          <span class="text-muted small">
            {{ timeago(admin.heldat) }}
          </span>
        </NoticeMessage>
        <NoticeMessage
          v-if="admin.parentid && !admin.complete"
          variant="info"
          class="mb-2"
        >
          <p>
            This is a copy of a suggested ADMIN which you might like to send on
            your group.
          </p>
          <p>
            You can edit it and <em>Save changes</em>, then
            <em>Approve and send</em>.
          </p>
          <ul>
            <li>
              <strong>It's always good to put your names at the end.</strong>
            </li>
            <li>Any changes you make will only apply to this copy.</li>
            <li>
              Members on multiple groups will only get one copy of this kind of
              ADMIN.
            </li>
          </ul>
          <p class="topspace">
            If this isn't suitable for your group, then click <em>Delete</em>.
          </p>
          <p>
            If you think this ADMIN could be improved, or would like to suggest
            more, please comment on the Google doc
            <ExternalLink
              href="https://docs.google.com/document/d/1e5zyMNwiaAtdxHP7fFkuPy4bLu-VAGmfgJOBClmqHD8/edit"
            >
              here </ExternalLink
            >.
          </p>
        </NoticeMessage>
        <p class="text-muted">
          <span v-if="admin.parentid"> Suggested ADMIN </span>
          <b-button
            v-if="admin.complete"
            variant="white"
            class="float-end"
            @click="copyIt"
          >
            <v-icon icon="copy" /> Copy
          </b-button>
          <span v-else-if="admin.createdby">
            Created by
            {{ admin.createdby.displayname }}
            <span class="text-muted small">
              <v-icon icon="hashtag" class="text-muted" scale="0.75" />
              {{ admin.createdby.id }}
            </span>
          </span>
        </p>
        <NoticeMessage
          :variant="admin.essential ? 'warning' : 'info'"
          class="mb-2"
        >
          <span v-if="admin.essential">
            Essential - will be sent to all members.
          </span>
          <span v-else>
            Newsletter - will not be sent to members who have opted out.
          </span>
        </NoticeMessage>
        <b-form-group
          label="Subject of ADMIN:"
          label-for="subject"
          label-class="mb-0"
        >
          <b-form-input
            id="subject"
            v-model="admin.subject"
            class="mb-3"
            placeholder="Subject (don't include ADMIN - added automatically)"
          />
        </b-form-group>
        <b-form-group
          label="Body of ADMIN:"
          label-for="body"
          label-class="mb-0"
        >
          <b-form-textarea
            id="body"
            v-model="admin.text"
            class="mb-3"
            placeholder="Put your message in here.  Plain-text only."
            rows="15"
          />
        </b-form-group>
        <b-form-group
          label="Call To Action text:"
          label-for="ctatext"
          label-class="mb-0"
        >
          <b-form-input
            id="ctatext"
            v-model="admin.ctatext"
            class="mb-3"
            placeholder="(Option) Text for a big button"
          />
        </b-form-group>
        <b-form-group
          label="Call To Action link:"
          label-for="ctalink"
          label-class="mb-0"
        >
          <b-form-input
            id="ctalink"
            v-model="admin.ctalink"
            class="mb-3"
            placeholder="(Optional) Link for a big button"
          />
        </b-form-group>
      </b-card-body>
      <b-card-footer v-if="expanded && admin.pending">
        <b-button v-if="!admin.heldby" variant="warning" @click="deleteIt">
          <v-icon icon="trash-alt" /> Delete
        </b-button>
        <b-button
          v-if="!admin.heldby || admin.heldby === myid"
          variant="white"
          @click="save"
        >
          <v-icon v-if="saving" icon="sync" class="text-success fa-spin" />
          <v-icon v-else-if="saved" icon="check" class="text-success" />
          <v-icon v-else icon="save" />
          Save changes
        </b-button>
        <b-button v-if="!admin.heldby" variant="white" @click="hold">
          <v-icon icon="pause" /> Hold
        </b-button>
        <b-button v-else variant="secondary" @click="releaseAdmin">
          <v-icon icon="play" /> Release
        </b-button>
        <b-button v-if="!admin.heldby" variant="primary" @click="approve">
          <v-icon icon="check" /> Approve and Send
        </b-button>
      </b-card-footer>
    </b-card>
    <ConfirmModal
      v-if="showConfirmModal"
      :title="'Delete: ' + admin.subject"
      @confirm="deleteConfirmed"
      @hidden="showConfirmModal = false"
    />
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminsStore } from '~/stores/admins'
import { useUserStore } from '~/stores/user'
import { useGroupStore } from '~/stores/group'
import { useMe } from '~/composables/useMe'
import { useModMe } from '~/composables/useModMe'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  open: {
    type: Boolean,
    required: false,
  },
})

const emit = defineEmits(['copy'])

const adminsStore = useAdminsStore()
const groupStore = useGroupStore()
const userStore = useUserStore()
const { myid } = useMe()
const { checkWork } = useModMe()

const expanded = ref(false)
const saving = ref(false)
const saved = ref(false)
const showConfirmModal = ref(false)

const admin = computed(() => adminsStore.get(props.id))

const groupname = computed(() => {
  let ret = null
  const group = groupStore.get(admin.value.groupid)

  if (group) {
    ret = group.namedisplay
  }

  return ret
})

const holder = computed(() => {
  return admin.value.heldby ? userStore.byId(admin.value.heldby) : null
})

onMounted(() => {
  expanded.value = props.open

  if (admin.value.heldby) {
    // Get them in store so we can display their name.
    userStore.fetch(admin.value.heldby)
  }
})

function deleteIt() {
  showConfirmModal.value = true
}

function copyIt() {
  emit('copy', admin.value)
}

function deleteConfirmed() {
  adminsStore.delete({ id: props.id })
  checkWork(true)
}

async function save() {
  saving.value = true

  await adminsStore.edit({
    id: admin.value.id,
    subject: admin.value.subject,
    text: admin.value.text,
    pending: 1,
  })

  saving.value = false
  saved.value = true
  setTimeout(() => {
    saved.value = false
  }, 2000)
}

function hold() {
  adminsStore.hold({ id: admin.value.id })
  checkWork(true)
}

function releaseAdmin() {
  adminsStore.release({ id: admin.value.id })
  checkWork(true)
}

async function approve() {
  await save()

  await adminsStore.approve({ id: admin.value.id })

  checkWork(true)
}
</script>
