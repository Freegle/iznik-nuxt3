#!/usr/bin/env node
/**
 * Generates basic unit test scaffolds for Vue components
 * Usage: node scripts/generate-component-tests.js [--dry-run] [--pattern=glob]
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const patternArg = args.find(a => a.startsWith('--pattern='))
const pattern = patternArg ? patternArg.split('=')[1] : 'components/*.vue'

// Get list of component files
const componentsDir = path.join(__dirname, '..', 'components')
const testsDir = path.join(__dirname, '..', 'tests', 'unit', 'components')

// Find all Vue files matching pattern
function findComponents(dir, pattern) {
  try {
    const result = execSync(`find ${dir} -name "*.vue" -type f`, { encoding: 'utf8' })
    return result.trim().split('\n').filter(Boolean)
  } catch (e) {
    return []
  }
}

// Parse a Vue component to extract props, emits, and basic structure
function parseComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const info = {
    name: path.basename(filePath, '.vue'),
    hasProps: false,
    props: [],
    hasEmits: false,
    emits: [],
    hasSlots: /<slot/.test(content),
    usesStore: /use\w+Store/.test(content),
    usesModal: /useOurModal/.test(content),
    usesRouter: /useRouter|useRoute/.test(content),
    isAsync: /async\s+setup|onMounted|onBeforeMount/.test(content),
    hasComputed: /computed\(/.test(content),
    hasMethods: /function\s+\w+\s*\(/.test(content),
    storeMatches: content.match(/use(\w+)Store/g) || [],
    composableMatches: content.match(/use(\w+)\(/g) || [],
  }

  // Extract defineProps
  const propsMatch = content.match(/defineProps\s*(?:<[^>]+>)?\s*\(\s*\{([^}]+)\}/s)
  if (propsMatch) {
    info.hasProps = true
    const propsBlock = propsMatch[1]
    const propNames = propsBlock.match(/(\w+)\s*:/g)
    if (propNames) {
      info.props = propNames.map(p => p.replace(':', '').trim())
    }
  }

  // Extract defineEmits
  const emitsMatch = content.match(/defineEmits\s*\(\s*\[([^\]]+)\]/)
  if (emitsMatch) {
    info.hasEmits = true
    const emitsStr = emitsMatch[1]
    info.emits = emitsStr.match(/'([^']+)'/g)?.map(e => e.replace(/'/g, '')) || []
  }

  return info
}

// Generate test file content
function generateTest(componentInfo, relativePath) {
  const { name, props, emits, hasSlots, usesStore, usesModal, isAsync, storeMatches } = componentInfo

  // Build imports section
  let imports = `import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ${name} from '~/components/${name}.vue'`

  // Build mocks section
  let mocks = ''

  // Mock stores
  const uniqueStores = [...new Set(storeMatches)]
  uniqueStores.forEach(storeCall => {
    const storeName = storeCall.replace('use', '').replace('Store', '').toLowerCase()
    mocks += `
// Mock ${storeCall}
const mock${storeCall.replace('use', '')} = {
  // Add store properties as needed
}
vi.mock('~/stores/${storeName}', () => ({
  ${storeCall}: () => mock${storeCall.replace('use', '')},
}))`
  })

  // Mock useOurModal
  if (usesModal) {
    mocks += `
// Mock useOurModal
const mockModal = { value: null }
const mockShow = vi.fn()
const mockHide = vi.fn()
vi.mock('~/composables/useOurModal', () => ({
  useOurModal: () => ({ modal: mockModal, show: mockShow, hide: mockHide }),
}))`
  }

  // Build mount helper
  const propsDefault = props.length > 0
    ? props.map(p => `        // ${p}: undefined,`).join('\n')
    : '        // Add required props'

  let mountHelper = `
  function mountComponent(props = {}) {
    return mount(${name}, {
      props: {
${propsDefault}
        ...props,
      },
      global: {
        stubs: {
          'b-button': true,
          'b-modal': true,
          'b-row': { template: '<div><slot /></div>' },
          'b-col': { template: '<div><slot /></div>' },
          'v-icon': true,
          'nuxt-link': { template: '<a><slot /></a>', props: ['to'] },
        },
      },
    })
  }`

  // Build test cases
  let testCases = `
  describe('rendering', () => {
    it('mounts without error', ${isAsync ? 'async ' : ''}() => {
      const wrapper = ${isAsync ? 'await ' : ''}mountComponent()
      ${isAsync ? 'await flushPromises()' : ''}
      expect(wrapper.exists()).toBe(true)
    })
  })`

  // Add props tests if component has props
  if (props.length > 0) {
    testCases += `

  describe('props', () => {
${props.map(p => `    it('accepts ${p} prop', () => {
      // TODO: Add appropriate test value
      const wrapper = mountComponent({ ${p}: undefined })
      expect(wrapper.props('${p}')).toBeDefined()
    })`).join('\n\n')}
  })`
  }

  // Add emits tests if component has emits
  if (emits.length > 0) {
    testCases += `

  describe('events', () => {
${emits.map(e => `    it('emits ${e} event', async () => {
      const wrapper = mountComponent()
      // TODO: Trigger the event
      // await wrapper.find('...').trigger('click')
      // expect(wrapper.emitted('${e}')).toBeTruthy()
    })`).join('\n\n')}
  })`
  }

  // Add slots tests if component has slots
  if (hasSlots) {
    testCases += `

  describe('slots', () => {
    it('renders default slot content', () => {
      const wrapper = mount(${name}, {
        slots: { default: 'Test content' },
        global: { stubs: { 'b-button': true, 'b-modal': true } },
      })
      expect(wrapper.text()).toContain('Test content')
    })
  })`
  }

  // Combine all parts
  return `${imports}
${mocks}

describe('${name}', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
${mountHelper}
${testCases}
})
`
}

// Main execution
const components = findComponents(componentsDir, pattern)
let created = 0
let skipped = 0

console.log(`Found ${components.length} components`)

components.forEach(compPath => {
  const name = path.basename(compPath, '.vue')
  const testPath = path.join(testsDir, `${name}.spec.js`)

  if (fs.existsSync(testPath)) {
    skipped++
    return
  }

  const info = parseComponent(compPath)
  const testContent = generateTest(info, compPath)

  if (dryRun) {
    console.log(`Would create: ${testPath}`)
  } else {
    fs.writeFileSync(testPath, testContent)
    console.log(`Created: ${testPath}`)
  }
  created++
})

console.log(`\nSummary: ${created} created, ${skipped} skipped (already exist)`)
if (dryRun) {
  console.log('(Dry run - no files written)')
}
