<template>
  <div ref="container" class="graphviz-container" v-html="svgOutput" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { instance } from '@viz-js/viz'

const container = ref(null)
const svgOutput = ref('')

const dot = `
digraph HelperFSM {
  // Global settings
  rankdir=TB;
  bgcolor="white";
  pad=0.5;
  nodesep=0.8;
  ranksep=1.2;

  // Node defaults
  node [
    shape=box,
    style="rounded,filled",
    fontname="Helvetica",
    fontsize=14,
    margin="0.35,0.25",
    penwidth=2
  ];

  // Edge defaults
  edge [
    fontname="Helvetica",
    fontsize=12,
    labeldistance=2,
    penwidth=1.5,
    color="#666666"
  ];

  // === STATES ===

  // Active states (blue)
  NEW [
    label="New Reply\\nReply received, not yet acknowledged",
    fillcolor="#e8f0fe",
    color="#0d6efd"
  ];

  GATHERING [
    label="Gathering Info\\nWaiting for dates, transport,\\ncriteria, quantity",
    fillcolor="#e8f0fe",
    color="#0d6efd"
  ];

  // Ready states (green)
  QUALIFIED [
    label="Qualified\\nAll info gathered, ready for\\nhuman allocation decision",
    fillcolor="#d1e7dd",
    color="#198754"
  ];

  ALLOCATED [
    label="Allocated\\nHuman approved,\\nreplier not yet told",
    fillcolor="#d1e7dd",
    color="#198754"
  ];

  // Success states (dark green)
  CONFIRMED [
    label="Confirmed\\nReplier told and\\nconfirmed collection",
    fillcolor="#a3cfbb",
    color="#198754"
  ];

  COLLECTED [
    label="Collected\\nItem collected,\\noutcome recorded",
    fillcolor="#a3cfbb",
    color="#198754"
  ];

  // Waiting state (yellow)
  ESCALATED [
    label="Escalated\\nNeeds human input\\n(photos, subjective question)",
    fillcolor="#fff3cd",
    color="#ffc107"
  ];

  // Parked states (grey)
  PARKED_REPLIED [
    label="Parked (told)\\nCan't meet requirements,\\ntold them, kept as fallback",
    fillcolor="#e9ecef",
    color="#6c757d"
  ];

  PARKED_QUIET [
    label="Parked (quiet)\\nNot prioritised, no reply\\nsent, still in pool",
    fillcolor="#e9ecef",
    color="#6c757d"
  ];

  // End states (red)
  TIMED_OUT [
    label="Timed Out\\nNo reply after nudge (48h).\\nExcluded unless all others fail",
    fillcolor="#f8d7da",
    color="#dc3545"
  ];

  REJECTED [
    label="Rejected\\nItems allocated to others,\\npolite rejection sent",
    fillcolor="#f8d7da",
    color="#dc3545"
  ];

  // === TRANSITIONS ===

  // From NEW
  NEW -> GATHERING [label="Send first message"];
  NEW -> QUALIFIED [label="Already complete"];
  NEW -> PARKED_QUIET [label="Vague reply"];

  // From GATHERING
  GATHERING -> QUALIFIED [label="All answered"];
  GATHERING -> ESCALATED [label="Need human"];
  GATHERING -> PARKED_REPLIED [label="Can't collect"];
  GATHERING -> TIMED_OUT [label="48h silence"];

  // From ESCALATED
  ESCALATED -> GATHERING [label="Human answers"];

  // From QUALIFIED
  QUALIFIED -> ALLOCATED [label="Human approves"];
  QUALIFIED -> REJECTED [label="Goes to other"];

  // From ALLOCATED
  ALLOCATED -> CONFIRMED [label="Confirms"];
  ALLOCATED -> TIMED_OUT [label="48h silence"];

  // From CONFIRMED
  CONFIRMED -> COLLECTED [label="Collected"];

  // Recovery paths
  PARKED_REPLIED -> GATHERING [label="Re-engage", style=dashed, color="#999999"];
  PARKED_QUIET -> GATHERING [label="Re-engage", style=dashed, color="#999999"];
  TIMED_OUT -> GATHERING [label="Late reply", style=dashed, color="#999999"];
  TIMED_OUT -> REJECTED [label="Item gone"];
  REJECTED -> GATHERING [label="Item freed", style=dashed, color="#999999"];

  // === LAYOUT HINTS ===
  { rank=same; QUALIFIED; ESCALATED; PARKED_REPLIED; }
  { rank=same; CONFIRMED; TIMED_OUT; }
  { rank=same; COLLECTED; REJECTED; }
}
`

onMounted(async () => {
  const viz = await instance()
  const svg = viz.renderSVGElement(dot)

  // Make it responsive
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '100%')
  svg.style.maxHeight = '80vh'

  svgOutput.value = svg.outerHTML
})
</script>

<style>
.graphviz-container {
  width: 100%;
  overflow: auto;
  background: white;
  border-radius: 8px;
}

.graphviz-container svg {
  display: block;
  margin: 0 auto;
}
</style>
