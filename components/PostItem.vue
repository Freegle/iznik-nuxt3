<template>
  <div>
    <div class="d-flex flex-column">
      <label :for="$id('what')">What is it?</label>
      <b-form-input
        :id="$id('what')"
        v-model="item"
        placeholder="In a single word or phrase, what is it?"
        maxlength="60"
        spellcheck="true"
        size="lg"
      />
    </div>
    <div>
      <NoticeMessage v-if="vague" variant="warning" class="mt-1 mb-1">
        <p>
          Please avoid very general terms. Be precise - you'll get a better
          response.
        </p>
      </NoticeMessage>
      <NoticeMessage v-if="warn" variant="warning" class="mt-1">
        <h1 class="header--size3">
          <client-only>
            <v-icon icon="info-circle" size="1-75x" />
          </client-only>
          {{ warn.type }}
        </h1>
        <p>
          {{ warn.message }}
        </p>
      </NoticeMessage>
      <NoticeMessage v-if="duplicate" variant="warning">
        <p>
          You already have an open post
          <span class="font-weight-bold">{{ duplicate.subject }}</span
          >.
        </p>
        <p>
          If it's the same item, please go to
          <nuxt-link to="/myposts"> My Posts </nuxt-link> and use the
          <em>Repost</em> button.
        </p>
        <p>
          If it's different, please change the name slightly - then it'll be
          clearer for everyone that it's not the same.
        </p>
      </NoticeMessage>
    </div>
  </div>
</template>
<script>
import { uid } from '../composables/useId'
import { useComposeStore } from '../stores/compose'
import { useMessageStore } from '../stores/message'
import NoticeMessage from './NoticeMessage'

export default {
  components: {
    NoticeMessage,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    edit: {
      type: Boolean,
      required: false,
      default: false,
    },
    edititem: {
      type: String,
      required: false,
      default: null,
    },
  },
  setup() {
    const composeStore = useComposeStore()
    const messageStore = useMessageStore()

    return {
      composeStore,
      messageStore,
    }
  },
  data() {
    return {
      vagueness: [
        '^eney fink$',
        '^eney think$',
        '^furniture$',
        '^household$',
        '^anything$',
        '^stuff$',
        '^things$',
        '^tools$',
        '^garden$',
        '^goods$',
        "^don't know$",
        '^items$',
        '^browsing$',
        '^browse$',
        '^any$',
      ],
      warnings: [
        {
          type: 'Upholstered household items and furniture',
          message:
            'There is no requirement for freegled items to have fire labels, but please be honest in your description or make sure you don’t ask for things that aren’t suitable for your use.',
          keywords: [
            'sofa',
            'sofabed',
            'couch',
            'settee',
            'armchair',
            'headboard',
            'stool',
            'futon',
            'mattress',
            'mattress',
            'pillow',
            'cushion',
            'seat pad',
          ],
        },
        {
          type: 'Cot Mattress',
          message:
            'To be safe mattresses should be clean, dry and free from fabric tears, fit the cot snugly, with no gaps, firm and with no sagging.',
          keywords: ['cot mattress'],
        },
        {
          type: 'Motorcycle and cycle helmets',
          message:
            'Using helmets that have been involved in a crash is not recommended.',
          keywords: ['helmet'],
        },
        {
          type: 'Car seats',
          message:
            'These should be undamaged and suitable for the child’s weight and height, and fit securely in the vehicle.',
          keywords: ['car seat', 'carseat', 'child car'],
        },
      ],
    }
  },
  computed: {
    item: {
      get() {
        if (!this.edit) {
          const msg = this.composeStore.message(this.id)
          return msg?.item
        } else {
          return this.edititem
        }
      },
      set(newValue) {
        if (!this.edit) {
          this.composeStore.setItem({
            id: this.id,
            item: newValue,
          })
        } else {
          console.log('Set new item', newValue)
          this.$emit('update:edititem', newValue)
        }
      },
    },
    vague() {
      let ret = false
      let item = this.item

      if (item) {
        item = item.toLowerCase()

        this.vagueness.forEach((v) => {
          if (item.match(v)) {
            ret = true
          }
        })
      }

      return ret
    },
    warn() {
      let ret = null
      let item = this.item

      if (item) {
        item = item.toLowerCase()

        this.warnings.forEach((k) => {
          k.keywords.forEach((v) => {
            if (item.includes(v)) {
              ret = k
            }
          })
        })
      }

      return ret
    },
    duplicate() {
      let ret = null

      const messages = this.messageStore.all

      messages.forEach((m) => {
        if (
          m.fromuser &&
          m.fromuser === this.myid &&
          m.type === this.type &&
          m.item &&
          this.item &&
          m.item.name.toLowerCase() === this.item.toLowerCase() &&
          m.id !== this.id &&
          (!m.outcomes || !m.outcomes.length)
        ) {
          // Exactly duplicate of open post.
          ret = m
        }
      })

      return ret
    },
  },
  methods: {
    $id(type) {
      return uid(type)
    },
  },
}
</script>
