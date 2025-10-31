<template>
  <client-only>
    <div class="story-analysis">
      <div class="container-fluid">
        <h1>📖 Freegle Story Analysis for Donation Appeals</h1>

        <div class="intro">
          <p>
            <strong>Data Source:</strong>
            <code>https://api.ilovefreegle.org/apiv2/story?limit=100</code>
          </p>
          <p>
            Analysis of 20 real Freegle member stories to identify which
            narratives create stronger psychological hooks for donation appeals.
          </p>
          <p>
            <strong>Key Finding:</strong> Stories with specific individuals,
            life-changing outcomes, and transformation narratives trigger
            stronger emotional responses suitable for larger donation asks.
          </p>
        </div>

        <b-tabs content-class="mt-4" fill>
          <!-- TAB 1: HIGH-VALUE DONATION STORIES -->
          <b-tab title="💰 Larger Donations (£10-£25)" active>
            <div class="tab-header">
              <h2>Strong Psychological Hook Stories</h2>
              <p>
                <strong>Best for:</strong> £10-£25 donation appeals after
                successful action
              </p>
              <p>
                <strong>Characteristics:</strong> Life-changing impact, specific
                individuals helped, transformation narratives, crisis support,
                community action
              </p>
            </div>

            <div class="values-section">
              <h3>What Freeglers Value (High Emotional Resonance):</h3>
              <ul class="values-list">
                <li>
                  <strong>Helping vulnerable people in crisis</strong> -
                  "Sammy's flat is now a home she can be proud of"
                </li>
                <li>
                  <strong>Enabling major life transitions</strong> - Helping
                  newlyweds, students, refugees start fresh
                </li>
                <li>
                  <strong>Creating tangible transformations</strong> - Furniture
                  refurbished and cherished
                </li>
                <li>
                  <strong>Supporting community action</strong> - Beach cleanups,
                  environmental projects
                </li>
                <li>
                  <strong>Preserving dignity and independence</strong> - People
                  able to furnish homes with pride
                </li>
              </ul>
            </div>

            <!-- Story Examples -->
            <div class="story-card high-impact">
              <div class="story-badge">⭐ Highest Impact</div>
              <h4>Amazing!</h4>
              <p class="story-text">
                A parent shared their gratitude after receiving numerous donated
                items for their daughter Sammy's newly furnished supported
                living flat. Despite financial constraints and mobility
                challenges, community members generously contributed furniture
                and essentials, with some providing free delivery. The parent
                expressed deep appreciation, noting that
                <strong
                  >"Sammy's flat is now a home she can be proud of."</strong
                >
              </p>
              <div class="story-meta">
                <span class="badge badge-success">Has Image</span>
                <span class="badge badge-primary">Life-changing</span>
                <span class="badge badge-primary">Vulnerable person</span>
                <span class="badge badge-primary">Specific individual</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £15-£25:</strong>
                <ul>
                  <li>Named individual (Sammy) creates personal connection</li>
                  <li>
                    Transformation from "constraints" to "home to be proud of"
                  </li>
                  <li>
                    Multiple community members helping triggers reciprocity
                  </li>
                  <li>Disability context creates empathy and desire to help</li>
                  <li>Image reinforces the tangible transformation</li>
                </ul>
              </div>
            </div>

            <div class="story-card high-impact">
              <h4>How Freegle helped me with house-clearing</h4>
              <p class="story-text">
                A detailed account of clearing a late father's home using the
                Freegle platform. The author successfully distributed beds,
                furniture, kitchen items, and various household goods to people
                in need, including
                <strong>a newly arrived Nigerian family</strong> and
                <strong>a young photographer</strong>. While most items found
                appreciative recipients, some challenges emerged including
                no-shows and items that wouldn't sell. Overall, the author found
                Freegle effective for clearing the property while helping
                others.
              </p>
              <div class="story-meta">
                <span class="badge badge-primary">Helping refugees</span>
                <span class="badge badge-primary">Loss/grief context</span>
                <span class="badge badge-primary">Detailed narrative</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £10-£20:</strong>
                <ul>
                  <li>
                    Grief context (late father) creates emotional connection
                  </li>
                  <li>
                    Helping newly arrived family appeals to social justice
                    values
                  </li>
                  <li>Specific individuals (Nigerian family, photographer)</li>
                  <li>
                    Honest about challenges - builds trust and authenticity
                  </li>
                  <li>Multiple people helped demonstrates scale of impact</li>
                </ul>
              </div>
            </div>

            <div class="story-card high-impact">
              <h4>The generosity of Freeglers</h4>
              <p class="story-text">
                A user shared gratitude for community support after requesting
                help on Freegle for their niece relocating to a new apartment.
                The response was "wonderful" with many people contributing
                items. The post acknowledges "Pat" for exceptional assistance
                and thanks the Freegle staff for enabling the charitable
                platform.
              </p>
              <div class="story-meta">
                <span class="badge badge-primary">Community response</span>
                <span class="badge badge-primary">Named helper (Pat)</span>
                <span class="badge badge-primary">First home</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £10-£15:</strong>
                <ul>
                  <li>First apartment setup is relatable life milestone</li>
                  <li>Multiple donors responding triggers social proof</li>
                  <li>Naming "Pat" personalizes the community spirit</li>
                  <li>Gratitude toward volunteers primes donation mindset</li>
                </ul>
              </div>
            </div>

            <div class="story-card high-impact">
              <h4>To save waste and to help others</h4>
              <p class="story-text">
                Individual describes donating items including wallpaper scraps,
                furniture, and household goods to people in need. Gifts included
                a nearly-new three-piece suite to
                <strong>newlyweds furnishing their home</strong> and a desk
                rescued from disposal that went to
                <strong>a student and his pregnant wife</strong>.
              </p>
              <div class="story-meta">
                <span class="badge badge-primary">Newlyweds</span>
                <span class="badge badge-primary">Expecting family</span>
                <span class="badge badge-primary">Multiple recipients</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £10-£15:</strong>
                <ul>
                  <li>
                    Newlyweds and expecting parents are universally sympathetic
                  </li>
                  <li>
                    "Rescued from disposal" creates waste-prevention urgency
                  </li>
                  <li>Dual mission: helping people AND environment</li>
                  <li>Specific life transitions (marriage, pregnancy)</li>
                </ul>
              </div>
            </div>

            <div class="story-card high-impact">
              <h4>Once more unto the beach...</h4>
              <p class="story-text">
                Volunteers used Freegled bulk bags to remove rubbish from
                beaches along the Solway Firth border region. The Cumbrian group
                was photographed on the Scottish coast near Annan in Dumfries
                and Galloway, continuing their cleanup efforts wherever debris
                washes ashore.
              </p>
              <div class="story-meta">
                <span class="badge badge-success">Has Image</span>
                <span class="badge badge-primary">Community action</span>
                <span class="badge badge-primary">Environmental impact</span>
                <span class="badge badge-primary">Volunteer group</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £10-£20:</strong>
                <ul>
                  <li>Visual proof (photograph) of community action</li>
                  <li>
                    Geographic specificity (Solway Firth) creates local pride
                  </li>
                  <li>
                    Ongoing commitment ("continuing cleanup") shows dedication
                  </li>
                  <li>
                    Environmental activism appeals to values-aligned donors
                  </li>
                  <li>Group effort demonstrates collective impact</li>
                </ul>
              </div>
            </div>

            <div class="story-card high-impact">
              <h4>Free furniture for my living room</h4>
              <p class="story-text">
                A user received a white TV cabinet in French shabby chic office
                style, refurbished it with a fresh coat of paint, and
                successfully integrated it into their living room. They
                expressed gratitude to the original gift-giver and praised the
                Freegle platform.
              </p>
              <div class="story-meta">
                <span class="badge badge-success">Has Image</span>
                <span class="badge badge-primary">Transformation</span>
                <span class="badge badge-primary">Upcycling</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £5-£10:</strong>
                <ul>
                  <li>
                    Before/after transformation creates satisfying narrative arc
                  </li>
                  <li>Image shows tangible result (visual proof of value)</li>
                  <li>Upcycling demonstrates creativity and resourcefulness</li>
                  <li>Gratitude to donor models the community spirit</li>
                </ul>
              </div>
            </div>

            <div class="story-card high-impact">
              <h4>Recycle, reuse, upcycle, make, repair & sew</h4>
              <p class="story-text">
                A Freegle member shares their experience since 2017, gifting
                unwanted items like wood, paint, and fabric scraps. They've also
                received items they've upcycled, including a 1950s kitchen stool
                that was reupholstered and repurposed for their kitchen.
              </p>
              <div class="story-meta">
                <span class="badge badge-success">Has Image</span>
                <span class="badge badge-primary">Long-term member</span>
                <span class="badge badge-primary">Restoration skills</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £5-£10:</strong>
                <ul>
                  <li>
                    Long-term commitment (since 2017) shows sustained value
                  </li>
                  <li>
                    Specific restoration project (1950s stool) is compelling
                  </li>
                  <li>
                    Dual role (giver and receiver) demonstrates circularity
                  </li>
                  <li>Image of upcycled item shows creative potential</li>
                </ul>
              </div>
            </div>
          </b-tab>

          <!-- TAB 2: SMALLER DONATION STORIES -->
          <b-tab title="💚 Smaller Donations (£3-£5)">
            <div class="tab-header">
              <h2>Gentle Psychological Hook Stories</h2>
              <p>
                <strong>Best for:</strong> £3-£5 donation appeals or general
                support requests
              </p>
              <p>
                <strong>Characteristics:</strong> Environmental benefits,
                platform appreciation, routine recycling, convenience,
                decluttering, abstract impact
              </p>
            </div>

            <div class="values-section">
              <h3>What Freeglers Value (General Appreciation):</h3>
              <ul class="values-list">
                <li>
                  <strong>Environmental consciousness</strong> - Preventing
                  landfill waste, reducing carbon footprint
                </li>
                <li>
                  <strong>Community connection</strong> - Meeting nice people,
                  local networks
                </li>
                <li>
                  <strong>Convenience and guilt-free decluttering</strong> -
                  Better than throwing away
                </li>
                <li>
                  <strong>Platform functionality</strong> - Easy to use,
                  volunteers make it work
                </li>
                <li>
                  <strong>Mutual benefit</strong> - Finding useful items while
                  giving away unwanted ones
                </li>
                <li>
                  <strong>Sustainable lifestyle</strong> - Aligns with values of
                  reuse and recycling
                </li>
              </ul>
            </div>

            <!-- Story Examples -->
            <div class="story-card low-impact">
              <h4>My Freegle story</h4>
              <p class="story-text">
                State pensioner describes how Freegle enables gift-sharing
                across communities. As a disabled person with limited finances,
                they appreciate the platform's ability to "gift all the things
                we don't want, or need" while benefiting the environment by
                keeping items from landfills. The user praises Freegle's diverse
                community and volunteers for facilitating mutual aid and
                sustainability.
              </p>
              <div class="story-meta">
                <span class="badge badge-info">Environmental focus</span>
                <span class="badge badge-info">Platform appreciation</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £3-£5:</strong>
                <ul>
                  <li>
                    General appreciation rather than specific transformation
                  </li>
                  <li>Environmental benefits are abstract, not dramatic</li>
                  <li>Volunteer praise prompts modest reciprocal support</li>
                  <li>Routine usage rather than crisis/milestone context</li>
                </ul>
              </div>
            </div>

            <div class="story-card low-impact">
              <h4>My Freegle story</h4>
              <p class="story-text">
                A long-time Freegle member shares their experience giving away
                items like a fitted kitchen, doors, and bike shed, while
                receiving engineering bricks, a rabbit hutch, and mugs. They
                emphasize how the platform helps reduce landfill waste and
                connects environmentally conscious people.
              </p>
              <div class="story-meta">
                <span class="badge badge-info">Routine exchanges</span>
                <span class="badge badge-info">Environmental values</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £3-£5:</strong>
                <ul>
                  <li>List of items lacks emotional narrative</li>
                  <li>
                    Environmental connection is intellectual, not visceral
                  </li>
                  <li>
                    Mutual exchange is practical rather than transformative
                  </li>
                  <li>Good for donors who appreciate functionality</li>
                </ul>
              </div>
            </div>

            <div class="story-card low-impact">
              <h4>I hate throwing things away</h4>
              <p class="story-text">
                A person shares how they've struggled with clutter from items
                unsuitable for charity shops but potentially useful elsewhere.
                They explain that selling online is inefficient, making Freegle
                their preferred solution for guilt-free decluttering.
              </p>
              <div class="story-meta">
                <span class="badge badge-info">Convenience focus</span>
                <span class="badge badge-info">Personal benefit</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £3-£5:</strong>
                <ul>
                  <li>
                    Focuses on personal convenience rather than helping others
                  </li>
                  <li>"Guilt-free decluttering" is self-oriented</li>
                  <li>Solving a personal problem, not a community need</li>
                  <li>Low emotional stakes - decluttering is routine</li>
                </ul>
              </div>
            </div>

            <div class="story-card low-impact">
              <h4>I'm retired and enjoy recycling</h4>
              <p class="story-text">
                I've received children's stair gates, a folding bed, bedside
                drawer units, and other stuff which I can't remember.
              </p>
              <div class="story-meta">
                <span class="badge badge-info">Hobby/leisure</span>
                <span class="badge badge-info">Brief</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £2-£3:</strong>
                <ul>
                  <li>Very brief - lacks narrative depth or emotional arc</li>
                  <li>"Enjoy recycling" positions it as leisure activity</li>
                  <li>Can't remember items - low personal significance</li>
                  <li>No indication of need or transformation</li>
                </ul>
              </div>
            </div>

            <div class="story-card low-impact">
              <h4>Great to Freegle</h4>
              <p class="story-text">
                I love Freegle. It's a great opportunity to re-use and
                re-purpose items that others no longer require. Also,
                eco-friendly providing a massive saving on landfill and utilises
                existing resources again or in a new way.
              </p>
              <div class="story-meta">
                <span class="badge badge-info">General praise</span>
                <span class="badge badge-info">Environmental abstract</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £3-£5:</strong>
                <ul>
                  <li>Generic praise without specific examples</li>
                  <li>Environmental benefits stated abstractly</li>
                  <li>No personal story or emotional hook</li>
                  <li>Positive tone prompts modest reciprocal gesture</li>
                </ul>
              </div>
            </div>

            <div class="story-card low-impact">
              <h4>Made my 1st Freegle give away today. Yay!!</h4>
              <p class="story-text">
                User shared their experience donating dining chairs through
                Freegle after a renovation project. They discovered the platform
                via Google search, found it user-friendly, and were pleased the
                chairs went to a couple who would actually use them.
              </p>
              <div class="story-meta">
                <span class="badge badge-info">First-time user</span>
                <span class="badge badge-info">Platform usability</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £3-£5:</strong>
                <ul>
                  <li>First experience - positive but lacks deep connection</li>
                  <li>Focus on platform usability rather than impact</li>
                  <li>Recipients ("a couple") are generic, not specific</li>
                  <li>Renovation context is neutral, not crisis</li>
                </ul>
              </div>
            </div>

            <div class="story-card low-impact">
              <h4>I love recycling</h4>
              <p class="story-text">
                A long-time Freegle user shares their appreciation for the
                service, noting how it enables them to donate items to those who
                need them, prevents waste from reaching landfills, and helps
                them discover useful things for their own home. They also praise
                the volunteers who operate the platform.
              </p>
              <div class="story-meta">
                <span class="badge badge-info">Long-term user</span>
                <span class="badge badge-info">Volunteer appreciation</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £3-£5:</strong>
                <ul>
                  <li>Generic description of benefits without specifics</li>
                  <li>Volunteer praise creates modest reciprocity</li>
                  <li>
                    Environmental and social benefits both stated abstractly
                  </li>
                  <li>
                    Personal benefit (finding things) dilutes altruism angle
                  </li>
                </ul>
              </div>
            </div>

            <div class="story-card low-impact">
              <h4>My Freegle story</h4>
              <p class="story-text">
                Debs shares her positive experience as a long-time Freegle
                member living in Eastbourne. She highlights successfully
                rehoming unwanted items and receiving great finds herself,
                noting that while some people have been unreliable, most
                interactions have been warm and appreciative. She
                enthusiastically endorses the platform.
              </p>
              <div class="story-meta">
                <span class="badge badge-info">Platform review</span>
                <span class="badge badge-info">Mixed experiences</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £3-£5:</strong>
                <ul>
                  <li>Reads like a product review rather than impact story</li>
                  <li>Mentioning unreliable people adds negative note</li>
                  <li>"Great finds" focuses on personal benefit</li>
                  <li>Warm endorsement prompts modest support</li>
                </ul>
              </div>
            </div>

            <div class="story-card low-impact">
              <h4>Great to keep things out of landfill</h4>
              <p class="story-text">
                Without freegle, we hired things to prevent them going to
                landfill. Much better to give them away. Our burden becomes your
                useful item!
              </p>
              <div class="story-meta">
                <span class="badge badge-info">Environmental focus</span>
                <span class="badge badge-info">Brief</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £2-£3:</strong>
                <ul>
                  <li>Very brief - minimal emotional engagement</li>
                  <li>
                    "Our burden becomes your useful item" is transactional
                  </li>
                  <li>Environmental benefit is only hook</li>
                  <li>No personal connection or narrative</li>
                </ul>
              </div>
            </div>

            <div class="story-card low-impact">
              <h4>Love recycling</h4>
              <p class="story-text">
                Personal account of a lifelong commitment to recycling and
                sustainable living, including shopping secondhand, acquiring
                items through community sharing platforms, and minimizing
                environmental impact.
              </p>
              <div class="story-meta">
                <span class="badge badge-info">Lifestyle values</span>
                <span class="badge badge-info">Environmental identity</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £3-£5:</strong>
                <ul>
                  <li>Freegle is one of many sustainable practices</li>
                  <li>No specific Freegle story or transformation</li>
                  <li>General environmental values rather than impact</li>
                  <li>Appeals to values-aligned donors but lacks urgency</li>
                </ul>
              </div>
            </div>

            <div class="story-card low-impact">
              <h4>
                Offloading from half a lifetime in one house, to be continued
              </h4>
              <p class="story-text">
                Long-time Freegle user shares their experience downsizing after
                43 years in one home. They've found new owners for items
                including an almost-new carpet and underlay for a mother and
                son, while also appreciating the interesting connections made
                through the community.
              </p>
              <div class="story-meta">
                <span class="badge badge-info">Downsizing</span>
                <span class="badge badge-info">Community connections</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £5-£8:</strong>
                <ul>
                  <li>Downsizing is relatable but not crisis/urgent</li>
                  <li>"Mother and son" recipients add mild personal touch</li>
                  <li>"Interesting connections" is nice but low stakes</li>
                  <li>43 years context adds some emotional weight</li>
                </ul>
              </div>
            </div>

            <div class="story-card low-impact">
              <h4>Making home made presents</h4>
              <p class="story-text">
                A person from Carlisle new to Freegle seeks decoupage supplies
                including photo frames, jars, tins, and paints. They're
                recovering from back surgery and making baubles as a therapeutic
                hobby while preparing handmade Christmas gifts.
              </p>
              <div class="story-meta">
                <span class="badge badge-info">Hobby/craft</span>
                <span class="badge badge-info">Health recovery</span>
              </div>
              <div class="donation-appeal">
                <strong>Why this works for £5-£8:</strong>
                <ul>
                  <li>Back surgery recovery adds sympathy angle</li>
                  <li>Therapeutic hobby is positive but low urgency</li>
                  <li>Christmas gifts context is seasonal/nice</li>
                  <li>Seeking rather than giving - different dynamic</li>
                </ul>
              </div>
            </div>
          </b-tab>
        </b-tabs>

        <!-- Analysis Summary -->
        <div class="analysis-summary">
          <h2>🎯 Key Insights for Donation Appeals</h2>

          <div class="insight-grid">
            <div class="insight-card">
              <h3>📊 Narrative Patterns</h3>
              <p>
                <strong>High-value appeals need:</strong>
              </p>
              <ul>
                <li>Named individuals (Sammy, Pat, Nigerian family)</li>
                <li>
                  Life transitions (first home, bereavement, disability support)
                </li>
                <li>Before/after transformation</li>
                <li>Crisis or vulnerability context</li>
                <li>Multiple beneficiaries showing scale</li>
                <li>Visual proof (images)</li>
              </ul>

              <p>
                <strong>Low-value appeals work with:</strong>
              </p>
              <ul>
                <li>General platform appreciation</li>
                <li>Environmental benefits (abstract)</li>
                <li>Convenience and decluttering</li>
                <li>Routine exchanges</li>
                <li>Volunteer appreciation</li>
              </ul>
            </div>

            <div class="insight-card">
              <h3>💡 Emotional Triggers</h3>
              <p>
                <strong>Stories that justify £10-£25:</strong>
              </p>
              <ul>
                <li>
                  <strong>Empathy:</strong> Disabled daughter, refugees,
                  expectant families
                </li>
                <li>
                  <strong>Pride:</strong> "Home she can be proud of", community
                  action
                </li>
                <li>
                  <strong>Reciprocity:</strong> "Wonderful response" from
                  community
                </li>
                <li>
                  <strong>Justice:</strong> Helping vulnerable, preventing waste
                </li>
                <li>
                  <strong>Achievement:</strong> Tangible transformation with
                  images
                </li>
              </ul>

              <p>
                <strong>Stories that work for £3-£5:</strong>
              </p>
              <ul>
                <li>
                  <strong>Satisfaction:</strong> Decluttering, finding useful
                  items
                </li>
                <li>
                  <strong>Values alignment:</strong> Environmental consciousness
                </li>
                <li>
                  <strong>Appreciation:</strong> Platform works well, volunteers
                  help
                </li>
                <li><strong>Community:</strong> Meeting nice people locally</li>
              </ul>
            </div>

            <div class="insight-card">
              <h3>📝 Copywriting Recommendations</h3>
              <p>
                <strong>For larger donations (£10-£25):</strong>
              </p>
              <ul>
                <li>
                  <strong>Lead with named individual:</strong> "Sarah's story",
                  "How we helped Sammy"
                </li>
                <li>
                  <strong>Use transformation language:</strong> "from struggling
                  to thriving"
                </li>
                <li>
                  <strong>Include image:</strong> Show the person or
                  transformation
                </li>
                <li>
                  <strong>Specify outcome:</strong> "flat is now a home she can
                  be proud of"
                </li>
                <li>
                  <strong>Connect to donor:</strong> "Your support makes stories
                  like this possible"
                </li>
              </ul>

              <p>
                <strong>For smaller donations (£3-£5):</strong>
              </p>
              <ul>
                <li>
                  <strong>Emphasize scale:</strong> "2.6 million members helping
                  each other"
                </li>
                <li>
                  <strong>Environmental impact:</strong> "47,000 tonnes saved
                  from landfill"
                </li>
                <li>
                  <strong>Community appreciation:</strong> "Join 1,200+
                  supporters this month"
                </li>
                <li>
                  <strong>Low commitment:</strong> "Just £3 keeps the platform
                  running"
                </li>
              </ul>
            </div>

            <div class="insight-card">
              <h3>⚡ Implementation Strategy</h3>
              <ol>
                <li>
                  <strong>Build story library:</strong> Collect 20-30 stories
                  with images, categorized by emotional intensity
                </li>
                <li>
                  <strong>A/B test story types:</strong> High-impact stories vs
                  environmental stories for different donation amounts
                </li>
                <li>
                  <strong>Rotate stories monthly:</strong> Keep appeals fresh,
                  prevent fatigue
                </li>
                <li>
                  <strong>Match story to context:</strong>
                  <ul>
                    <li>
                      Post-successful action (just posted/received) →
                      High-impact story + £10-£25 ask
                    </li>
                    <li>
                      General browse/landing page → Environmental story + £3-£5
                      ask
                    </li>
                    <li>
                      Monthly newsletter → Community story + recurring £5/month
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>Get permission:</strong> Contact story authors for
                  permission to use in appeals
                </li>
                <li>
                  <strong>Add analytics:</strong> Track which stories convert
                  best at different amounts
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div class="api-info">
          <h3>🔗 Using the Story API</h3>
          <p>
            <strong>Endpoint:</strong>
            <code>https://api.ilovefreegle.org/apiv2/story?limit=100</code>
          </p>
          <p><strong>Returns:</strong> Array of story IDs (newest first)</p>
          <p>
            <strong>Get full story:</strong>
            <code>https://api.ilovefreegle.org/apiv2/story/:id</code>
          </p>
          <p>
            <strong>Group stories:</strong>
            <code>https://api.ilovefreegle.org/apiv2/story/group/:groupid</code>
          </p>

          <div class="code-example">
            <pre><code>// Example: Fetch and display a high-impact story
const storyIds = await fetch('https://api.ilovefreegle.org/apiv2/story?limit=100')
  .then(r => r.json())

// Get stories with images first (likely higher impact)
for (const id of storyIds) {
  const story = await fetch(`https://api.ilovefreegle.org/apiv2/story/${id}`)
    .then(r => r.json())

  if (story.image && story.story.length > 200) {
    // Use this story for donation appeal
    displayDonationAppeal(story)
    break
  }
}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </client-only>
</template>

<script setup>
definePageMeta({
  title: 'Story Analysis for Donation Appeals',
})
</script>

<style scoped lang="scss">
.story-analysis {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 10px;

  @media (min-width: 768px) {
    padding: 20px;
  }
}

h1 {
  text-align: center;
  color: #2c5f2d;
  font-size: 24px;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    font-size: 32px;
    margin-bottom: 30px;
  }
}

.intro {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  border-left: 4px solid #2c5f2d;

  code {
    background: #f4f4f4;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 14px;
  }
}

.tab-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #4a90e2;

  h2 {
    color: #2c5f2d;
    margin-top: 0;
  }
}

.values-section {
  background: #fff9e6;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  border-left: 4px solid #ffa500;

  h3 {
    color: #cc8800;
    margin-top: 0;
  }
}

.values-list {
  list-style: none;
  padding-left: 0;

  li {
    margin-bottom: 12px;
    padding-left: 25px;
    position: relative;

    &:before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #2c5f2d;
      font-weight: bold;
    }
  }
}

.story-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;

  &.high-impact {
    border-left: 4px solid #2d8659;
  }

  &.low-impact {
    border-left: 4px solid #4a90e2;
  }

  h4 {
    color: #2c5f2d;
    margin-top: 0;
    margin-bottom: 15px;
  }

  .story-text {
    line-height: 1.7;
    color: #333;
    margin-bottom: 15px;
  }

  .story-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    color: #333;
    padding: 5px 12px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: bold;
    border: 2px solid #ffb300;
  }

  .story-meta {
    margin: 15px 0;

    .badge {
      margin-right: 8px;
      margin-bottom: 8px;
      padding: 5px 10px;
      font-size: 12px;
    }

    .badge-success {
      background: #2d8659;
      color: white;
    }

    .badge-primary {
      background: #4a90e2;
      color: white;
    }

    .badge-info {
      background: #17a2b8;
      color: white;
    }
  }

  .donation-appeal {
    background: #f0f8ff;
    border-left: 3px solid #4a90e2;
    padding: 15px;
    margin-top: 15px;
    border-radius: 4px;

    strong {
      color: #2c5f2d;
    }

    ul {
      margin-top: 10px;
      margin-bottom: 0;
      padding-left: 20px;

      li {
        margin-bottom: 8px;
        line-height: 1.6;
      }
    }
  }
}

.analysis-summary {
  background: white;
  padding: 30px;
  border-radius: 8px;
  margin-top: 40px;
  border: 3px solid #2c5f2d;

  h2 {
    color: #2c5f2d;
    text-align: center;
    margin-top: 0;
  }
}

.insight-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-top: 30px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.insight-card {
  background: #f9f9f9;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;

  h3 {
    color: #2c5f2d;
    margin-top: 0;
    margin-bottom: 15px;
  }

  ul,
  ol {
    margin: 10px 0;
    padding-left: 20px;

    li {
      margin-bottom: 8px;
      line-height: 1.6;
    }
  }
}

.api-info {
  background: #2c2c2c;
  color: #f0f0f0;
  padding: 25px;
  border-radius: 8px;
  margin-top: 40px;

  h3 {
    color: #4a8f4b;
    margin-top: 0;
  }

  code {
    background: #1a1a1a;
    padding: 3px 8px;
    border-radius: 3px;
    color: #4a8f4b;
    font-family: 'Courier New', monospace;
  }

  .code-example {
    background: #1a1a1a;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
    margin-top: 15px;

    pre {
      margin: 0;
      color: #f0f0f0;
      font-size: 14px;
      line-height: 1.5;

      code {
        background: transparent;
        padding: 0;
      }
    }
  }
}
</style>
