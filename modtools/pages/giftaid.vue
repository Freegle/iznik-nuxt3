<template>
  <b-container fluid class="bg-white">
    <ModHelpGiftAid />
    <b-card no-body class="mb-2">
      <b-card-body>
        <p>
          You can search for existing Gift Aid details by someone's name,
          address or gift aid ID.
        </p>
        <b-input-group>
          <b-form-input
            v-model="search"
            placeholder="Search for gift aid record"
            @keyup="checkSearch"
          />
          <slot name="append">
            <SpinButton
              variant="white"
              icon-name="search"
              label="Search"
              @handle="doSearch"
            />
          </slot>
        </b-input-group>
        <div v-for="result in results" :key="result.id" class="mt-2">
          <div class="d-flex flex-wrap">
            Gift aid ID&nbsp;<v-icon icon="hashtag" class="text-muted mt-1" />{{
              result.id
            }}
            {{ result.fullname }}&nbsp; (<ExternalLink
              :href="'mailto:' + result.email"
              class="text-muted small mt-1 mr-1 ml-1"
            >
              {{ result.email }} </ExternalLink
            >) user ID&nbsp;<v-icon icon="hashtag" class="text-muted mt-1" />{{
              result.userid
            }}
            -&nbsp;
            <span v-if="result.period === 'Declined'"> Gift Aid declined </span>
            <span v-if="result.period === 'Since'">
              Gift Aid consent for all since {{ dateonly(result.timestamp) }}
            </span>
            <span v-if="result.period === 'This'">
              Gift Aid consent for only {{ dateonly(result.timestamp) }}
            </span>
            <span v-if="result.period === 'Future'">
              Gift Aid consent for all future from
              {{ dateonly(result.timestamp) }}
            </span>
            <span v-if="result.period === 'Past4YearsAndFuture'">
              Gift Aid consent for four years before
              {{ dateonly(result.timestamp) }} and all future.
            </span>
            &nbsp;{{ result.homeaddress }}
          </div>
          <div
            v-for="d in result.donations"
            :key="'donation-' + d.id"
            class="pl-4 small"
          >
            &bull;&nbsp;&pound;{{ d.GrossAmount }} on
            {{ dateshort(d.timestamp) }}
            <span class="small text-muted">via {{ d.source }}</span>
            <span
              v-if="
                d.source === 'PayPalGivingFund' ||
                d.source === 'eBay' ||
                d.source === 'Facebook'
              "
              class="small text-muted"
            >
              (Gift Aid claimed by them not us)
            </span>
          </div>
        </div>
      </b-card-body>
    </b-card>

    <b-card no-body class="mb-2">
      <b-card-body>
        <p>
          You can record a donation which wasn't made via PayPal, e.g. a bank
          transfer or cheque. Please use this carefully. A manual thank you will
          be requested (not just for larger amounts), a Supporter Badge will be
          added, and the user will be prompted to complete a Gift Aid form if
          appropriate.
        </p>
        <p>
          If you put an amount of 0, then this will trigger the Supporter badge
          and ad-suppression. This is useful if someone has donated using PayPal
          top up and checkout, where we don't get their details, and then
          contacted us.
        </p>
        <b-form-input
          v-model="userid"
          type="number"
          placeholder="User's ID from Support Tools"
          class="mt-2"
        />
        <b-form-input
          v-model="amount"
          type="number"
          placeholder="Amount e.g. 1.50. No pound sign"
          class="mt-2"
        />
        <OurDatePicker
          v-model="date"
          lang="en"
          type="date"
          format="DD/MM/YYYY"
          placeholder="Date of donation"
        />
        <SpinButton
          variant="white"
          icon-name="save"
          label="Record external donation"
          class="mt-4"
          @handle="recordDonation"
        />
      </b-card-body>
    </b-card>

    <b-card no-body class="mb-2">
      <b-card-body>
        <p>
          You can also paste in a CSV file of donations from Xero. The first
          line must be the headers, which must always be:
        </p>
        <p class="text-monospace">
          Date,Amt,"Name on Xero",ID / GA from Mod Tools,email address if
          known,"212 Reg, 213 One off",GA?,Name & Ref on bank statement
        </p>
        <b-form-textarea v-model="csv" rows="10" />
        <SpinButton
          variant="white"
          icon-name="play"
          label="Validate CSV"
          class="mt-4 mb-2"
          @handle="validateCSVDonations"
        />
        <NoticeMessage v-if="csvError" variant="danger">
          {{ csvError }}
        </NoticeMessage>
        <!-- eslint-disable-next-line -->
        <NoticeMessage v-else-if="csvTrace" v-html="csvTrace" />
        <SpinButton
          v-if="showSubmitCSV"
          variant="white"
          icon-name="save"
          :disabled="disableSubmitCSV"
          label="Submit donations"
          class="mt-4 mb-2"
          @handle="submitCSVDonations"
        />
        <!-- eslint-disable-next-line -->
        <NoticeMessage v-if="csvTrace2" v-html="csvTrace2" />
      </b-card-body>
    </b-card>

    <ModGiftAid
      v-for="giftaid in giftaids"
      :key="'giftaid-' + giftaid.id"
      :giftaid="giftaid"
      class="mt-1"
    />
    <p v-if="!giftaids.length" class="mt-2 font-weight-bold">
      No gift aid to review.
    </p>
  </b-container>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import Papa from 'papaparse'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import dayjs from 'dayjs'
import { useNuxtApp } from '#app'
import { useDonationStore } from '~/stores/donations'
import { useUserStore } from '~/stores/user'

const { $api } = useNuxtApp()

const donationStore = useDonationStore()
const userStore = useUserStore()

const giftaids = ref([])
const search = ref(null)
const results = ref([])
const userid = ref(null)
const amount = ref(null)
const date = ref(new Date())
const csv = ref(null)
const csvError = ref(null)
const csvTrace = ref(null)
const csvTrace2 = ref(null)
const showSubmitCSV = ref(false)
const disableSubmitCSV = ref(false)
const csvDonations = ref([])

async function getGiftAid() {
  const giftaidList = await $api.giftaid.list()

  // Sort so that the easy ones are at the top.
  giftaids.value = giftaidList.sort((a, b) => {
    if (
      (a.postcode && !b.postcode) ||
      (a.fullname.includes(' ') && !b.fullname.includes(' '))
    ) {
      return -1
    } else if (
      (b.postcode && !a.postcode) ||
      (b.fullname.includes(' ') && !a.fullname.includes(' '))
    ) {
      return 1
    } else {
      return 0
    }
  })
}

async function doSearch(callback) {
  results.value = await $api.giftaid.search(search.value)
  if (callback) {
    callback()
  }
}

function checkSearch(e) {
  if (e.keyCode === 13) {
    doSearch()
  }
}

function recordDonation(callback) {
  if (userid.value && amount.value >= 0 && date.value) {
    donationStore.add(userid.value, amount.value, date.value.toISOString())
  }
  callback()
}

async function validateCSVDonations(callback) {
  csvError.value = null
  showSubmitCSV.value = false
  csvDonations.value = []
  csvTrace.value = ''

  const res = Papa.parse(csv.value.trim())
  console.log('res', res)

  if (res.meta.delimiter !== ',') {
    csvError.value =
      "Data must be comma separated.  If you've used Excel, please use a text editor such as Notepad to open the CSV file, and copy and paste from there."
    return
  }

  if (res.errors.length) {
    csvError.value = res.errors[0].message
    return
  }

  if (res.data?.length === 0) {
    csvError.value = 'No data found.'
    return
  }
  if (res.data[0].length !== 8) {
    csvError.value = 'Expecting 8 columns. Found ' + res.data[0].length
    return
  }

  if (res.data[0][0] !== 'Date') {
    csvError.value =
      "Expecting first column in first row to be 'Date'. Found " +
      res.data[0][0] +
      '.  Maybe you forgot the headers?'
    return
  }

  if (res.data[0][1] !== 'Amt') {
    csvError.value =
      "Expecting second column in first row to be 'Amt'. Found " +
      res.data[0][1] +
      '.  Maybe you forgot the headers?'
    return
  }

  if (res.data[0][3] !== 'ID / GA from Mod Tools') {
    csvError.value =
      "Expecting second column in first row to be 'ID / GA from Mod Tools'. Found " +
      res.data[0][1] +
      '.  Maybe you forgot the headers?'
    return
  }

  // Headers look ok.  Scan the rest of the rows.
  for (let i = 1; i < res.data.length; i++) {
    const row = res.data[i]
    if (row.length !== 8) {
      csvError.value =
        'Expecting 8 columns. Found ' + row.length + ' on row ' + (i + 1)
      break
    }
    const rowDate = dayjs(row[0], 'DD/MM/YYYY')
    if (!rowDate.isValid()) {
      csvError.value = 'Invalid date ' + row[0] + ' on row ' + (i + 1)
      break
    }
    const rowAmount = parseFloat(row[1])
    if (isNaN(rowAmount)) {
      csvError.value = 'Invalid amount on row ' + (i + 1)
      break
    }

    const rowUserid = parseInt(row[3].substring(3))
    if (isNaN(rowUserid)) {
      csvError.value = 'Invalid user ID on row ' + (i + 1)
      break
    }

    // Check if the userid matches a valid user.
    await userStore.fetchMT({ id: rowUserid })

    const user = userStore.byId(rowUserid)

    if (!user?.id) {
      csvError.value =
        'User ID ' +
        rowUserid +
        ' on row ' +
        (i + 1) +
        ' not found in the system.  Unsubscribed or merged?'
    }

    // Check if email found in user's emails
    let emailFound = false
    const email = row[4]
    for (let j = 0; j < user?.emails?.length; j++) {
      if (user.emails[j].email === email) {
        emailFound = true
        break
      }
    }

    if (!emailFound) {
      csvError.value =
        'Email ' +
        row[4] +
        ' on row ' +
        (i + 1) +
        ' not found in the emails for user ID ' +
        rowUserid +
        '.  Perhaps this is the wrong user ID, or the email has been removed?'
      break
    }

    csvDonations.value.push({
      date: rowDate,
      amount: rowAmount,
      userid: rowUserid,
      email,
    })

    csvTrace.value +=
      rowDate.format('YYYY-MM-DD') +
      ' £' +
      rowAmount +
      ' from #' +
      rowUserid +
      ' (' +
      email +
      ')<br />'
  }

  if (!csvError.value) {
    showSubmitCSV.value = true
  }
  callback()
}

async function submitCSVDonations(callback) {
  csvTrace2.value = ''

  for (let i = 0; i < csvDonations.value.length; i++) {
    const donation = csvDonations.value[i]

    const id = await donationStore.add(
      donation.userid,
      donation.amount,
      donation.date.format('YYYY-MM-DD')
    )

    if (id) {
      csvTrace2.value +=
        donation.date.format('YYYY-MM-DD') +
        ' £' +
        donation.amount +
        ' from #' +
        donation.userid +
        ' (' +
        donation.email +
        ') - recorded<br />'
    } else {
      csvTrace2.value +=
        '<span class="text-error">' +
        donation.date.format('YYYY-MM-DD') +
        ' £' +
        donation.amount +
        ' from #' +
        donation.userid +
        ' (' +
        donation.email +
        ') - failed</span><br />'
    }
  }

  disableSubmitCSV.value = true
  callback()
}

onMounted(async () => {
  dayjs.extend(customParseFormat)
  await getGiftAid()
})
</script>
