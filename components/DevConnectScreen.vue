<template>
  <div class="dev-connect">
    <div class="header">
      <h1>Freegle Dev</h1>
      <p class="subtitle">Connect to your development server</p>
    </div>

    <div v-if="connectionStatus === 'connected'" class="status-card success">
      <v-icon icon="check-circle" class="status-icon" />
      <div>
        <strong>Connected!</strong>
        <p>{{ savedUrl }}</p>
      </div>
    </div>

    <div
      v-else-if="connectionStatus === 'connecting'"
      class="status-card checking"
    >
      <b-spinner small class="me-2" />
      <div>
        <strong>Connecting...</strong>
        <p>{{ testingUrl }}</p>
      </div>
    </div>

    <div v-else-if="connectionStatus === 'failed'" class="status-card error">
      <v-icon icon="exclamation-circle" class="status-icon" />
      <div>
        <strong>Connection Failed</strong>
        <p>{{ errorMessage }}</p>
      </div>
    </div>

    <!-- Saved URL section -->
    <div v-if="savedUrl && connectionStatus !== 'connected'" class="card">
      <h3>Last Server</h3>
      <p class="saved-url">{{ savedUrl }}</p>
      <b-button variant="primary" block @click="reconnect">
        <v-icon icon="sync" /> Reconnect
      </b-button>
    </div>

    <!-- QR Scanner section -->
    <div class="card">
      <h3>Scan QR Code</h3>
      <p class="help-text">
        Open <code>status.localhost/dev-connect</code> on your computer to get
        the QR code
      </p>
      <b-button variant="secondary" block :disabled="scanning" @click="scanQR">
        <v-icon :icon="scanning ? 'spinner' : 'qrcode'" :spin="scanning" />
        {{ scanning ? 'Scanning...' : 'Scan QR Code' }}
      </b-button>
    </div>

    <!-- Manual URL entry -->
    <div class="card">
      <h3>Enter URL Manually</h3>
      <b-form-group label="Dev Server URL">
        <b-form-input
          v-model="manualUrl"
          placeholder="http://192.168.1.100:3002"
          @keyup.enter="connectManual"
        />
      </b-form-group>
      <b-button
        variant="outline-primary"
        block
        :disabled="!manualUrl"
        @click="connectManual"
      >
        Connect
      </b-button>
    </div>

    <!-- Help section -->
    <div class="card help">
      <h3>Troubleshooting</h3>
      <ul>
        <li>Phone must be on same WiFi as dev machine</li>
        <li>Dev server must be running (docker-compose up)</li>
        <li>Check firewall allows port 3002</li>
      </ul>
      <p class="note">
        <strong>Note:</strong> Push notifications do not work in the dev app.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Preferences } from '@capacitor/preferences'
import { BarcodeScanner } from '@aspect/aspectra'

const emit = defineEmits(['connected'])

const savedUrl = ref(null)
const manualUrl = ref('')
const testingUrl = ref('')
const connectionStatus = ref('idle') // idle, connecting, connected, failed
const errorMessage = ref('')
const scanning = ref(false)

const DEV_SERVER_URL_KEY = 'dev_server_url'

onMounted(async () => {
  // Load saved URL
  const { value } = await Preferences.get({ key: DEV_SERVER_URL_KEY })
  if (value) {
    savedUrl.value = value
    manualUrl.value = value
  }
})

async function saveUrl(url) {
  await Preferences.set({ key: DEV_SERVER_URL_KEY, value: url })
  savedUrl.value = url
}

async function testConnection(url) {
  testingUrl.value = url
  connectionStatus.value = 'connecting'
  errorMessage.value = ''

  try {
    // Try to fetch from the dev server
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    // If we get here without an abort, the server responded
    connectionStatus.value = 'connected'
    await saveUrl(url)
    emit('connected', url)
    return true
  } catch (error) {
    connectionStatus.value = 'failed'
    if (error.name === 'AbortError') {
      errorMessage.value = 'Connection timed out. Check the URL and network.'
    } else {
      errorMessage.value = error.message || 'Could not reach the server'
    }
    return false
  }
}

async function reconnect() {
  if (savedUrl.value) {
    await testConnection(savedUrl.value)
  }
}

async function connectManual() {
  if (manualUrl.value) {
    let url = manualUrl.value.trim()
    // Add http:// if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url
    }
    await testConnection(url)
  }
}

async function scanQR() {
  scanning.value = true
  try {
    // Request camera permission
    const permission = await BarcodeScanner.checkPermission({ force: true })

    if (!permission.granted) {
      errorMessage.value = 'Camera permission required to scan QR codes'
      connectionStatus.value = 'failed'
      return
    }

    // Start scanning
    const result = await BarcodeScanner.startScan()

    if (result.hasContent) {
      const url = result.content
      if (url.startsWith('http://') || url.startsWith('https://')) {
        manualUrl.value = url
        await testConnection(url)
      } else {
        errorMessage.value = 'Invalid QR code - expected a URL'
        connectionStatus.value = 'failed'
      }
    }
  } catch (error) {
    console.error('QR scan error:', error)
    errorMessage.value = 'Failed to scan QR code: ' + error.message
    connectionStatus.value = 'failed'
  } finally {
    scanning.value = false
    await BarcodeScanner.stopScan()
  }
}
</script>

<style scoped lang="scss">
.dev-connect {
  min-height: 100vh;
  background: linear-gradient(135deg, #5cb85c 0%, #3d8b3d 100%);
  padding: 20px;
  color: white;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding-top: 40px;

  h1 {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .subtitle {
    opacity: 0.9;
    font-size: 16px;
  }
}

.card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  color: #333;

  h3 {
    font-size: 18px;
    margin-bottom: 12px;
    color: #333;
  }

  .help-text {
    font-size: 14px;
    color: #666;
    margin-bottom: 12px;

    code {
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 4px;
    }
  }

  .saved-url {
    font-family: monospace;
    background: #f5f5f5;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 12px;
    word-break: break-all;
  }

  &.help {
    background: rgba(255, 255, 255, 0.9);

    ul {
      margin: 0;
      padding-left: 20px;
      font-size: 14px;
      color: #666;
    }

    li {
      margin-bottom: 4px;
    }

    .note {
      margin-top: 12px;
      font-size: 13px;
      color: #dc3545;
    }
  }
}

.status-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;

  .status-icon {
    font-size: 24px;
  }

  p {
    margin: 4px 0 0;
    font-size: 14px;
    opacity: 0.9;
  }

  &.success {
    background: rgba(255, 255, 255, 0.2);
  }

  &.checking {
    background: rgba(255, 255, 255, 0.15);
  }

  &.error {
    background: rgba(220, 53, 69, 0.3);
  }
}
</style>
