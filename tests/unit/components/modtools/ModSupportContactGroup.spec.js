import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

// Import component after mocks
import ModSupportContactGroup from '~/modtools/components/ModSupportContactGroup.vue'

// Mock alert store
const mockAlertStore = {
  list: {},
  fetch: vi.fn().mockResolvedValue({}),
  add: vi.fn().mockResolvedValue({ id: 1 }),
}

// Mock modgroup store
const mockModGroupStore = {
  allGroups: {},
  listMT: vi.fn().mockResolvedValue([]),
}

vi.mock('~/modtools/stores/alert', () => ({
  useAlertStore: () => mockAlertStore,
}))

vi.mock('~/stores/modgroup', () => ({
  useModGroupStore: () => mockModGroupStore,
}))

// Mock QuillEditor
vi.mock('@vueup/vue-quill', () => ({
  QuillEditor: {
    template: '<div class="quill-editor"><slot /></div>',
    props: ['content', 'theme', 'toolbar', 'contentType', 'modules'],
  },
}))

// Mock htmlEditButton
vi.mock('quill-html-edit-button', () => ({
  default: {},
}))

describe('ModSupportContactGroup', () => {
  function mountComponent() {
    return mount(ModSupportContactGroup, {
      global: {
        stubs: {
          SpinButton: {
            template:
              '<button :class="variant" :disabled="disabled" @click="$emit(\'handle\', () => {})"><slot />{{ label }}</button>',
            props: [
              'variant',
              'iconName',
              'label',
              'spinclass',
              'disabled',
              'size',
            ],
          },
          'b-form-select': {
            template:
              '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
            props: ['modelValue'],
          },
          'b-form-input': {
            template:
              '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'placeholder'],
          },
          'b-form-textarea': {
            template:
              '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'rows'],
          },
          'b-row': { template: '<div class="row"><slot /></div>' },
          'b-col': { template: '<div class="col"><slot /></div>' },
          'b-img': { template: '<img :src="src" />', props: ['src', 'alt'] },
          'b-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
          },
          ModGroupSelect: {
            template:
              '<select :value="modelValue" @change="$emit(\'update:modelValue\', parseInt($event.target.value))"><option value="-1">All</option><option value="1">Group 1</option></select>',
            props: ['modelValue', 'systemwide', 'listall'],
          },
          NoticeMessage: {
            template:
              '<div class="notice-message" :class="variant"><slot /></div>',
            props: ['variant'],
          },
          ModAlertHistory: {
            template: '<div class="alert-history" :data-alert-id="alert.id" />',
            props: ['alert'],
          },
          QuillEditor: {
            template: '<div class="quill-editor" />',
            props: ['content', 'theme', 'toolbar', 'contentType', 'modules'],
          },
          'client-only': { template: '<div><slot /></div>' },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAlertStore.list = {}
    mockModGroupStore.allGroups = {}
  })

  describe('rendering', () => {
    it('shows fetch communities button when groups not loaded', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('Fetch communities')
    })

    it('hides fetch button and shows form when groups are loaded', async () => {
      mockModGroupStore.allGroups = { 1: { id: 1, nameshort: 'Test Group' } }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).not.toContain('Fetch communities')
      expect(wrapper.find('select').exists()).toBe(true)
    })
  })

  describe('initial state', () => {
    it('starts with busy as false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.busy).toBe(false)
    })

    it('starts with from as null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.from).toBeNull()
    })

    it('starts with groupid as null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.groupid).toBeNull()
    })

    it('starts with tryhard as false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.tryhard).toBe(false)
    })

    it('starts with confirm as false', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.confirm).toBe(false)
    })

    it('starts with subject as null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.subject).toBeNull()
    })

    it('starts with text as null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.text).toBeNull()
    })

    it('starts with html as null', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.html).toBeNull()
    })
  })

  describe('computed properties', () => {
    describe('gotallgroups', () => {
      it('returns false when allGroups is empty', () => {
        mockModGroupStore.allGroups = {}
        const wrapper = mountComponent()
        expect(wrapper.vm.gotallgroups).toBe(false)
      })

      it('returns true when allGroups has items', () => {
        mockModGroupStore.allGroups = { 1: { id: 1 } }
        const wrapper = mountComponent()
        expect(wrapper.vm.gotallgroups).toBe(true)
      })
    })

    describe('valid', () => {
      it('returns falsy when from is missing', async () => {
        mockModGroupStore.allGroups = { 1: { id: 1 } }
        const wrapper = mountComponent()
        wrapper.vm.from = null
        wrapper.vm.subject = 'Test'
        wrapper.vm.text = 'Body'
        wrapper.vm.groupid = 1
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.valid).toBeFalsy()
      })

      it('returns falsy when subject is missing', async () => {
        mockModGroupStore.allGroups = { 1: { id: 1 } }
        const wrapper = mountComponent()
        wrapper.vm.from = 'info'
        wrapper.vm.subject = null
        wrapper.vm.text = 'Body'
        wrapper.vm.groupid = 1
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.valid).toBeFalsy()
      })

      it('returns falsy when text is missing', async () => {
        mockModGroupStore.allGroups = { 1: { id: 1 } }
        const wrapper = mountComponent()
        wrapper.vm.from = 'info'
        wrapper.vm.subject = 'Test'
        wrapper.vm.text = null
        wrapper.vm.groupid = 1
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.valid).toBeFalsy()
      })

      it('returns falsy when groupid is missing', async () => {
        mockModGroupStore.allGroups = { 1: { id: 1 } }
        const wrapper = mountComponent()
        wrapper.vm.from = 'info'
        wrapper.vm.subject = 'Test'
        wrapper.vm.text = 'Body'
        wrapper.vm.groupid = null
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.valid).toBeFalsy()
      })

      it('returns truthy when all required fields are present', async () => {
        mockModGroupStore.allGroups = { 1: { id: 1 } }
        const wrapper = mountComponent()
        wrapper.vm.from = 'info'
        wrapper.vm.subject = 'Test'
        wrapper.vm.text = 'Body'
        wrapper.vm.groupid = 1
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.valid).toBeTruthy()
      })
    })

    describe('alerts', () => {
      it('returns empty array when no alerts', () => {
        mockAlertStore.list = {}
        const wrapper = mountComponent()
        expect(wrapper.vm.alerts).toEqual([])
      })

      it('returns alerts sorted by created date descending', () => {
        mockAlertStore.list = {
          1: { id: 1, created: '2024-01-01T10:00:00' },
          2: { id: 2, created: '2024-01-02T10:00:00' },
          3: { id: 3, created: '2024-01-01T15:00:00' },
        }
        const wrapper = mountComponent()
        const alerts = wrapper.vm.alerts

        expect(alerts[0].id).toBe(2)
        expect(alerts[1].id).toBe(3)
        expect(alerts[2].id).toBe(1)
      })
    })
  })

  describe('loadallgroups', () => {
    it('calls modGroupStore.listMT with Freegle grouptype', async () => {
      const wrapper = mountComponent()
      const callback = vi.fn()

      await wrapper.vm.loadallgroups(callback)

      expect(mockModGroupStore.listMT).toHaveBeenCalledWith({
        grouptype: 'Freegle',
      })
    })

    it('calls callback after loading', async () => {
      const wrapper = mountComponent()
      const callback = vi.fn()

      await wrapper.vm.loadallgroups(callback)

      expect(callback).toHaveBeenCalled()
    })
  })

  describe('send', () => {
    it('calls alertStore.add with correct data for specific group', async () => {
      mockModGroupStore.allGroups = { 1: { id: 1 } }
      const wrapper = mountComponent()
      wrapper.vm.from = 'info'
      wrapper.vm.subject = 'Test Subject'
      wrapper.vm.text = 'Test body'
      wrapper.vm.html = '<p>HTML</p>'
      wrapper.vm.confirm = true
      wrapper.vm.tryhard = true
      wrapper.vm.groupid = 42

      const callback = vi.fn()
      await wrapper.vm.send(callback)

      expect(mockAlertStore.add).toHaveBeenCalledWith({
        from: 'info',
        subject: 'Test Subject',
        text: 'Test body',
        html: '<p>HTML</p>',
        askclick: 1,
        tryhard: 1,
        groupid: 42,
      })
    })

    it('uses AllFreegle for groupid when groupid < 0', async () => {
      mockModGroupStore.allGroups = { 1: { id: 1 } }
      const wrapper = mountComponent()
      wrapper.vm.from = 'info'
      wrapper.vm.subject = 'Test Subject'
      wrapper.vm.text = 'Test body'
      wrapper.vm.html = null
      wrapper.vm.confirm = false
      wrapper.vm.tryhard = false
      wrapper.vm.groupid = -1

      const callback = vi.fn()
      await wrapper.vm.send(callback)

      expect(mockAlertStore.add).toHaveBeenCalledWith({
        from: 'info',
        subject: 'Test Subject',
        text: 'Test body',
        html: null,
        askclick: 0,
        tryhard: 0,
        groupid: 'AllFreegle',
      })
    })

    it('calls callback after sending', async () => {
      const wrapper = mountComponent()
      wrapper.vm.from = 'info'
      wrapper.vm.subject = 'Test'
      wrapper.vm.text = 'Body'
      wrapper.vm.groupid = 1

      const callback = vi.fn()
      await wrapper.vm.send(callback)

      expect(callback).toHaveBeenCalled()
    })
  })

  describe('fetch', () => {
    it('sets busy to true during fetch', async () => {
      mockModGroupStore.allGroups = { 1: { id: 1 } }
      const wrapper = mountComponent()

      let busyDuringFetch = false
      mockAlertStore.fetch.mockImplementation(() => {
        busyDuringFetch = wrapper.vm.busy
        return Promise.resolve()
      })

      await wrapper.vm.fetch()
      expect(busyDuringFetch).toBe(true)
    })

    it('sets busy to false after fetch', async () => {
      mockModGroupStore.allGroups = { 1: { id: 1 } }
      mockAlertStore.fetch.mockResolvedValue({})
      const wrapper = mountComponent()

      await wrapper.vm.fetch()

      expect(wrapper.vm.busy).toBe(false)
    })

    it('calls alertStore.fetch', async () => {
      mockModGroupStore.allGroups = { 1: { id: 1 } }
      mockAlertStore.fetch.mockResolvedValue({})
      const wrapper = mountComponent()

      await wrapper.vm.fetch()

      expect(mockAlertStore.fetch).toHaveBeenCalled()
    })
  })

  describe('from options', () => {
    it('includes all email options when groups loaded', async () => {
      mockModGroupStore.allGroups = { 1: { id: 1 } }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      const html = wrapper.html()
      expect(html).toContain('info@...')
      expect(html).toContain('support@...')
      expect(html).toContain('councils@...')
      expect(html).toContain('mentors@...')
      expect(html).toContain('newgroups@...')
      expect(html).toContain('geeks@...')
      expect(html).toContain('board@...')
      expect(html).toContain('returningofficer@...')
      expect(html).toContain('volunteers@...')
      expect(html).toContain('volunteersupport@...')
    })
  })

  describe('warning for all groups', () => {
    it('shows danger warning when groupid is negative', async () => {
      mockModGroupStore.allGroups = { 1: { id: 1 } }
      const wrapper = mountComponent()
      wrapper.vm.groupid = -1
      await wrapper.vm.$nextTick()

      const notices = wrapper.findAll('.notice-message')
      const dangerNotice = notices.filter((n) => n.classes().includes('danger'))
      expect(dangerNotice.length).toBeGreaterThan(0)
      expect(wrapper.text()).toContain('This will go to all groups')
    })

    it('shows danger variant send button when sending to all groups', async () => {
      mockModGroupStore.allGroups = { 1: { id: 1 } }
      const wrapper = mountComponent()
      wrapper.vm.groupid = -1
      await wrapper.vm.$nextTick()

      const dangerButton = wrapper.findAll('button').find((b) => {
        return (
          b.classes().includes('danger') &&
          b.text().includes('Send to all groups')
        )
      })
      expect(dangerButton).toBeDefined()
    })

    it('shows primary send button when sending to specific group', async () => {
      mockModGroupStore.allGroups = { 1: { id: 1 } }
      const wrapper = mountComponent()
      wrapper.vm.groupid = 1
      await wrapper.vm.$nextTick()

      const sendButton = wrapper.findAll('button').find((b) => {
        return b.text().includes('Send')
      })
      expect(sendButton?.classes()).toContain('primary')
    })
  })

  describe('alerts history display', () => {
    it('shows alert history when alerts exist', async () => {
      mockModGroupStore.allGroups = { 1: { id: 1 } }
      mockAlertStore.list = {
        1: { id: 1, created: '2024-01-01', subject: 'Test' },
      }
      const wrapper = mountComponent()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.alert-history').exists()).toBe(true)
    })

    it('shows loading image when busy and no alerts', async () => {
      mockModGroupStore.allGroups = { 1: { id: 1 } }
      mockAlertStore.list = {}
      const wrapper = mountComponent()
      wrapper.vm.busy = true
      await wrapper.vm.$nextTick()

      const spinner = wrapper.find('.spinner-border')
      expect(spinner.exists()).toBe(true)
    })

    it('shows Show history button when not busy and no alerts', async () => {
      mockModGroupStore.allGroups = { 1: { id: 1 } }
      mockAlertStore.list = {}
      const wrapper = mountComponent()
      wrapper.vm.busy = false
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Show history')
    })
  })

  describe('quill toolbar options', () => {
    it('has toolbar options defined', () => {
      const wrapper = mountComponent()
      expect(wrapper.vm.toolbarOptions).toBeDefined()
      expect(Array.isArray(wrapper.vm.toolbarOptions)).toBe(true)
    })
  })
})
