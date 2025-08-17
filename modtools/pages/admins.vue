<template>
  <div>
    <div>
      <div>
        <ModHelpAdmins />
        <b-tabs content-class="mt-3" card>
          <b-tab active>
            <template #title>
              <h2 class="ml-2 mr-2" @click="fetchPending">
                Pending
                <b-badge v-if="pendingcount" variant="danger">
                  {{ pendingcount }}
                </b-badge>
              </h2>
            </template>
            <ModGroupSelect
              v-model="groupidshow"
              all
              modonly
              :work="['pendingadmins']"
              class="mb-2"
            />
            <div v-if="pending.length">
              <ModAdmin
                v-for="admin in pending"
                :id="admin.id"
                :key="'pendingadmin-' + admin.id"
                :open="pending.length === 1"
              />
            </div>
            <div v-else>No ADMINs to review just now.</div>
          </b-tab>
          <b-tab>
            <template #title>
              <h2 class="ml-2 mr-2">Create</h2>
            </template>
            <ModGroupSelect
              v-model="groupidcreate"
              modonly
              :systemwide="supportOrAdmin"
              class="mb-2"
            />
            <NoticeMessage
              v-if="groupidcreate < 0"
              class="mt-1 mb-1"
              variant="danger"
            >
              This is a suggested ADMIN. All local communities will get "copies"
              of this (unless they've opted out), and mods can then
              edit/approve/reject them. Members won't receive multiple copies.
            </NoticeMessage>
            <VeeForm ref="form">
              <b-form-group
                label="Subject of ADMIN:"
                label-for="subject"
                label-class="mb-0"
              >
                <p>ADMINs come in two flavours:</p>
                <ul>
                  <li>
                    Essential - everyone must receive them. These are important
                    announcements about the running of the group.
                  </li>
                  <li>
                    Newsletter - people can opt out (via the setting which
                    mentions "to remind you"). These are less important or
                    encouragements to freegle more.
                  </li>
                </ul>
                <OurToggle
                  v-model="essential"
                  class="mt-2"
                  :height="30"
                  :width="150"
                  :font-size="14"
                  :sync="true"
                  :labels="{ checked: 'Essential', unchecked: 'Newsletter' }"
                  variant="modgreen"
                />
              </b-form-group>
              <b-form-group
                label="Subject of ADMIN:"
                label-for="subject"
                label-class="mb-0"
              >
                <Field
                  id="subject"
                  v-model="subject"
                  name="subject"
                  type="text"
                  placeholder="Subject (don't include ADMIN - added automatically)"
                  :rules="validateSubject"
                  class="form-control"
                />
                <ErrorMessage
                  name="subject"
                  class="text-danger font-weight-bold"
                />
              </b-form-group>
              <b-form-group
                label="Body of ADMIN:"
                label-for="body"
                label-class="mb-0"
              >
                <Field
                  id="body"
                  v-model="body"
                  as="textarea"
                  name="body"
                  rows="15"
                  max-rows="8"
                  spellcheck="true"
                  type="textarea"
                  placeholder="Put your message in here.  Plain-text only."
                  :rules="validateBody"
                  class="form-control"
                />
                <ErrorMessage
                  name="body"
                  class="text-danger font-weight-bold"
                />
              </b-form-group>
              <p>
                You can optionally add a big button into the ADMIN, and specify
                where it will go.
              </p>
              <b-form-group
                label="Call To Action text:"
                label-for="ctatext"
                label-class="mb-0"
              >
                <b-form-input
                  id="ctatext"
                  v-model="ctatext"
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
                  v-model="ctalink"
                  class="mb-3"
                  placeholder="(Optional) Link for a big button"
                />
              </b-form-group>
            </VeeForm>
            <b-button
              class="mt-2 mb-2"
              size="lg"
              :variant="groupidcreate < 0 ? 'danger' : 'primary'"
              :disabled="groupidcreate <= 0 && groupidcreate !== -2"
              @click="create"
            >
              <v-icon v-if="created" icon="check" />
              <v-icon v-else-if="creating" icon="sync" class="fa-spin" />
              <v-icon v-else icon="save" />
              <span v-if="groupidcreate < 0"> Send to all communities </span>
              <span v-else> Send to Pending ADMINs </span>
            </b-button>
            <p>
              It's a good idea to have a fellow mod take a look at an ADMIN
              before it goes out, to spot typos.
            </p>
          </b-tab>
          <b-tab>
            <template #title>
              <h2 class="ml-2 mr-2" @click="fetchPrevious">Previous</h2>
            </template>
            <ModGroupSelect v-model="groupidprevious" modonly class="mb-2" />
            <p>
              If an ADMIN shows as queued for send, it usually takes a few
              minutes. If we are sending a lot of ADMINs it can take a few
              hours.
            </p>
            <p>
              If a suggested ADMIN doesn't show here it will be because you
              deleted it.
            </p>
            <div v-if="previous.length">
              <ModAdmin
                v-for="admin in previous"
                :id="admin.id"
                :key="'pendingadmin-' + admin.id"
                :open="previous.length === 1"
              />
            </div>
            <div v-else-if="groupidprevious > 0">No previous ADMINs.</div>
          </b-tab>
        </b-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import { defineRule, Form as VeeForm, Field, ErrorMessage } from 'vee-validate'
import { required, email, min, max } from '@vee-validate/rules'
import { useAdminsStore } from '../stores/admins'
import { useModGroupStore } from '@/stores/modgroup'

defineRule('required', required)
defineRule('email', email)
defineRule('min', min)
defineRule('max', max)


export default {
  name: 'AdminsManagement',
  components: {
    VeeForm,
    Field,
    ErrorMessage,
  },
  setup() {
    const adminsStore = useAdminsStore()
    const modGroupStore = useModGroupStore()
    return { adminsStore, modGroupStore }
  },
  data: function () {
    return {
      groupidshow: null,
      groupidcreate: null,
      groupidprevious: null,
      subject: null,
      body: null,
      ctatext: null,
      ctalink: null,
      creating: false,
      created: false,
      essential: true,
    }
  },
  computed: {
    pendingcount() {
      let count = 0

      for (const g of this.myGroups) {
        const group = this.modGroupStore.get(g.id)
        if (group) {
          if (
            group.type === 'Freegle' &&
            // (!this.modonly ||
            (group.role === 'Owner' || group.role === 'Moderator')
          ) {
            if (group.work && group.work.pendingadmins) {
              count += group.work.pendingadmins
            }
          }
        }
      }

      return count
    },
    pending() {
      return this.adminsStore.list
        .filter((a) => a.pending)
        .sort(function (a, b) {
          return new Date(b.created).getTime() - new Date(a.created).getTime()
        })
    },
    previous() {
      return this.adminsStore.list
        .filter((a) => !a.pending)
        .sort(function (a, b) {
          return new Date(b.created).getTime() - new Date(a.created).getTime()
        })
    },
  },
  watch: {
    groupidshow(newval) {
      this.fetch(newval)
    },
    groupidprevious(newval) {
      this.fetch(newval)
    },
  },
  mounted() {
    this.modGroupStore.getModGroups()

    this.fetch(this.groupidshow)
  },
  methods: {
    fetchPending() {
      this.fetch(this.groupidshow)
    },
    fetchPrevious() {
      this.fetch(this.groupidprevious)
    },
    async create() {
      const validate = await this.$refs.form.validate()
      if (!validate.valid) {
        return
      }

      this.creating = true

      if ((this.ctatext && this.ctalink) || (!this.ctatext && !this.ctalink)) {
        await this.adminsStore.add({
          groupid: this.groupidcreate > 0 ? this.groupidcreate : null,
          subject: this.subject,
          text: this.body,
          ctatext: this.ctatext,
          ctalink: this.ctalink,
          essential: this.essential,
        })

        this.creating = false
        this.created = true

        setTimeout(() => {
          this.created = false
        }, 2000)

        this.checkWork(true)
      }
    },
    async fetch(groupid) {
      await this.adminsStore.clear()
      await this.adminsStore.fetch({
        groupid,
      })
    },
    validateSubject(value) {
      if (!value) {
        return 'Please enter a subject.'
      }

      if (value.toLowerCase().includes('admin')) {
        return 'Do not include ADMIN in your subject.'
      }

      return true
    },
    validateBody(value) {
      if (!value) {
        return 'Please add the message.'
      }
      return true
    },
  },
}
</script>
