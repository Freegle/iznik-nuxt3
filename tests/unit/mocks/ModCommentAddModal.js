import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'ModCommentAddModal',
  props: ['user'],
  emits: ['hidden'],
  setup(props, { emit }) {
    return () => h('div', { class: 'mod-comment-add-modal-stub' })
  },
})
