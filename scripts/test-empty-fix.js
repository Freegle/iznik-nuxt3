const fs = require('fs')
const glob = require('glob')

const testFiles = glob.sync('tests/unit/**/*.spec.js')
let fixed = 0

testFiles.forEach((file) => {
  let content = fs.readFileSync(file, 'utf-8')
  const originalContent = content

  // Remove empty describe blocks - match describe('text', () => { })
  // with possible whitespace/newlines inside
  content = content.replace(
    /\n\s*describe\(['"](.*?)['"]\s*,\s*\(\)\s*=>\s*\{\s*\}\s*\)\n?/g,
    '\n'
  )

  // Also handle describe blocks with only a beforeEach but no tests
  content = content.replace(
    /\n\s*describe\(['"](.*?)['"]\s*,\s*\(\)\s*=>\s*\{\s*beforeEach\([^)]*\)\s*\{[^}]*\}\s*\)\s*\}\s*\)\n?/g,
    '\n'
  )

  if (content !== originalContent) {
    fs.writeFileSync(file, content)
    console.log('Fixed:', file)
    fixed++
  }
})

console.log(`\nFixed ${fixed} files`)
