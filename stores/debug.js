import { defineStore } from 'pinia'

// Maximum number of log entries to keep in memory
const MAX_LOGS = 500

export const useDebugStore = defineStore('debug', {
  state: () => ({
    logs: [],
    enabled: true,
  }),

  getters: {
    getLogs: (state) => state.logs,
    getLogsAsText: (state) => {
      return state.logs
        .map((log) => `[${log.timestamp}] [${log.level}] ${log.message}`)
        .join('\n')
    },
  },

  actions: {
    log(level, ...args) {
      if (!this.enabled) return

      const timestamp = new Date().toISOString()
      const message = args
        .map((arg) => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2)
            } catch (e) {
              return String(arg)
            }
          }
          return String(arg)
        })
        .join(' ')

      this.logs.push({
        timestamp,
        level,
        message,
      })

      // Keep only the last MAX_LOGS entries
      if (this.logs.length > MAX_LOGS) {
        this.logs = this.logs.slice(-MAX_LOGS)
      }

      // Also log to console for development
      const consoleMethod =
        level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'
      console[consoleMethod](`[DEBUG ${level}]`, ...args)
    },

    info(...args) {
      this.log('INFO', ...args)
    },

    warn(...args) {
      this.log('WARN', ...args)
    },

    error(...args) {
      this.log('ERROR', ...args)
    },

    debug(...args) {
      this.log('DEBUG', ...args)
    },

    clear() {
      this.logs = []
    },
  },
})
