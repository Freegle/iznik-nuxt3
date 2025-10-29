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
          <v-icon icon="info-circle" scale="1-75x" />
          {{ warn.type }}
        </h1>
        <p>
          {{ warn.message }}
        </p>
      </NoticeMessage>
      <NoticeMessage v-if="duplicate" variant="warning" class="mt-2">
        <p>
          You already have an open post
          <span class="font-weight-bold">{{ duplicate.subject }}</span
          >.
        </p>
        <p>
          If it's the same item, please go to
          <nuxt-link no-prefetch to="/myposts">My Posts</nuxt-link> and use the
          <em>Repost</em> button.
        </p>
        <p>
          If it's actually a different item, please change the name slightly -
          then it'll be clearer for everyone that it's not the same.
        </p>
      </NoticeMessage>
    </div>
  </div>
</template>
<script setup>
import { uid } from '~/composables/useId'
import { useComposeStore } from '~/stores/compose'
import { useMessageStore } from '~/stores/message'
import NoticeMessage from './NoticeMessage'
import { computed } from '#imports'
import { useMe } from '~/composables/useMe'

const emit = defineEmits(['update:edititem'])

const props = defineProps({
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
})

const composeStore = useComposeStore()
const messageStore = useMessageStore()
const { myid } = useMe()

// Data properties
const vagueness = [
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
]

const warnings = [
  {
    type: 'Upholstered household items and furniture',
    message:
      "There is no requirement for freegled items to have fire labels, but please be honest in your description or make sure you don't ask for things that aren't suitable for your use.",
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
      "These should be undamaged and suitable for the child's weight and height, and fit securely in the vehicle.",
    keywords: ['car seat', 'carseat', 'child car'],
  },
  {
    type: 'Knives',
    message:
      "Knives should only be given to those over 18 years of age, and must be collected and handed over in person (not left for collection in an agreed safe place). Knives shouldn't be carried openly on the street, so should be wrapped or in a container.",
    keywords: ['knife', 'knives', 'sword', 'swords'],
  },
  {
    type: 'Free',
    message:
      "Everything on Freegle is given away freely.  You don't need to say that - and it keeps things simpler if you remove it.",
    keywords: ['free', 'giving away'],
  },
  {
    type: 'Banned Plants',
    message:
      "This looks like a plant that is categorised as an invasive species, which can't be given away on Freegle.",
    keywords: [
      'alligator weed',
      'American skunk cabbage',
      'Asiatic tearthumb',
      'balloon vine',
      'broadleaf water milfoil',
      'broadleaf watermilfoil',
      'broomsedge',
      'Chilean rhubarb',
      'Chinese bush clover',
      'Chinese bushclover',
      'Chinese shrub clover',
      'Chinese tallow',
      'climbing fern',
      'crimson fountain grass',
      'curly water weed',
      'curly waterweed',
      'Eastern baccharis',
      'fanwort',
      'floating pennywort',
      'floating water primrose',
      'giant hogweed',
      'giant rhubarb',
      'giant salvinia',
      'golden wreath wattle',
      'Himalayan balsam',
      'Japanese hop',
      'Japanese stiltgrass',
      'kudzu',
      'mesquite',
      'mile-a-minute',
      'milkweed',
      "Nuttall's water weed",
      "Nuttall's waterweed",
      'Nuttalls waterweed',
      "parrot's feather",
      'parrots feather',
      'parthenium weed',
      'perennial veldt grass',
      'perennial veldtgrass',
      'Persian hogweed',
      'purple pampas grass',
      'purple veldt grass',
      'purple veldtgrass',
      'Salvinia moss',
      'Senegal tea',
      "Sosnowsky's hogweed",
      'tree groundsel',
      'tree of heaven',
      'Tromso palm',
      'Tromsø palm',
      'vine-like fern',
      'water hyacinth',
      'water primrose',
      'water shield',
      'whitetop weed',
      'yellow skunk cabbage',
    ],
  },
]

// Computed properties
const item = computed({
  get() {
    if (!props.edit) {
      const msg = composeStore?.message(props.id)
      return msg?.item
    } else {
      return props.edititem
    }
  },
  set(newValue) {
    if (!props.edit) {
      composeStore.setItem({
        id: props.id,
        item: newValue,
      })
    } else {
      console.log('Set new item', newValue)
      emit('update:edititem', newValue)
    }
  },
})

const vague = computed(() => {
  let ret = false
  let currentItem = item.value

  if (currentItem) {
    currentItem = currentItem.toLowerCase()

    vagueness.forEach((v) => {
      if (currentItem.match(v)) {
        ret = true
      }
    })
  }

  return ret
})

const warn = computed(() => {
  let ret = null
  let currentItem = item.value

  if (currentItem) {
    currentItem = currentItem.toLowerCase()

    warnings.forEach((k) => {
      k.keywords.forEach((v) => {
        if (currentItem.includes(v)) {
          ret = k
        }
      })
    })
  }

  return ret
})

const duplicate = computed(() => {
  let ret = null

  const messages = messageStore?.all

  // This may be a repost, in which case we don't want to flag the original.
  const composing = composeStore?.message(props.id)

  const repostof = composing?.repostof

  messages.forEach((m) => {
    if (
      m.fromuser &&
      m.fromuser === myid.value &&
      m.type === props.type &&
      m.item?.name &&
      item.value &&
      m.item.name.toLowerCase() === item.value.toLowerCase() &&
      m.id !== props.id &&
      (!repostof || repostof !== m.id) &&
      (!m.outcomes || !m.outcomes.length)
    ) {
      // Exactly duplicate of open post.
      ret = m
    }
  })

  return ret
})

// Methods
const $id = (type) => {
  return uid(type)
}
</script>
