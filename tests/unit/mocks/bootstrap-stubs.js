import { vi } from 'vitest'

/**
 * Shared Bootstrap component stubs for testing
 * Use these in global.stubs to avoid duplicating stubs across test files
 */

export const bootstrapStubs = {
  'b-row': {
    template: '<div class="row"><slot /></div>',
  },
  'b-col': {
    template: '<div class="col"><slot /></div>',
    props: ['cols', 'md', 'lg', 'xl', 'sm', 'xs'],
  },
  'b-button': {
    template:
      '<button :class="variant" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['variant', 'disabled', 'size'],
  },
  'b-form-group': {
    template:
      '<div class="form-group"><label v-if="label">{{ label }}</label><slot /></div>',
    props: ['label', 'labelFor', 'description'],
  },
  'b-form-input': {
    template:
      '<input class="form-input" :value="modelValue" :disabled="disabled" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'disabled', 'placeholder', 'type'],
  },
  'b-form-textarea': {
    template:
      '<textarea class="form-textarea" :value="modelValue" :rows="rows" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'rows', 'disabled', 'placeholder'],
  },
  'b-form-select': {
    template:
      '<select class="form-select" :value="modelValue" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.value); $emit(\'change\', $event.target.value)"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.text }}</option></select>',
    props: ['modelValue', 'options', 'disabled'],
  },
  'b-badge': {
    template:
      '<span class="badge" :class="\'badge-\' + variant"><slot /></span>',
    props: ['variant'],
  },
  'b-modal': {
    template:
      '<div class="modal" :title="title"><slot /><slot name="footer" /></div>',
    props: ['title', 'hideFooter', 'noCloseOnBackdrop'],
  },
  'b-card': {
    template:
      '<div class="card"><div class="card-header" v-if="$slots.header"><slot name="header" /></div><div class="card-body"><slot /></div></div>',
    props: ['noBody'],
  },
  'b-input-group': {
    template: '<div class="input-group"><slot /><slot name="append" /></div>',
  },
  'b-form-text': {
    template: '<small class="form-text"><slot /></small>',
  },
}

/**
 * Common timeago mock for use in global.mocks
 */
export const timeagoMock = (date) => '2 days ago'

/**
 * Common dateonly mock for useTimeFormat composable
 */
export const dateonlyMock = (date) => `Formatted: ${date}`

/**
 * Modal-specific stub with title display for testing modal components
 */
export const modalStub = {
  template: `
    <div class="modal" data-testid="modal">
      <div class="modal-title">{{ title }}</div>
      <slot></slot>
      <div class="modal-footer"><slot name="footer"></slot></div>
    </div>
  `,
  props: [
    'title',
    'scrollable',
    'noStacking',
    'modalClass',
    'size',
    'noCloseOnBackdrop',
    'hideHeaderClose',
    'noCloseOnEsc',
  ],
}

/**
 * Bootstrap stubs extended with modal stub for modal component tests
 */
export const modalBootstrapStubs = {
  ...bootstrapStubs,
  'b-modal': modalStub,
}

/**
 * Common mock hide function for useOurModal
 * Usage: const mockHide = createMockHide()
 */
export const createMockHide = () => vi.fn()

/**
 * Create useOurModal mock setup
 * Usage:
 *   import { ref } from 'vue'
 *   const mockHide = createMockHide()
 *   vi.mock('~/composables/useOurModal', () => createOurModalMock(mockHide))
 */
export const createOurModalMock = (mockHide) => ({
  useOurModal: () => ({
    modal: { value: null },
    hide: mockHide,
  }),
})
