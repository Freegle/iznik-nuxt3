<template>
  <client-only>
    <div class="about__wrapper">
      <div class="about">
        <div role="tablist">
          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                v-b-toggle.accordion-what
                block
                href="#"
                variant="default"
                class="w-100"
              >
                What Do We Do?
              </b-button>
            </b-card-header>
            <b-collapse
              id="accordion-what"
              accordion="about-us-accordion"
              role="tabpanel"
            >
              <b-card-body>
                <b-card-text>
                  <p>
                    Do your unwanted but useful items need new homes? Are you
                    looking for something?
                  </p>
                  <p>
                    We help people give and get things for free in their local
                    community. Some people have stuff they don't want any more.
                    Other people would like things they don't have. We match
                    them up. We don't have physical premises, or warehouses -
                    people give things directly to each other.
                  </p>
                  <p><em>Don't throw it away, give it away!</em></p>
                </b-card-text>
              </b-card-body>
            </b-collapse>
          </b-card>
          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                v-b-toggle.accordion-how
                block
                href="#"
                variant="default"
                class="w-100"
              >
                How Does It Work?
              </b-button>
            </b-card-header>
            <b-collapse
              id="accordion-how"
              accordion="about-us-accordion"
              role="tabpanel"
            >
              <b-card-body>
                <b-card-text>
                  <p>It's simple.</p>
                  <ul>
                    <li>Post a message offering an item.</li>
                    <li>Other people see it and reply to you.</li>
                    <li>Choose who to give it to and they collect.</li>
                    <li>
                      You've decluttered, made someone's day and saved an item
                      from landfill.
                    </li>
                  </ul>
                  <p>That's freegling! And it's all free.</p>
                  <p>
                    You can also search or browse the items offered, or post a
                    request for something that other people might have.
                  </p>
                </b-card-text>
              </b-card-body>
            </b-collapse>
          </b-card>
          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                v-b-toggle.accordion-who
                block
                href="#"
                variant="default"
                class="w-100"
              >
                Who Are We?
              </b-button>
            </b-card-header>
            <b-collapse
              id="accordion-who"
              accordion="about-us-accordion"
              role="tabpanel"
            >
              <b-card-body>
                <b-card-text>
                  <h2>We Love Volunteers!</h2>
                  <p>Freegle is run by volunteers. Here are some of us:</p>

                  <b-list-group horizontal class="mb-1 mt-2 flex flex-wrap">
                    <b-list-group-item
                      v-for="volunteer in volunteers"
                      :key="'volunteering-' + volunteer.id"
                      class="bg-transparent p-0"
                    >
                      <ProfileImage
                        v-if="!volunteer?.profile?.default"
                        :image="volunteer?.profile?.turl"
                        size="lg"
                        :alt-text="
                          'Profile picture for ' + volunteer.displayname
                        "
                      />
                    </b-list-group-item>
                  </b-list-group>

                  <h2>Our Board</h2>
                  <p>Our volunteers elect a Board. Here they are:</p>
                  <div
                    v-for="boardmember in board"
                    :key="'board-' + boardmember.id"
                    class="bg-transparent p-0 pt-2 d-flex"
                  >
                    <ProfileImage
                      :image="
                        boardmember?.profile?.default
                          ? null
                          : boardmember?.profile?.url
                          ? boardmember.profile.url
                          : boardmember?.profile?.turl
                      "
                      class="mr-2"
                      size="lg"
                      :alt-text="
                        'Profile picture for ' + boardmember.displayname
                      "
                    />
                    <div>
                      <span class="font-weight-bold">{{
                        boardmember.displayname
                      }}</span>
                      <p v-if="boardmember.description">
                        {{ boardmember.description }}
                      </p>
                    </div>
                  </div>

                  <h2>Why We Do It</h2>
                  <p>People have different reasons! Common reasons are:</p>
                  <ul>
                    <li>
                      Many of us are passionate about the environment - and
                      reuse means we make and destroy less stuff.
                    </li>
                    <li>
                      We like helping people get things they need, which they
                      otherwise couldn't get.
                    </li>
                    <li>
                      We care about our local communities, and this is a way to
                      make them better.
                    </li>
                  </ul>
                  <h2>Get Involved!</h2>
                  <p>
                    We're always looking for more volunteers - for local
                    communities, graphics, publicity, improving the
                    website...there's lots to do.
                  </p>
                  <p>
                    If you'd like to get involved,
                    <nuxt-link no-prefetch to="/help"
                      >contact your local community</nuxt-link
                    >.
                  </p>
                </b-card-text>
              </b-card-body>
            </b-collapse>
          </b-card>
          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                v-b-toggle.accordion-funding
                block
                href="#"
                variant="default"
                class="w-100"
              >
                How Is It Funded?
              </b-button>
            </b-card-header>
            <b-collapse
              id="accordion-funding"
              accordion="about-us-accordion"
              role="tabpanel"
            >
              <b-card-body>
                <b-card-text>
                  <p>
                    <strong
                      >Freegle is free to use, but not free to run.</strong
                    >
                    We provide a free service, and keep costs
                    <em>phenomenally</em> low thanks to our large number of
                    committed volunteers -
                    <strong
                      >our annual budget averages around £80,000 each
                      year</strong
                    >
                    for the whole of the UK. You can see our accounts
                    <ExternalLink href="https://freegle.in/Accounts"
                      >here</ExternalLink
                    >.
                  </p>
                  <p>
                    Nevertheless, there are still costs involved, and if we had
                    more money we could get more people freegling more often. We
                    run on a shoestring...actually, we're saving up to buy a
                    shoestring.
                  </p>
                  <p>
                    There are lots of good causes out there, many of them for
                    life-threatening conditions, all of them competing for
                    charity funding. It usually goes to bigger charities than us
                    doing more important work, so we currently rely on voluntary
                    donations to cover our costs. You can donate
                    <nuxt-link no-prefetch to="/donate">here</nuxt-link>.
                  </p>
                  <p>
                    Many current donations come from our volunteers, who are
                    already donating their time and may not be able to donate
                    money as well. If you can,
                    <strong>please donate £3</strong> to keep us running - but
                    anything you can give is very welcome. Regular monthly
                    donations are especially helpful.
                  </p>
                  <p>
                    We also have ads on the site and in emails. It doesn't raise
                    as much as you'd think, but it helps keep us running.
                  </p>
                </b-card-text>
              </b-card-body>
            </b-collapse>
          </b-card>
          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                v-b-toggle.accordion-legal
                block
                href="#"
                variant="default"
                class="w-100"
              >
                What's Our Legal Structure
              </b-button>
            </b-card-header>
            <b-collapse
              id="accordion-legal"
              accordion="about-us-accordion"
              role="tabpanel"
            >
              <b-card-body>
                <b-card-text>
                  <p>
                    Freegle is a UK-wide umbrella organisation, formed in 2009
                    by experienced volunteers and members of the free reuse
                    community. We are a charity, and our charitable aims are:
                  </p>
                  <ul>
                    <li>
                      Promoting the keeping of usable items out of landfill.
                    </li>
                    <li>
                      Promoting and supporting local community groups working in
                      the area of reuse.
                    </li>
                    <li>
                      Empowering and supporting volunteers working for local
                      Freegle groups.
                    </li>
                    <li>
                      Informing and educating the public about environmental
                      matters related to the reuse and recycling of unwanted
                      usable goods.
                    </li>
                    <li>Promoting sustainable waste management practices.</li>
                  </ul>
                  <p>
                    Each Freegle local group is run independently and is
                    affiliated to Freegle Ltd, which provides central services
                    (such as this website) to these groups and their volunteers.
                    Freegle Ltd is a registered society under the Co-operative
                    and Community Benefit Societies Act 2014 (previously known
                    as an Industrial and Provident Society for Community
                    Benefit). Freegle Ltd is owned and governed by its members.
                    Local and national volunteers are eligible for membership.
                  </p>
                  <p>
                    Charities of this type are slightly unusual in that they do
                    not register with the Charity Commission (see
                    <ExternalLink
                      href="https://www.gov.uk/government/publications/exempt-charities-cc23/exempt-charities"
                      >here</ExternalLink
                    >
                    ). Instead they register with the Financial Conduct
                    Authority (our registration number is
                    <ExternalLink
                      href="https://mutuals.fca.org.uk/Search/Society/9593"
                      >32410R</ExternalLink
                    >
                    ) and also register with HMRC as charitable (our reference
                    is XT32865). So we're legally a charity, and can claim Gift
                    Aid if you
                    <!-- eslint-disable-next-line-->
                  <nuxt-link  no-prefetch to="/donate">donate</nuxt-link>,
                    <span
                      >but of a slightly different type than you might be used
                      to.</span
                    >
                  </p>
                </b-card-text>
              </b-card-body>
            </b-collapse>
          </b-card>
          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button
                v-b-toggle.accordion-questions
                block
                href="#"
                variant="default"
                class="w-100"
              >
                Got questions?
              </b-button>
            </b-card-header>
            <b-collapse
              id="accordion-questions"
              accordion="about-us-accordion"
              role="tabpanel"
            >
              <b-card-body>
                <b-card-text>
                  <p>
                    If you have questions, please
                    <nuxt-link no-prefetch to="/help">contact us</nuxt-link>.
                  </p>
                </b-card-text>
              </b-card-body>
            </b-collapse>
          </b-card>
        </div>
      </div>
    </div>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { useTeamStore } from '~/stores/team'
import { buildHead } from '~/composables/useBuildHead'
import ProfileImage from '~/components/ProfileImage'
import { computed } from '#imports'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

useHead(
  buildHead(
    route,
    runtimeConfig,
    'About Us',
    'What we do, how it works, who we are...all that stuff.'
  )
)

const teamStore = useTeamStore()
teamStore.fetch('Volunteers')
teamStore.fetch('Board')

const volunteers = computed(() => teamStore.getTeam('Volunteers')?.members)
const board = computed(() => teamStore.getTeam('Board')?.members)
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.about__wrapper {
  display: flex;
  justify-content: center;
  background: $gray-100;
  min-height: 100vh;
}

.about {
  width: 100%;
  max-width: 800px;
  padding: 1rem;

  @include media-breakpoint-up(md) {
    padding: 1.5rem;
  }
}

:deep(.card) {
  border: none;
  background: $white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 0.5rem;

  .card-header {
    background: transparent;
    border: none;
    padding: 0;
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 1rem 1.25rem;
    font-weight: 600;
    font-size: 1rem;
    color: $gray-800;
    background: $white;
    border: none;
    text-align: left;
    transition: background-color 0.15s ease;

    &:hover {
      background: $gray-100;
      color: $gray-900;
    }

    &:focus {
      box-shadow: none;
    }

    &::after {
      content: '+';
      font-size: 1.25rem;
      font-weight: 400;
      color: $gray-500;
    }

    &:not(.collapsed)::after {
      content: '−';
    }
  }

  .card-body {
    padding: 0 1.25rem 1.25rem;
    border-top: 1px solid $gray-200;

    p {
      font-size: 0.9375rem;
      line-height: 1.7;
      color: $gray-700;
      margin-bottom: 0.75rem;

      &:last-child {
        margin-bottom: 0;
      }
    }

    ul,
    ol {
      padding-left: 1.25rem;
      margin-bottom: 0.75rem;

      li {
        font-size: 0.9375rem;
        line-height: 1.7;
        color: $gray-700;
        margin-bottom: 0.25rem;
      }
    }

    h2 {
      font-size: 1.1rem;
      font-weight: 600;
      color: $gray-800;
      margin: 1.25rem 0 0.75rem;

      &:first-child {
        margin-top: 0;
      }
    }
  }
}
</style>
