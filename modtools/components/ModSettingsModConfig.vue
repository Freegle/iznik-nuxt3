<template>
  <div class="scrollinplace">
    <p>
      Standard Messages (aka ModConfigs) are configurations which can be applied
      to multiple communities so that they behave the same way - mostly so that
      they have the same set of approval/rejection buttons for messages/members.
    </p>
    <p>
      You configure different sets of buttons for different pages, so there's a
      section for each.
    </p>
    <p>
      <!-- eslint-disable-next-line -->
      Read more <ExternalLink href="https://wiki.ilovefreegle.org/Sample_Messages">on the wiki</ExternalLink>.
    </p>
    <div class="d-flex justify-content-between flex-wrap">
      <b-form-select
        v-model="configid"
        :options="configOptions"
        class="mb-2 font-weight-bold"
      />
      <div>
        <b-input-group>
          <b-form-input
            v-model="newconfigname"
            placeholder="Enter new config name"
          />
          <slot name="append">
            <SpinButton
              variant="white"
              icon-name="plus"
              label="Create"
              :disabled="!newconfigname"
              @handle="create"
            />
          </slot>
        </b-input-group>
      </div>
    </div>
    <Spinner v-if="loading" :size="50" class="d-block mt-2" />
    <div v-else-if="configid && config">
      <NoticeMessage v-if="config.protected" variant="info" class="mb-2">
        <v-icon icon="lock" />
        <span v-if="parseInt(config.createdby) === myid">
          You have locked this. Other people can use, view or copy it, but can't
          change or delete it.
        </span>
        <span v-else>
          This is locked by #{{ config.createdby }}. You can use, view or copy
          it, but you can't change or delete it.
        </span>
      </NoticeMessage>
      <NoticeMessage v-if="config.using && config.using.length">
        <div>
          This config is being used.
          <b-button v-if="!showUsing" variant="link" @click="showUsing = true">
            Show who's using it
          </b-button>
        </div>
        <div v-if="showUsing">
          <div v-for="using in config.using" :key="'using-' + using.id">
            {{ using.fullname }}
            <span class="text-muted small">
              <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{
                using.userid
              }}
            </span>
          </div>
        </div>
      </NoticeMessage>
      <b-card no-body class="mb-2 mt-1">
        <b-card-header>
          <b-button
            v-b-toggle.accordion-general
            block
            href="#"
            variant="secondary"
          >
            General Settings
          </b-button>
        </b-card-header>
        <b-collapse
          id="accordion-general"
          accordion="settings-accordion"
          role="tabpanel"
        >
          <b-card-body>
            <p v-if="config.cansee">
              You can see this because
              <span v-if="config.cansee === 'Created'"> you created it. </span>
              <span v-else-if="config.cansee === 'Default'">
                it's a standard configuration everyone can see.
              </span>
              <span v-else-if="config.cansee === 'Shared'">
                it's used by <em>{{ config.sharedby.displayname }}</em> on
                <em>{{ config.sharedon.namedisplay }}</em
                >, which you also mod.
              </span>
            </p>
            <ModConfigSetting
              :configid="configid"
              name="name"
              label="Name"
              :required="true"
              description="This is the name of this collection of standard messages.  It appears when you're choosing which collection to apply to your community."
              :disabled="locked"
            />
            <ModConfigSetting
              :configid="configid"
              name="chatread"
              label="Leave chat unread?"
              description="When you send a standard message it will go in the chat between that member and the group mods.  If this setting is 'Leave as unread' then it will be mailed to other mods and they will see it as unread in chat (i.e. with a red number).  If this setting is 'Mark as read', then they will still be able to see it in the chat, but it won't get mailed and it won't be unread."
              type="toggle"
              toggle-checked="Mark as read"
              toggle-unchecked="Leave as unread"
              :disabled="locked"
            />
            <ModConfigSetting
              :configid="configid"
              name="fromname"
              label="'From:' name in messages"
              description="You can choose whether the mod's own name is used in standard messages."
              type="toggle"
              value-checked="My name"
              value-unchecked="Groupname Moderator"
              toggle-checked="Own Name"
              toggle-unchecked="$groupname Moderator"
              :toggle-width="200"
              :disabled="locked"
            />
            <ModConfigSetting
              :configid="configid"
              name="coloursubj"
              label="Colour-code subjects?"
              description="Whether subjects are coded green/red based to indicate that they are correctly formatted."
              type="toggle"
              toggle-checked="Yes"
              toggle-unchecked="No"
              :disabled="locked"
            />
            <ModConfigSetting
              :configid="configid"
              name="subjlen"
              label="Subject length warning"
              description="Keeping subject lines short is better for small screens."
              :disabled="locked"
            />
            <ModConfigSetting
              :configid="configid"
              name="subjreg"
              label="Regular expression for colour-coding"
              description="Regular expressions can be difficult; test changes at http://www.phpliveregex.com"
              :disabled="locked"
            />
            <ModConfigSetting
              :configid="configid"
              name="network"
              label="$network substitution string"
              description="Normally you'd leave this set to Freegle or blank (same thing)."
              :disabled="locked"
            />
            <ModConfigSetting
              v-if="config.createdby"
              :configid="configid"
              name="protected"
              label="Locked against changes?"
              description="You can set this read-only so that only the person who created it can make changes"
              type="toggle"
              toggle-checked="Locked"
              toggle-unchecked="Unlocked"
              :disabled="locked"
            />
          </b-card-body>
        </b-collapse>
      </b-card>
      <b-card no-body class="mb-2 mt-1">
        <b-card-header>
          <b-button
            v-b-toggle.accordion-pendingmessages
            block
            href="#"
            variant="secondary"
          >
            Pending Messages
          </b-button>
        </b-card-header>
        <b-collapse
          id="accordion-pendingmessages"
          accordion="settings-accordion"
          role="tabpanel"
        >
          <b-card-body>
            <ModSettingsStandardMessageSet
              cc="ccrejectto"
              addr="ccrejectaddr"
              :types="[
                'Approve',
                'Reject',
                'Leave',
                'Delete',
                'Edit',
                'Hold Message',
              ]"
              :locked="locked"
            />
          </b-card-body>
        </b-collapse>
      </b-card>
      <b-card no-body class="mb-2 mt-1">
        <b-card-header>
          <b-button
            v-b-toggle.accordion-approvedmessages
            block
            href="#"
            variant="secondary"
          >
            Approved Messages
          </b-button>
        </b-card-header>
        <b-collapse
          id="accordion-approvedmessages"
          accordion="settings-accordion"
          role="tabpanel"
        >
          <b-card-body>
            <ModSettingsStandardMessageSet
              cc="ccfollowupto"
              addr="ccfollowupaddr"
              :types="[
                'Leave Approved Message',
                'Delete Approved Message',
                'Edit',
              ]"
              :locked="locked"
            />
          </b-card-body>
        </b-collapse>
      </b-card>

      <b-card no-body class="mb-2 mt-1">
        <b-card-header>
          <b-button
            v-b-toggle.accordion-approvedmembers
            block
            href="#"
            variant="secondary"
          >
            Approved Members
          </b-button>
        </b-card-header>
        <b-collapse
          id="accordion-approvedmembers"
          accordion="settings-accordion"
          role="tabpanel"
        >
          <b-card-body>
            <ModSettingsStandardMessageSet
              cc="ccfollmembto"
              addr="ccfollmembaddr"
              :types="['Leave Approved Member', 'Delete Approved Member']"
              :locked="locked"
            />
          </b-card-body>
        </b-collapse>
      </b-card>
      <div class="d-flex justify-content-between">
        <b-input-group class="mt-2">
          <b-form-input
            v-model="copyconfigname"
            placeholder="Copy this whole config to..."
          />
          <slot name="append">
            <SpinButton
              variant="white"
              icon-name="plus"
              label="Copy"
              :disabled="!copyconfigname"
              @handle="copy"
            />
          </slot>
        </b-input-group>
        <b-button
          v-if="!locked && (!config || !config.using || !config.using.length)"
          variant="white"
          class="mt-2"
          @click="deleteIt"
        >
          <v-icon icon="trash-alt" /> Delete
        </b-button>
      </div>
      <ConfirmModal
        v-if="showDeleteModal"
        :title="'Delete: ' + config.name"
        @confirm="deleteConfirmed"
        @hidden="showDeleteModal = false"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useModConfigStore } from '~/stores/modconfig'
import { useMiscStore } from '@/stores/misc'
import { useMe } from '~/composables/useMe'

const miscStore = useMiscStore()
const modConfigStore = useModConfigStore()
const { myid } = useMe()

const loading = ref(false)
const showUsing = ref(false)
const newconfigname = ref(null)
const copyconfigname = ref(null)
const showDeleteModal = ref(false)

const configid = computed({
  get() {
    const config = miscStore.get('settingsconfig')
    return config || null
  },
  async set(newval) {
    await miscStore.set({ key: 'settingsconfig', value: newval })
  },
})

const locked = computed(() => {
  return Boolean(
    config.value &&
      config.value.protected &&
      parseInt(config.value.createdby) !== myid.value
  )
})

const configOptions = computed(() => {
  const ret = [
    {
      value: null,
      text: '-- Please choose --',
    },
  ]

  const configs = modConfigStore.configs

  configs.forEach((c) => {
    ret.push({
      value: c.id,
      text: c.name,
    })
  })

  return ret
})

const config = computed(() => {
  return modConfigStore.current
})

watch(
  configid,
  async (newval) => {
    loading.value = true
    showUsing.value = false

    if (newval) {
      await modConfigStore.fetchConfig({
        id: newval,
        configuring: true,
      })
    }

    loading.value = false
  },
  { immediate: true }
)

onMounted(() => {
  modConfigStore.fetch({
    all: true,
  })
})

onBeforeUnmount(() => {
  // Refetch the configs into the session so that if we go to a page where the config is used, the changes will
  // be reflected.
  modConfigStore.fetch({
    all: true,
  })
})

async function create(callback) {
  configid.value = await modConfigStore.add({
    name: newconfigname.value,
    configuring: true,
  })

  modConfigStore.fetch({
    all: true,
  })
  callback()
}

async function copy(callback) {
  configid.value = await modConfigStore.add({
    name: copyconfigname.value,
    id: config.value.id,
    configuring: true,
  })

  modConfigStore.fetch({
    all: true,
  })
  callback()
}

function deleteIt() {
  showDeleteModal.value = true
}

async function deleteConfirmed() {
  await modConfigStore.delete({
    id: configid.value,
  })

  modConfigStore.fetch({
    all: true,
  })

  configid.value = null
}
</script>
<style scoped lang="scss">
//@import 'color-vars';

input,
select {
  max-width: 300px;
}
</style>
