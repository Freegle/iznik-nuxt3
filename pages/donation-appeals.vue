<template>
  <client-only>
    <div class="donation-appeals">
      <div class="container-fluid">
        <h1>📱 Mobile Donation Appeal Variations</h1>

        <div class="intro">
          <h2>10 Mobile-Optimized Donation Appeals for A/B Testing</h2>
          <p>
            Based on peer-reviewed research and field experiments: agentic
            appeals (+82.3%, PLOS ONE 2018), solution framing (Yale 2024), goal
            proximity effect (+200%, GlobalGiving), and concrete impact data
            (75-80% of donors want this, Accenture/CAF UK). Each shows how the
            appeal would actually appear on mobile.
          </p>
          <p>
            <strong>Context:</strong> After user posts/receives item (peak
            motivation + just saved money). Amounts: £5-£25 range for mobile.
          </p>
          <p class="warning">
            ⚠️ <strong>UK-Specific Considerations:</strong> 44% cite
            affordability as barrier (CAF UK 2025), 67% distrust charity
            overhead spending, 4M fewer donors vs 2019. Freegle's volunteer-run
            model and post-transaction timing address these concerns.
          </p>
        </div>

        <!-- VARIATION 1: Emotional Story (Pure) -->
        <div class="mobile-variation">
          <div class="var-label">
            <span class="var-num">VARIATION #1</span>
            <h3>Emotional Story (Pure - No Statistics)</h3>
            <p class="expected">Expected: £12-15 avg • 18-22% conversion</p>
            <p class="research-note">
              ⚠️ CRITICAL: Do NOT mix statistics with emotional stories.
              Research shows adding stats to emotional appeals REDUCES donations
              (Small, Loewenstein & Slovic 2007).
            </p>
          </div>

          <div class="mobile-frame">
            <div class="mobile-screen">
              <div class="mobile-hero">
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='375' height='180'%3E%3Cdefs%3E%3ClinearGradient id='g1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%232c5f2d' /%3E%3Cstop offset='100%25' style='stop-color:%234a8f4b' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g1)' width='375' height='180'/%3E%3Ctext x='50%25' y='45%25' font-size='20' fill='white' text-anchor='middle' font-family='Arial' font-weight='bold'%3ESammy's Story%3C/text%3E%3Ctext x='50%25' y='70%25' font-size='13' fill='%23e0e0e0' text-anchor='middle' font-family='Arial'%3EPhoto: New home furnished via Freegle%3C/text%3E%3C/svg%3E"
                  alt="Member story"
                />
              </div>
              <div class="mobile-content">
                <h3>You Just Helped Someone Like Sammy</h3>
                <p>
                  When Sammy moved into her first home, she had nothing. No
                  furniture, no kitchen items, no bedding.
                </p>
                <p>
                  Through Freegle, community members gave her everything she
                  needed to make her new place a home.
                </p>
                <p>
                  <strong>Your donation keeps this magic happening.</strong>
                </p>
                <div class="donate-buttons-mobile">
                  <button class="btn-mobile">£5</button>
                  <button class="btn-mobile selected">£10</button>
                  <button class="btn-mobile">£15</button>
                  <button class="btn-mobile">£25</button>
                </div>
                <button class="cta-mobile">Donate Now →</button>
                <p class="micro">Get Supporter badge • 2 min</p>
              </div>
            </div>
          </div>

          <div class="var-research">
            <strong>Research:</strong> Emotional appeals and individual stories
            increase donations through empathy and identifiable victim effect
            (Sandoval et al. 2024). However, adding statistical information to
            emotional appeals reduces donations - keep stories pure without
            numerical data (Small, Loewenstein & Slovic 2007, Judgment &
            Decision Making).<sup><a href="#ref1">1,13</a></sup>
          </div>
        </div>

        <!-- VARIATION 2: "Please Don't Scroll Away" (UK-Adapted) -->
        <div class="mobile-variation">
          <div class="var-label">
            <span class="var-num">VARIATION #2</span>
            <h3>"Please Don't Scroll Away" (UK-Adapted Wikipedia Style)</h3>
            <p class="expected">Expected: £15-18 avg • 20-24% conversion</p>
            <p class="research-note">
              Adapted for UK context: emphasizes volunteer model to address
              trust concerns (67% of UK public distrust charity overhead, GOV.UK
              2024).
            </p>
          </div>

          <div class="mobile-frame">
            <div class="mobile-screen">
              <div class="mobile-content wikipedia-style">
                <h3 class="urgent">Please Don't Scroll Away</h3>
                <p>
                  You just saved money getting something free. Now help keep
                  Freegle free for 2.6M people.
                </p>
                <div class="time-box">
                  ⏰ <strong>Takes 2 minutes</strong> • 97% volunteer-run • No
                  CEO salaries
                </div>
                <p>
                  Your £15 powers the technology that makes free reuse possible.
                </p>
                <div class="donate-buttons-mobile">
                  <button class="btn-mobile">£10</button>
                  <button class="btn-mobile selected">£15</button>
                  <button class="btn-mobile">£25</button>
                  <button class="btn-mobile">£50</button>
                </div>
                <button class="cta-mobile">Donate Now →</button>
                <p class="micro">Funds technology infrastructure only</p>
              </div>
            </div>
          </div>

          <div class="var-research">
            <strong>Research:</strong> Wikipedia's "please don't scroll"
            messaging proven effective through extensive A/B testing (Wikipedia
            Fundraising 2018-19 Report). UK-specific trust issues require
            emphasizing volunteer model: 67% think charities spend too much on
            admin (GOV.UK Public Trust in Charities 2024), but public trusts
            small volunteer-run charities more than professionalized ones.<sup
              ><a href="#ref9">9,14</a></sup
            >
          </div>
        </div>

        <!-- VARIATION 3: Social Proof (Elite Group Framing) -->
        <div class="mobile-variation">
          <div class="var-label">
            <span class="var-num">VARIATION #3</span>
            <h3>Social Proof - Elite Group (Wikipedia-Inspired, HIGH RISK)</h3>
            <p class="expected">Expected: £12-16 avg • 20-25% conversion</p>
            <p class="research-note warning-note">
              ⚠️ HIGH RISK: Negative social proof contradicts standard theory.
              Wikipedia found removing this messaging DECREASED donations, but
              context-dependent. Test carefully - may backfire if users think
              "everyone else freeloads, why shouldn't I?" Consider positive
              reframe: "Join 10,400 supporters powering Freegle for 2.6M
              people."
            </p>
          </div>

          <div class="mobile-frame">
            <div class="mobile-screen">
              <div class="mobile-content">
                <h3 class="stat-headline">Join an Elite Group</h3>
                <p>
                  10,400 supporters power Freegle for 2.6M members.
                  <strong>You just benefited from their generosity.</strong>
                </p>
                <div class="math-simple">
                  🎯 If just <strong>1% gave £10</strong>, we'd be fully funded
                </div>
                <p class="cta-text">
                  <strong>Will you join those who make this possible?</strong>
                </p>
                <div class="donate-buttons-mobile">
                  <button class="btn-mobile">£5</button>
                  <button class="btn-mobile selected">£10</button>
                  <button class="btn-mobile">£15</button>
                  <button class="btn-mobile">£25</button>
                </div>
                <button class="cta-mobile">Yes, I'll Join →</button>
              </div>
            </div>
          </div>

          <div class="var-research">
            <strong>Research:</strong> Wikipedia's "fewer than 1%" messaging
            paradoxically works despite violating social proof theory - their
            donation rates DROP when they remove it (Wikipedia Fundraising
            2018-19 Report). However, this is context-dependent and not fully
            understood. Traditional social proof theory says show what people DO
            (not don't do), so this variation is HIGH RISK. Reframed here to
            emphasize elite group membership rather than negative framing.<sup
              ><a href="#ref9">9</a></sup
            >
          </div>
        </div>

        <!-- VARIATION 4: Urgency + Progress Bar -->
        <div class="mobile-variation">
          <div class="var-label">
            <span class="var-num">VARIATION #4</span>
            <h3>Goal Proximity Effect (REQUIRES REAL-TIME DATA)</h3>
            <p class="expected">Expected: £18-22 avg • 22-26% conversion</p>
            <p class="research-note">
              ✅ STRONG RESEARCH SUPPORT. CRITICAL: Progress bar MUST be
              authentic and update in real-time. False urgency destroys
              long-term trust. Best when genuinely near goal (85-95% funded).
            </p>
          </div>

          <div class="mobile-frame">
            <div class="mobile-screen">
              <div class="mobile-content">
                <h3 class="urgent">We're Almost There!</h3>
                <div class="progress-visual">
                  <div class="progress-bar-mobile">
                    <div class="progress-fill-mobile" style="width: 93%">
                      93%
                    </div>
                  </div>
                  <div class="progress-text">
                    £10,280 / £11,053 • Just <strong>£773 to go</strong>
                  </div>
                </div>
                <p>Your £15 gets us 2% closer to fully funded this month.</p>
                <div class="donate-buttons-mobile">
                  <button class="btn-mobile">£10</button>
                  <button class="btn-mobile selected">£15</button>
                  <button class="btn-mobile">£25</button>
                  <button class="btn-mobile">£50</button>
                </div>
                <button class="cta-mobile">Help Us Finish →</button>
                <p class="micro">⏰ 5 days left this month</p>
              </div>
            </div>
          </div>

          <div class="var-research">
            <strong>Research:</strong> Goal proximity effect - donations that
            cause beneficiaries to reach their funding goal are ~200% larger
            than early-stage donations. Critically, this effect is specific to
            donors making the "last donation" that completes the goal, not
            gradual (Charitable Giving Consortium: GlobalGiving, DonorsChoose,
            Kiva, + Harvard Business School). IMPORTANT: "Ongoing false sense of
            urgency" causes donor fatigue and disengagement (Neon One 2024).<sup
              ><a href="#ref8">8,15</a></sup
            >
          </div>
        </div>

        <!-- VARIATION 5: Solution-Focused (Yale 2024) -->
        <div class="mobile-variation">
          <div class="var-label">
            <span class="var-num">VARIATION #5</span>
            <h3>Solution-Focused Framing (Yale 2024) - UK ENVIRONMENTAL</h3>
            <p class="expected">Expected: £16-20 avg • 19-23% conversion</p>
            <p class="research-note">
              ✅ STRONG RESEARCH - addresses "solutions not seen" fatigue that
              reduces environmental giving in UK.
            </p>
          </div>

          <div class="mobile-frame">
            <div class="mobile-screen">
              <div class="mobile-content">
                <h3 class="solution">You Just Used the Solution</h3>
                <div class="problem-solution-mobile">
                  <div class="prob">❌ 13M tonnes to UK landfill yearly</div>
                  <div class="sol">✅ 47K tonnes diverted by Freegle</div>
                </div>
                <p>
                  <strong>Freegle is a proven solution.</strong> Your donation
                  powers this for 2.6M people.
                </p>
                <div class="impact-calc-mobile">
                  <div>💰 £10 = 24 hours uptime</div>
                  <div>💰 £15 = 300 items saved</div>
                </div>
                <div class="donate-buttons-mobile">
                  <button class="btn-mobile">£10</button>
                  <button class="btn-mobile selected">£15</button>
                  <button class="btn-mobile">£25</button>
                  <button class="btn-mobile">£40</button>
                </div>
                <button class="cta-mobile">Power This Solution →</button>
              </div>
            </div>
          </div>

          <div class="var-research">
            <strong>Research:</strong> Yale Center for Customer Insights (2024)
            found framing nonprofits as "source of solutions" significantly
            increases donation intent. Study combined online ethnography,
            interviews, and A/B testing with 2,900+ individuals. Also addresses
            environmental donor fatigue: "When you hear too many heartbreaking
            stories without hearing about solutions, progress, or change, the
            world's problems feel unfixable, and donating feels useless" (Neon
            One 2024). Emphasizing tangible solutions counters this.<sup
              ><a href="#ref10">10,15</a></sup
            >
          </div>
        </div>

        <!-- VARIATION 6: Agentic/Empowerment (+82%) -->
        <div class="mobile-variation">
          <div class="var-label">
            <span class="var-num">VARIATION #6</span>
            <h3>Agentic/Empowerment Framing (+82.3%) - TOP PRIORITY TEST</h3>
            <p class="expected">Expected: £18-24 avg • 21-25% conversion</p>
            <p class="research-note">
              ✅ STRONGEST RESEARCH BACKING (PLOS ONE field experiment,
              N=12,316). CAVEAT: Original study on affluent sample (median
              income £85k+). Test with Freegle's demographic to validate.
            </p>
          </div>

          <div class="mobile-frame">
            <div class="mobile-screen">
              <div class="mobile-content agentic">
                <h3 class="power">You Have the Power to Sustain This</h3>
                <p>
                  <strong>Your choice. Your impact. Your community.</strong>
                </p>
                <div class="power-box">
                  💪 You decide whether Freegle thrives
                </div>
                <div class="impact-your">
                  <div>£10 from YOU = 24 hours uptime</div>
                  <div>£20 from YOU = 48 hours uptime</div>
                </div>
                <div class="donate-buttons-mobile">
                  <button class="btn-mobile">£10</button>
                  <button class="btn-mobile selected">£20</button>
                  <button class="btn-mobile">£30</button>
                  <button class="btn-mobile">£50</button>
                </div>
                <button class="cta-mobile">Exercise Your Power →</button>
              </div>
            </div>
          </div>

          <div class="var-research">
            <strong>Research:</strong> Rigorous field experiment by Whillans &
            Dunn (PLOS ONE, Dec 2018). Messages emphasizing personal agency
            increased donations by $8.34, representing an 82.3% increase vs
            communal messaging ($18.47 vs $10.13). Study: naturalistic field
            experiment during annual fundraising campaign, N=12,316,
            participants unaware they were being studied. IMPORTANT CAVEAT:
            Sample was affluent (business school alumni with avg starting salary
            $100k, median household income $85,160). Effect strongest for
            previously engaged donors who had contributed $6,653+ to prior
            campaigns. Test effectiveness with Freegle's demographic before
            scaling.<sup><a href="#ref11">11</a></sup>
          </div>
        </div>

        <!-- VARIATION 7: Impact Calculator -->
        <div class="mobile-variation">
          <div class="var-label">
            <span class="var-num">VARIATION #7</span>
            <h3>Impact Calculator (75-80% Want Concrete Impact + Trust)</h3>
            <p class="expected">Expected: £18-25 avg • 20-24% conversion</p>
            <p class="research-note">
              ✅ STRONG RESEARCH. Add UK trust signals (volunteer-run, no CEO
              salaries) to counter overhead concerns.
            </p>
          </div>

          <div class="mobile-frame">
            <div class="mobile-screen">
              <div class="mobile-content">
                <h3>Calculate Your Impact</h3>
                <div class="calculator-mobile">
                  <div class="calc-line">
                    <strong>£5</strong> = 12 hours uptime = 100 items saved
                  </div>
                  <div class="calc-line">
                    <strong>£10</strong> = 24 hours uptime = 200 items saved
                  </div>
                  <div class="calc-line">
                    <strong>£20</strong> = 48 hours uptime = 400 items saved
                  </div>
                </div>
                <p>
                  <strong
                    >80% of donors want to know their exact impact.</strong
                  >
                  Here it is.
                </p>
                <p class="micro trust-signal">
                  97% volunteer-run • No CEO salaries • Technology costs only
                </p>
                <div class="donate-buttons-mobile">
                  <button class="btn-mobile">£5</button>
                  <button class="btn-mobile selected">£10</button>
                  <button class="btn-mobile">£20</button>
                  <button class="btn-mobile">£50</button>
                </div>
                <button class="cta-mobile">Make Your Impact →</button>
              </div>
            </div>
          </div>

          <div class="var-research">
            <strong>Research:</strong> 80% of donors feel it's important to know
            real outcomes of their giving (Accenture survey), 75% look for
            concrete achievements before deciding where to give (research
            compiled by amplifi). Stanford GSB (2024) found numerical impact
            data nearly quadrupled donation rates. CCS Fundraising: major factor
            in donation decisions. ADDED: UK trust signals essential - 67% think
            charities spend too much on overhead, but public trusts
            volunteer-run orgs (GOV.UK 2024). 60% would donate 10% more if
            nonprofits better communicated impact.<sup
              ><a href="#ref5,12,14">5,12,14</a></sup
            >
          </div>
        </div>

        <!-- VARIATION 8: Heavy Text + Bold (Wikipedia Mobile) -->
        <div class="mobile-variation">
          <div class="var-label">
            <span class="var-num">VARIATION #8</span>
            <h3>Heavy Text + Bold (NOT RECOMMENDED FOR MOBILE)</h3>
            <p class="expected">Expected: £12-16 avg • 19-23% conversion</p>
            <p class="research-note warning-note">
              ⚠️ NOT RECOMMENDED: Contradicts mobile friction research.
              Wikipedia context unique (encyclopedia readers expect text).
              NextAfter found removing scroll friction increased donations 50%,
              form field reduction 17%→22.6%. Heavy text increases cognitive
              load and friction on mobile. Low priority for testing.
            </p>
          </div>

          <div class="mobile-frame">
            <div class="mobile-screen">
              <div class="mobile-content heavy-text">
                <p>
                  <strong>You just posted or received an item for free.</strong>
                  No fees. No catches. <strong>That's Freegle.</strong>
                </p>
                <p>
                  <strong>2.6 million people</strong> rely on this.
                  <strong>47,000 tonnes</strong> saved from landfill.
                  <strong>£11,053/month</strong> keeps it running.
                </p>
                <p>
                  <strong>97% volunteer-run.</strong> Will you support it?
                  <strong>£10 powers 24 hours.</strong>
                </p>
                <div class="donate-buttons-mobile">
                  <button class="btn-mobile">£5</button>
                  <button class="btn-mobile selected">£10</button>
                  <button class="btn-mobile">£15</button>
                  <button class="btn-mobile">£25</button>
                </div>
                <button class="cta-mobile">Donate Now →</button>
              </div>
            </div>
          </div>

          <div class="var-research">
            <strong>Research:</strong> Wikipedia found heavy text with strategic
            bolding performs in their context (Fundraising Report 2018-19).
            HOWEVER: Contradicts mobile best practices. NextAfter (2024)
            research on mobile friction: removing scroll barriers (+50%
            donations), reducing form fields 11→4 (+17% to 22.6% conversion),
            eliminating navigation bar (+200% donations). Heavy text increases
            reading fatigue and mobile friction. Wikipedia's audience
            (encyclopedia readers) expects text-heavy content, but donation
            pages benefit from simplicity. LOW PRIORITY for testing.<sup
              ><a href="#ref9,16">9,16</a></sup
            >
          </div>
        </div>

        <!-- VARIATION 9: Personal Appeal from Volunteer -->
        <div class="mobile-variation">
          <div class="var-label">
            <span class="var-num">VARIATION #9</span>
            <h3>Personal Appeal from Named Volunteer</h3>
            <p class="expected">Expected: £18-23 avg • 19-23% conversion</p>
          </div>

          <div class="mobile-frame">
            <div class="mobile-screen">
              <div class="mobile-content personal">
                <div class="volunteer-header-mobile">
                  <div class="volunteer-name">
                    <strong>From Sarah</strong>
                  </div>
                  <div class="volunteer-role">Freegle Volunteer, 10 years</div>
                </div>
                <p>
                  "I've seen Freegle transform lives - single parents, students,
                  elderly people who desperately needed help.
                </p>
                <p>
                  <strong>You just experienced it.</strong> Will you help us
                  continue?"
                </p>
                <div class="donate-buttons-mobile">
                  <button class="btn-mobile">£10</button>
                  <button class="btn-mobile selected">£20</button>
                  <button class="btn-mobile">£30</button>
                  <button class="btn-mobile">£50</button>
                </div>
                <button class="cta-mobile">Support Sarah's Work →</button>
              </div>
            </div>
          </div>

          <div class="var-research">
            <strong>Research:</strong> Personal appeals from named individuals
            dramatically outperform generic asks<sup><a href="#ref9">9</a></sup
            >.
          </div>
        </div>

        <!-- VARIATION 10: One-Click Minimal Friction -->
        <div class="mobile-variation">
          <div class="var-label">
            <span class="var-num">VARIATION #10</span>
            <h3>One-Click Minimal Friction - HIGH CONVERSION POTENTIAL</h3>
            <p class="expected">
              Expected: £8-10 avg • 25-30% conversion (highest conversion)
            </p>
            <p class="research-note">
              ✅ STRONG RESEARCH - Extensive NextAfter studies validate friction
              reduction. Lower average gift but higher volume = potentially
              highest total revenue. CRITICAL: Phone number must be optional
              (37% abandon if required).
            </p>
          </div>

          <div class="mobile-frame">
            <div class="mobile-screen">
              <div class="mobile-content minimal">
                <h3>You Just Helped Someone</h3>
                <p>Keep Freegle free for 2.6M people.</p>
                <div class="one-click-box">
                  <button class="one-click-donate">
                    <div class="amount-large">Donate £5</div>
                    <div class="one-click-detail">
                      One click • Takes 30 sec • Get badge
                    </div>
                  </button>
                </div>
                <details class="costs-accordion">
                  <summary>Where does £5 go?</summary>
                  <p>
                    Powers 12 hours of uptime. Costs £11K/month for 2.6M
                    members. 97% volunteer-run, funds technology only.
                  </p>
                </details>
                <a href="#" class="other-amount-link"
                  >Choose different amount</a
                >
              </div>
            </div>
          </div>

          <div class="var-research">
            <strong>Research:</strong> Extensive friction reduction research
            from NextAfter (2024): reducing form fields 11→4 increased
            conversion 17% to 22.6%, two-step mobile forms +22% conversion,
            removing scroll friction +50% donations, eliminating navigation bar
            +200% donations. CRITICAL: 37% abandon if phone number field
            required (make optional). 8% drop-off for each new page/tab.
            One-click donation maximizes conversion but at lower average gift -
            test total revenue vs other variations. Addresses UK affordability
            barrier (44% can't afford) by lowering entry point and timing after
            user saved money.<sup><a href="#ref7,16,17">7,16,17</a></sup>
          </div>
        </div>

        <!-- RESEARCH REFERENCES -->
        <div class="references">
          <h2>📚 Research References & Citations</h2>
          <ol>
            <li id="ref1">
              <strong>Sandoval et al. (2024)</strong> - "Impact of emotional
              appeal on non-profit advertising: A neurophysiological analysis,"
              Journal of Consumer Behaviour, Wiley. Emotional appeals trigger
              empathy and increase willingness to donate.
            </li>
            <li id="ref5">
              <strong>Stanford Graduate School of Business (2024)</strong> -
              Numerical data about impact nearly quadrupled donation rates
              compared to appeals without concrete metrics.
            </li>
            <li id="ref7">
              <strong>NextAfter (2024)</strong> - Multiple friction reduction
              experiments. Reducing form fields from 11 to 4 increased
              conversion from 17% to 22.6%. Source:
              nextafter.com/experiments/how-reducing-donation-form-friction-affects-conversion
            </li>
            <li id="ref8">
              <strong
                >Charitable Giving Consortium (GlobalGiving, DonorsChoose, Kiva,
                + Harvard Business School)</strong
              >
              - Goal proximity effect: Donations that cause beneficiaries to
              reach funding goals are approximately 200% larger than early-stage
              donations. Source:
              globalgiving.org/learn/psychology-of-giving-research
            </li>
            <li id="ref9">
              <strong>Wikipedia Fundraising 2018-19 Report</strong> - Meta-Wiki.
              Extensive A/B testing found removing "fewer than 1%" messaging
              paradoxically DECREASED donations. "Please don't scroll away" and
              heavy text with strategic bolding tested. Source:
              meta.wikimedia.org/wiki/Fundraising/2018-19_Report
            </li>
            <li id="ref10">
              <strong>Yale Center for Customer Insights (2024)</strong> -
              "Understanding Donor Behavior: Insights for Increasing Engagement
              and Charitable Giving." Framing organizations as "solution
              sources" significantly increases donation intent. Study combined
              ethnography, interviews, and A/B testing (N=2,900+). Source:
              som.yale.edu/story/2024/understanding-donor-behavior
            </li>
            <li id="ref11">
              <strong>Whillans, A.V. & Dunn, E.W. (2018)</strong> - "Agentic
              appeals increase charitable giving in an affluent sample of
              donors," PLOS ONE, December 2018. Field experiment (N=12,316)
              showing 82.3% increase ($8.34 difference) for agentic vs communal
              messaging. CAVEAT: Affluent sample (median income $85k+). Source:
              journals.plos.org/plosone/article?id=10.1371/journal.pone.0208392
            </li>
            <li id="ref12">
              <strong>Multiple sources on impact data demand:</strong> Accenture
              survey (80% want to know real outcomes), amplifi research (75%
              look for concrete achievements), CCS Fundraising (major factor in
              decisions), 60% would donate 10% more with better impact
              communication.
            </li>
            <li id="ref13">
              <strong>Small, D.A., Loewenstein, G. & Slovic, P. (2007)</strong>
              - "Sympathy and callousness: The impact of deliberative thought on
              donations to identifiable and statistical victims," Judgment and
              Decision Making. Adding statistical information to emotional
              appeals REDUCES donations (identifiable victim effect).
            </li>
            <li id="ref14">
              <strong>UK Government - Charity Commission (2024)</strong> -
              "Public Trust in Charities 2024." 67% think charities spend too
              much on salaries/admin (up from 58% in 2014). Public trusts small,
              volunteer-run charities more than large professionalized ones.
              Source: gov.uk/government/publications/research-into-public-trust
            </li>
            <li id="ref15">
              <strong>Multiple UK donor barrier sources:</strong> CAF (Charities
              Aid Foundation) UK Giving Report 2025: 44% can't afford to donate
              (primary barrier), 19% don't trust charities, 4 million fewer
              donors in 2024 vs 2019. Neon One (2024): Donor fatigue from
              ongoing false urgency and too-frequent appeals.
            </li>
            <li id="ref16">
              <strong>NextAfter Mobile Optimization (2024)</strong> - Two-step
              forms (+22% mobile conversion), scroll friction removal (+50%),
              navigation bar elimination (+200%). Source:
              nextafter.com/blog/donation-pages
            </li>
            <li id="ref17">
              <strong>Form field friction research</strong> - 37% abandon forms
              if phone number required (NextAfter), 8% drop-off per new page/tab
              (re:charity), 8-10% drop-off at personal information step.
            </li>
          </ol>
        </div>

        <!-- TESTING STRATEGY -->
        <div class="testing-strategy">
          <h2>🎯 Research-Based Testing Strategy (Updated)</h2>

          <h3>
            Phase 1: Test Strongest Research-Backed Variations (Months 1-3)
          </h3>
          <p>Split traffic equally between these three:</p>
          <ul>
            <li>
              <strong>#6 Agentic Appeals</strong> - 82.3% increase in rigorous
              field study (caveat: affluent sample, validate with Freegle
              demographic)
            </li>
            <li>
              <strong>#5 Solution Framing</strong> - Yale 2024 research +
              addresses UK environmental donor fatigue
            </li>
            <li>
              <strong>#10 Minimal Friction</strong> - Extensive NextAfter
              research, highest conversion potential, addresses UK affordability
              barrier
            </li>
          </ul>
          <p>
            <strong>Success Metrics:</strong> Conversion rate (target 15-20%),
            average donation (£10-18), total revenue, mobile vs desktop,
            completion time (<2 min), first-time vs repeat donors
          </p>

          <h3>Phase 2: Test Winner + Impact/Goal (Months 4-6)</h3>
          <ul>
            <li>Take Phase 1 winner as baseline</li>
            <li>
              Test against <strong>#7 Impact Calculator</strong> (with UK trust
              signals added)
            </li>
            <li>
              Test against <strong>#4 Goal Proximity</strong> (ONLY if progress
              bar can be real-time and authentic)
            </li>
            <li>Test donation amount optimization (is £10 default optimal?)</li>
          </ul>

          <h3>Phase 3: Adapted Wikipedia Approaches (Months 7-9)</h3>
          <ul>
            <li>
              <strong>#2 "Don't Scroll"</strong> (UK-adapted with volunteer-run
              emphasis)
            </li>
            <li>
              <strong>#3 Social Proof</strong> (elite group framing, HIGH RISK -
              monitor closely for negative effects)
            </li>
            <li>
              <strong>Skip #8</strong> (heavy text contradicts mobile best
              practices)
            </li>
          </ul>

          <h3>Phase 4: Advanced Testing (Months 10-12)</h3>
          <ul>
            <li>
              <strong>Matching gift campaign</strong> (research shows 71%
              response increase, 51% higher average gift)
            </li>
            <li>
              <strong>Gift Aid emphasis</strong> (UK-specific, 25% value
              increase at no donor cost)
            </li>
            <li>
              <strong>Monthly recurring option</strong> (test vs one-time for
              lifetime value)
            </li>
            <li>
              <strong>Local/postcode impact</strong> ("Your area diverted X
              tonnes")
            </li>
          </ul>

          <h3>Critical Technical Requirements (ALL Phases)</h3>
          <ul>
            <li>
              ❌ <strong>Phone number: Optional or removed</strong> (37% abandon
              if required)
            </li>
            <li>
              ✅ <strong>Max 4 form fields</strong> (11→4 increased conversion
              17% to 22.6%)
            </li>
            <li>
              ✅ <strong>Single page or 2-step</strong> (not 3+; 8% drop-off per
              new page)
            </li>
            <li>
              ✅ <strong>No navigation bar</strong> on donation page (200%
              increase when removed)
            </li>
            <li>
              ✅ <strong>Pre-populate</strong> email/name if user logged in
            </li>
            <li>
              ✅ <strong>Large touch targets</strong> on mobile (min 44x44px)
            </li>
            <li>
              ✅ <strong>Fast load times</strong> (each second delay reduces
              conversion ~7%)
            </li>
          </ul>

          <h3>UK-Specific Monitoring</h3>
          <ul>
            <li>
              <strong>Donor retention rate</strong> (target >45%, current UK
              average)
            </li>
            <li>
              <strong>Youth engagement</strong> (16-24s only 36% donate
              nationally)
            </li>
            <li>
              <strong>Fatigue signals</strong> (declining open rates,
              unsubscribes)
            </li>
            <li>
              <strong>Appeal frequency</strong> (max 2-3 per year per user to
              avoid 19% first-time donor retention)
            </li>
            <li>
              <strong>Trust perception</strong> (survey sample: "Do you trust
              Freegle uses donations wisely?")
            </li>
          </ul>

          <h3>What NOT to Test (Research-Contradicted)</h3>
          <ul>
            <li>
              ❌ <strong>#8 Heavy Text</strong> - Contradicts mobile friction
              research, increases cognitive load
            </li>
            <li>
              ❌ <strong>Emotional story + statistics</strong> - Research shows
              mixing REDUCES donations
            </li>
            <li>
              ❌ <strong>Required phone numbers</strong> - 37% abandonment rate
            </li>
            <li>
              ❌ <strong>Multi-page redirects</strong> - 8% drop-off per new
              page
            </li>
            <li>
              ❌ <strong>False urgency</strong> - Destroys trust, causes donor
              fatigue
            </li>
            <li>
              ❌ <strong>"100% to cause" claims</strong> - Creates cognitive
              dissonance about real overhead needs
            </li>
          </ul>
        </div>
      </div>
    </div>
  </client-only>
</template>

<script setup>
definePageMeta({
  title: 'Mobile Donation Appeals - A/B Testing',
})
</script>

<style scoped lang="scss">
.donation-appeals {
  background: #f5f5f5;
  padding: 20px 10px;

  @media (min-width: 768px) {
    padding: 30px;
  }
}

h1 {
  text-align: center;
  color: #2c5f2d;
  font-size: 24px;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    font-size: 32px;
  }
}

.intro {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  border-left: 4px solid #2c5f2d;

  h2 {
    color: #2c5f2d;
    margin-top: 0;
  }

  .warning {
    background: #fff9e6;
    border-left: 4px solid #ffa500;
    padding: 12px;
    margin-top: 15px;
    font-size: 14px;
    line-height: 1.6;
  }
}

// Mobile Variation Cards
.mobile-variation {
  background: white;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.var-label {
  margin-bottom: 20px;

  .var-num {
    display: inline-block;
    background: #2c5f2d;
    color: white;
    padding: 5px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  h3 {
    color: #2c5f2d;
    margin: 10px 0 5px 0;
    font-size: 20px;
  }

  .expected {
    color: #666;
    font-size: 14px;
    margin: 0;
  }

  .research-note {
    background: #e8f5e9;
    border-left: 4px solid #4caf50;
    padding: 10px 12px;
    margin-top: 10px;
    font-size: 13px;
    line-height: 1.6;
    border-radius: 4px;

    &.warning-note {
      background: #ffebee;
      border-left-color: #f44336;
    }
  }
}

// Mobile Frame
.mobile-frame {
  display: flex;
  justify-content: center;
  margin: 25px 0;
}

.mobile-screen {
  width: 375px;
  max-width: 100%;
  border: 12px solid #333;
  border-radius: 30px;
  overflow: hidden;
  background: white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.mobile-hero img {
  width: 100%;
  display: block;
}

.mobile-content {
  padding: 20px;

  h3 {
    color: #2c5f2d;
    margin-top: 0;
    font-size: 20px;
    line-height: 1.3;
  }

  p {
    line-height: 1.6;
    margin: 12px 0;
  }

  &.wikipedia-style {
    background: #fffbf0;
  }

  &.agentic {
    background: linear-gradient(135deg, #f0f8ff, #fff);
  }

  &.heavy-text p {
    font-size: 15px;
    line-height: 1.7;
  }

  &.personal {
    background: #fafafa;
  }

  &.minimal {
    text-align: center;
  }
}

.mobile-stat {
  background: #f0f8ff;
  border: 2px solid #4a90e2;
  padding: 12px;
  text-align: center;
  border-radius: 6px;
  margin: 15px 0;
  font-size: 15px;
  color: #2c5f2d;
}

.time-box {
  background: #fff9e6;
  border-left: 4px solid #ffa500;
  padding: 12px;
  margin: 15px 0;
  font-size: 14px;
}

.stat-headline {
  font-size: 19px !important;
  color: #c70039 !important;
}

.math-simple {
  background: #e8f5e9;
  padding: 12px;
  border-radius: 6px;
  margin: 15px 0;
  font-size: 14px;
  text-align: center;
}

.cta-text {
  text-align: center;
  margin: 15px 0;
}

.urgent {
  color: #c70039 !important;
}

.progress-visual {
  margin: 15px 0;
}

.progress-bar-mobile {
  background: #e0e0e0;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill-mobile {
  background: linear-gradient(90deg, #2c5f2d, #4a8f4b);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 13px;
}

.progress-text {
  font-size: 14px;
  text-align: center;
  color: #2c5f2d;
}

.problem-solution-mobile {
  margin: 15px 0;

  .prob,
  .sol {
    padding: 10px;
    margin: 5px 0;
    border-radius: 6px;
    font-size: 14px;
  }

  .prob {
    background: #ffebee;
  }

  .sol {
    background: #e8f5e9;
  }
}

.impact-calc-mobile {
  background: #f0f8ff;
  padding: 12px;
  border-radius: 6px;
  margin: 15px 0;
  font-size: 14px;

  div {
    padding: 6px 0;
  }
}

.power-box {
  background: #fff9e6;
  border: 3px solid #ffa500;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  text-align: center;
  font-weight: bold;
  font-size: 15px;
}

.impact-your {
  margin: 15px 0;

  div {
    padding: 8px;
    background: #e8f5e9;
    margin: 5px 0;
    border-radius: 4px;
    font-size: 14px;
  }
}

.calculator-mobile {
  background: #f0f8ff;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;

  .calc-line {
    padding: 8px 0;
    border-bottom: 1px solid #ddd;
    font-size: 14px;

    &:last-child {
      border-bottom: none;
    }
  }
}

.volunteer-header-mobile {
  background: #f0f8ff;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 15px;

  .volunteer-name {
    font-size: 18px;
    color: #2c5f2d;
  }

  .volunteer-role {
    font-size: 13px;
    color: #666;
  }
}

.one-click-box {
  margin: 20px 0;
}

.one-click-donate {
  width: 100%;
  background: #2c5f2d;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
  }

  .amount-large {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .one-click-detail {
    font-size: 13px;
    opacity: 0.9;
  }
}

.costs-accordion {
  margin: 15px 0;
  font-size: 14px;

  summary {
    cursor: pointer;
    color: #2c5f2d;
    font-weight: 600;
  }

  p {
    margin-top: 10px;
    font-size: 13px;
    line-height: 1.6;
  }
}

.other-amount-link {
  display: block;
  text-align: center;
  color: #2c5f2d;
  margin-top: 15px;
  font-size: 14px;
}

// Donation Buttons
.donate-buttons-mobile {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 15px 0;
}

.btn-mobile {
  padding: 12px 8px;
  border: 2px solid #2c5f2d;
  background: white;
  color: #2c5f2d;
  font-size: 16px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;

  &.selected {
    background: #2c5f2d;
    color: white;
  }

  &:active {
    transform: scale(0.95);
  }
}

.cta-mobile {
  width: 100%;
  padding: 16px;
  background: #2c5f2d;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  min-height: 56px;
  margin: 10px 0;
  transition: all 0.3s;

  &:active {
    background: #1f4521;
    transform: scale(0.98);
  }
}

.micro {
  text-align: center;
  font-size: 13px;
  color: #666;
  margin: 8px 0;

  &.trust-signal {
    background: #e8f5e9;
    padding: 8px;
    border-radius: 4px;
    color: #2c5f2d;
    font-weight: 500;
  }
}

.var-research {
  background: #f0f8ff;
  padding: 12px 15px;
  border-left: 4px solid #4a90e2;
  font-size: 14px;
  line-height: 1.6;

  sup a {
    color: #2c5f2d;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

// References
.references {
  background: white;
  padding: 30px;
  border-radius: 8px;
  margin-top: 40px;

  h2 {
    color: #2c5f2d;
    margin-top: 0;
  }

  ol {
    li {
      margin-bottom: 15px;
      line-height: 1.6;
    }
  }
}

// Testing Strategy
.testing-strategy {
  background: #2c5f2d;
  color: white;
  padding: 30px;
  border-radius: 8px;
  margin-top: 30px;

  h2 {
    color: white;
    margin-top: 0;
  }

  h3 {
    color: #a5d6a7;
    margin-top: 25px;
    margin-bottom: 15px;
    font-size: 18px;
  }

  ol,
  ul {
    li {
      margin-bottom: 12px;
      line-height: 1.6;
    }
  }

  p {
    line-height: 1.7;
    margin-bottom: 15px;
  }

  strong {
    color: #a5d6a7;
  }
}
</style>
