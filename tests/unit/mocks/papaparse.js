/**
 * Mock for papaparse library
 */
export default {
  parse(csv) {
    if (!csv || csv.trim() === '') {
      return { data: [], errors: [], meta: { delimiter: ',' } }
    }
    // Detect semicolon delimiter
    if (csv.includes(';') && !csv.includes(',')) {
      return { data: [], errors: [], meta: { delimiter: ';' } }
    }
    const lines = csv.trim().split('\n')
    const data = lines.map((line) => line.split(','))
    return { data, errors: [], meta: { delimiter: ',' } }
  },
}
