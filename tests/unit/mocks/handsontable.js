/**
 * Mock for @handsontable/vue3 and handsontable/registry
 * Used in unit tests for components that use Handsontable grid
 */
import { defineComponent, h } from 'vue'

export const HotTable = defineComponent({
  name: 'HotTable',
  props: [
    'width',
    'height',
    'data',
    'licenseKey',
    'columnSorting',
    'dropdownMenu',
    'filters',
    'cells',
    'manualColumnFreeze',
    'afterRender',
  ],
  setup(props, { slots, expose }) {
    const hotInstance = {
      getPlugin: () => ({
        freezeColumn: () => {},
      }),
    }

    expose({ hotInstance })

    return () => h('div', { class: 'hot-table' }, slots.default?.())
  },
})

export const HotColumn = defineComponent({
  name: 'HotColumn',
  props: ['title', 'data', 'renderer'],
  setup(props) {
    return () => h('div', { class: 'hot-column', 'data-title': props.title })
  },
})
