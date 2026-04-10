<template>
  <div class="partnerships">
    <section class="partnerships__hero">
      <h1>Partner with Freegle</h1>
      <p class="partnerships__strapline">
        We help people give and get things for free, locally — like online
        dating for stuff. Together, we can do even more.
      </p>
    </section>

    <section class="partnerships__section">
      <h2>Why Partner with Us?</h2>
      <p>
        Freegle reduces waste, alleviates poverty and builds stronger
        communities — all through the simple act of giving things a second life.
        We've been doing it successfully for over 15 years.
      </p>
      <div class="partnerships__impacts">
        <div class="partnerships__impact partnerships__impact--env">
          <div class="partnerships__impact-visual">
            <v-icon icon="leaf" />
          </div>
          <h3>Environmental</h3>
          <p>
            Keeping usable items out of landfill, reducing carbon footprints and
            driving the circular economy at grassroots level.
          </p>
        </div>
        <div class="partnerships__impact partnerships__impact--social">
          <div class="partnerships__impact-visual">
            <v-icon icon="hand-holding-heart" />
          </div>
          <h3>Social</h3>
          <p>
            Life-changing for people in poverty — furnishing homes and meeting
            daily needs without financial compromise.
          </p>
        </div>
        <div class="partnerships__impact partnerships__impact--community">
          <div class="partnerships__impact-visual">
            <v-icon icon="users" />
          </div>
          <h3>Community</h3>
          <p>
            Bringing neighbours together, building resilience and creating
            opportunities across the UK.
          </p>
        </div>
      </div>
    </section>

    <section class="partnerships__section partnerships__section--highlight">
      <div class="partnerships__mission-vision">
        <div class="partnerships__mission-item">
          <h2>Our Mission</h2>
          <p>
            To reduce waste and alleviate poverty by increasing reuse — creating
            more sustainable and resilient communities across the UK.
          </p>
        </div>
        <div class="partnerships__mission-divider" />
        <div class="partnerships__mission-item">
          <h2>Our Vision</h2>
          <p>
            A world where useful items are not wasted and reuse in communities
            is normalised.
          </p>
        </div>
      </div>
    </section>

    <section class="partnerships__section">
      <h2>Our Values</h2>
      <div class="partnerships__values">
        <div class="partnerships__value">
          <div class="partnerships__value-marker" />
          <span
            >Making a real difference to people's lives and the planet.</span
          >
        </div>
        <div class="partnerships__value">
          <div class="partnerships__value-marker" />
          <span
            >Kindness and efficient use of resources at the heart of everything
            we do.</span
          >
        </div>
        <div class="partnerships__value">
          <div class="partnerships__value-marker" />
          <span>Not-for-profit and community-led.</span>
        </div>
        <div class="partnerships__value">
          <div class="partnerships__value-marker" />
          <span
            >Collaborative working with other organisations to maximise
            impact.</span
          >
        </div>
      </div>
    </section>

    <section class="partnerships__section">
      <h2>The Team</h2>
      <p>
        Our partnerships programme is delivered by a dedicated team with deep
        expertise in waste prevention, reuse and community engagement.
      </p>

      <div class="partnerships__team">
        <div
          v-for="member in team"
          :key="member.name"
          class="partnerships__member"
        >
          <img
            :src="member.photo"
            :alt="member.name"
            class="partnerships__member-photo"
          />
          <div class="partnerships__member-info">
            <div class="partnerships__member-top">
              <h3>{{ member.name }}</h3>
              <p class="partnerships__member-role">
                {{ member.role }}
              </p>
              <p class="partnerships__member-bio">
                {{ member.bio }}
              </p>
            </div>
            <div class="partnerships__member-bottom">
              <div
                v-if="member.freegleStory"
                class="partnerships__member-story"
              >
                <span class="partnerships__story-label">Favourite freegle</span>
                <p>&ldquo;{{ member.freegleStory }}&rdquo;</p>
              </div>
              <ExternalLink
                v-if="member.linkedin"
                :href="member.linkedin"
                class="partnerships__linkedin"
              >
                <v-icon :icon="['fab', 'linkedin']" />
                <span>Connect on LinkedIn</span>
              </ExternalLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="partnerships__section partnerships__section--cta">
      <h2>Get in Touch</h2>
      <p>Interested in partnering with Freegle? We'd love to hear from you.</p>
      <div class="partnerships__cta-links">
        <ExternalLink
          href="mailto:partnerships@ilovefreegle.org"
          class="partnerships__email-link"
        >
          <v-icon icon="envelope" />
          partnerships@ilovefreegle.org
        </ExternalLink>
        <ExternalLink
          href="https://www.linkedin.com/company/freegle"
          class="partnerships__freegle-linkedin"
        >
          <v-icon :icon="['fab', 'linkedin']" />
          Follow Freegle on LinkedIn
        </ExternalLink>
      </div>
    </section>
  </div>
</template>
<script setup>
import { buildHead } from '~/composables/useBuildHead'
import { useRoute } from '#imports'
import ExternalLink from '~/components/ExternalLink.vue'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

useHead(
  buildHead(
    route,
    runtimeConfig,
    'Partnerships',
    'Partner with Freegle to reduce waste, alleviate poverty and build stronger communities.'
  )
)

const team = [
  {
    name: 'Natalie Ibbott',
    role: 'Councils & Partnerships Project Manager',
    photo: '/partnerships/natalie-ibbott.jpg',
    bio: '20+ years in waste, reuse, recycling and circular economy. Experience ranges from teaching primary school children about waste to running circular economy strategy workshops for city executives. PRINCE2 Practitioner specialising in project management, research and partnership working.',
    freegleStory:
      "I posted a Wanted for topiary shears, definitely not expecting a reply — but my local community didn't let me down. A few hours later I had an old but perfectly functioning pair!",
    linkedin: 'https://www.linkedin.com/in/natalieibbott/',
  },
  {
    name: 'Anna Carmichael',
    role: 'Councils & Partnerships Project Manager',
    photo: '/partnerships/anna-carmichael.jpg',
    bio: '20+ years in waste prevention, environmental education and sustainability across local government, schools, regional partnerships and the not-for-profit sector. Specialises in building relationships, behaviour change and creating engaging content that inspires positive action.',
    freegleStory:
      "I sourced a huge bag of odd socks from my local Freegle community for a children's sock-puppet workshop — within hours! The donor said it gave him just the nudge he needed to clear out his sock drawer.",
    linkedin: 'https://www.linkedin.com/in/anna-c-carmichael/',
  },
  {
    name: 'Edward Hibbert',
    role: 'Co-Founder & CTO',
    photo: '/partnerships/edward-hibbert.jpg',
    bio: 'Builds software that increases kindness in the world. After a career in large-scale email and voicemail systems, Edward had a carefully planned midlife crisis and moved into tech-for-good. Board member of Volunteer Edinburgh and Give a Kidney, passionate about how volunteering enriches lives and organisations.',
    freegleStory:
      'An automatic potato peeler. I got carried away and collected it, then was too scared to use it. It sat in my kitchen staring at me reproachfully. So I freegled it on. Oh, and I freegled a kidney once.',
    linkedin: 'https://www.linkedin.com/in/edwardhibbert/',
  },
  {
    name: 'Cat Fletcher',
    role: 'Co-Founder & Media',
    photo: '/partnerships/cat-fletcher.jpg',
    bio: 'Award-winning waste-prevention activist, researcher and practitioner. Cat co-founded Freegle in 2009 and leads all publicity. A driving force behind the multi-award-winning Waste House at the University of Brighton, she runs Planet Brighton environmental hub and advises councils, the NHS and corporates on reuse and circular economy.',
    freegleStory:
      'After my house accidentally burnt down, I was able to get a new wardrobe and all the essentials I needed literally the next day — thanks to the kindness of freeglers.',
    linkedin: 'https://www.linkedin.com/in/cat-fletcher-uk/',
  },
]
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.partnerships {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;

  @include media-breakpoint-up(md) {
    padding: 2rem;
  }
}

/* ── Hero ─────────────────────────────────────────────────── */

.partnerships__hero {
  text-align: center;
  padding: 2.5rem 1.5rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, $color-green--bg-gradient 0%, white 100%);
  border-bottom: 3px solid $color-green-background;

  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: $color-header;
    margin-bottom: 0.75rem;

    @include media-breakpoint-up(md) {
      font-size: 2.5rem;
    }
  }
}

.partnerships__strapline {
  font-size: 1.0625rem;
  line-height: 1.6;
  color: $gray-700;
  max-width: 560px;
  margin: 0 auto;

  @include media-breakpoint-up(md) {
    font-size: 1.125rem;
  }
}

/* ── Sections ─────────────────────────────────────────────── */

.partnerships__section {
  background: white;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm);

  @include media-breakpoint-up(md) {
    padding: 2rem;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: $color-header;
    margin-bottom: 0.75rem;

    @include media-breakpoint-up(md) {
      font-size: 1.375rem;
    }
  }

  > p {
    font-size: 0.9375rem;
    line-height: 1.7;
    color: $gray-700;
    margin-bottom: 1rem;
  }
}

.partnerships__section--highlight {
  background: linear-gradient(135deg, $color-green--bg-gradient 0%, white 100%);
  border-left: 3px solid $color-green-background;
}

/* ── Impact cards ─────────────────────────────────────────── */

.partnerships__impacts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 1.25rem;

  @include media-breakpoint-up(md) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.partnerships__impact {
  padding: 1.5rem;
  border-top: 3px solid transparent;
  text-align: center;

  @include media-breakpoint-up(md) {
    padding: 1.75rem 1.25rem;
  }

  h3 {
    font-size: 1rem;
    font-weight: 700;
    color: $gray-800;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.875rem;
    line-height: 1.65;
    color: $gray-700;
    margin: 0;
  }
}

.partnerships__impact--env {
  background: #f0f7ed;
  border-top-color: $color-green-background;
}

.partnerships__impact--social {
  background: #fef7f0;
  border-top-color: $color-warning;
}

.partnerships__impact--community {
  background: #eef5fc;
  border-top-color: $color-secondary;
}

.partnerships__impact-visual {
  width: 3.5rem;
  height: 3.5rem;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.375rem;

  .partnerships__impact--env & {
    background: rgba($color-green-background, 0.15);
    color: $color-green-background;
  }

  .partnerships__impact--social & {
    background: rgba($color-warning, 0.15);
    color: $color-warning;
  }

  .partnerships__impact--community & {
    background: rgba($color-secondary, 0.15);
    color: $color-secondary;
  }
}

/* ── Mission / Vision ─────────────────────────────────────── */

.partnerships__mission-vision {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @include media-breakpoint-up(md) {
    flex-direction: row;
    align-items: flex-start;
    gap: 2rem;
  }
}

.partnerships__mission-item {
  flex: 1;

  p {
    font-size: 1rem;
    line-height: 1.7;
    color: $gray-700;
    font-style: italic;
    margin: 0;
  }
}

.partnerships__mission-divider {
  display: none;

  @include media-breakpoint-up(md) {
    display: block;
    width: 1px;
    align-self: stretch;
    background: $color-green-background;
    opacity: 0.3;
  }
}

/* ── Values ───────────────────────────────────────────────── */

.partnerships__values {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.partnerships__value {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 0.75rem 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: $gray-700;
  border-bottom: 1px solid $gray-200;

  &:last-child {
    border-bottom: none;
  }
}

.partnerships__value-marker {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin-top: 0.5rem;
  border-radius: 50%;
  background: $color-green-background;
}

/* ── Team ─────────────────────────────────────────────────── */

.partnerships__team {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-top: 1.25rem;

  @include media-breakpoint-up(md) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.partnerships__member {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  background: $gray-100;

  @include media-breakpoint-up(md) {
    padding: 1.75rem;
  }
}

.partnerships__member-photo {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  margin-bottom: 1rem;
}

.partnerships__member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-self: stretch;

  h3 {
    font-size: 1.0625rem;
    font-weight: 700;
    color: $gray-800;
    margin-bottom: 0.125rem;
  }
}

.partnerships__member-top {
  flex: 1;
}

.partnerships__member-bottom {
  margin-top: auto;
}

.partnerships__member-role {
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: $color-green-background;
  margin-bottom: 0.75rem;
}

.partnerships__member-bio {
  font-size: 0.875rem;
  line-height: 1.65;
  color: $gray-700;
  margin-bottom: 0;
}

.partnerships__member-story {
  padding: 0.625rem 0.75rem;
  background: white;
  margin-bottom: 0.75rem;

  p {
    font-size: 0.8125rem;
    line-height: 1.6;
    color: $gray-600;
    font-style: italic;
    margin: 0;
  }
}

.partnerships__story-label {
  display: block;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $color-green-background;
  margin-bottom: 0.25rem;
}

.partnerships__linkedin {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #0a66c2;
  background: #e8f0fe;
  border-radius: 2rem;
  text-decoration: none;
  transition: all 0.15s ease;

  &:hover {
    background: #0a66c2;
    color: white;
    text-decoration: none;
  }
}

/* ── CTA ──────────────────────────────────────────────────── */

.partnerships__section--cta {
  text-align: center;
  background: linear-gradient(135deg, $color-green--bg-gradient 0%, white 100%);
  padding: 2rem 1.5rem;

  @include media-breakpoint-up(md) {
    padding: 2.5rem;
  }
}

.partnerships__cta-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;

  @include media-breakpoint-up(sm) {
    flex-direction: row;
    justify-content: center;
  }
}

.partnerships__email-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.0625rem;
  font-weight: 600;
  color: white;
  background: $color-green-background;
  text-decoration: none;
  padding: 0.75rem 1.75rem;
  border: 2px solid $color-green-background;
  transition: all 0.2s ease;

  &:hover {
    background: darken($color-green-background, 8%);
    border-color: darken($color-green-background, 8%);
    color: white;
    text-decoration: none;
  }
}

.partnerships__freegle-linkedin {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.0625rem;
  font-weight: 600;
  color: #0a66c2;
  background: white;
  text-decoration: none;
  padding: 0.75rem 1.75rem;
  border: 2px solid #0a66c2;
  transition: all 0.2s ease;

  &:hover {
    background: #0a66c2;
    color: white;
    text-decoration: none;
  }
}
</style>
