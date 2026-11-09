import {
  CLAIMS_V1,
  CLAIMS_V2,
  ROLE_BY_ID,
  type Brief,
  type CitationState,
  type Disposition,
  type DrillClaim,
  type Rank,
  type RoleId,
} from "./data";

export type Verdict = {
  status: "ISSUED" | "BLOCKED";
  line: string;
  missing: string[];
};

function filled(value: string, minimum: number): boolean {
  return value.trim().length >= minimum;
}

export function judgeBrief(role: RoleId, brief: Brief): Verdict {
  const missing: string[] = [];
  if (!filled(brief.researchQuestion, 12)) missing.push("Research question, bounded");
  if (!filled(brief.why, 12)) missing.push("Why this assignment exists");
  if (!filled(brief.corpus, 3)) missing.push("Corpus or domain");
  if (!filled(brief.inclusions, 3)) missing.push("Inclusions");
  if (!filled(brief.coverage, 8)) missing.push("Required coverage");
  if (!filled(brief.nextGate, 4)) missing.push("Expected next gate");

  if (role === "OLTA" && !filled(brief.editionBounds, 3)) {
    missing.push("Edition / textual basis");
  }
  if (role === "AFR" && !filled(brief.parentHypothesis, 3)) {
    missing.push("Hypothesis ID");
  }
  if (role === "IVR" && !filled(brief.parentHypothesis, 3)) {
    missing.push("Hypothesis or claim ID");
  }
  if (role === "EIA" && !filled(brief.packetRef, 3)) {
    missing.push("Packet under audit");
  }
  if (role === "OMER" && !filled(brief.parentDiscovery, 3)) {
    missing.push("Recorded discovery ID");
  }
  if (
    role === "TSRE" &&
    brief.execution !== "NONE" &&
    brief.execution !== "READ_ONLY" &&
    !filled(brief.accessRef, 3)
  ) {
    missing.push("Access authorization for execution beyond read-only");
  }
  if ((brief.risk === "HIGH" || brief.risk === "CRITICAL") && !brief.humanApproval) {
    missing.push("Human approval at this risk tier");
  }
  if (
    (brief.classification === "RESTRICTED" || brief.classification === "LEGALLY_CONTROLLED") &&
    !filled(brief.accessRef, 3)
  ) {
    missing.push("Access authorization reference");
  }

  const only = (label: string) => missing.length === 1 && missing[0] === label;
  let line = "ISSUED";
  if (role === "OMER" && !brief.commercialGate) {
    line = "BLOCKED — COMMERCIAL GATE NOT MET";
  } else if (only("Edition / textual basis")) {
    line = "BLOCKED — TEXTUAL BASIS / COMPETENCE INSUFFICIENT";
  } else if (only("Hypothesis ID")) {
    line = "BLOCKED — HYPOTHESIS / EVIDENCE TARGET UNCLEAR";
  } else if (only("Hypothesis or claim ID")) {
    line = "BLOCKED — AUTHORIZATION / SAFETY / TESTABILITY ISSUE";
  } else if (only("Access authorization for execution beyond read-only")) {
    line = "BLOCKED — ACCESS / AUTHORIZATION / CHECKOUT REQUIREMENT NOT MET";
  } else if (missing.length > 0) {
    line = "BLOCKED — ASSIGNMENT CLARIFICATION REQUIRED";
  }

  return {
    status: line === "ISSUED" ? "ISSUED" : "BLOCKED",
    line,
    missing,
  };
}

export function assistantEnding(role: RoleId, status: "ISSUED" | "BLOCKED"): string {
  const endings = ROLE_BY_ID[role].endings;
  if (status === "BLOCKED") {
    return endings.find((line) => line.startsWith("BLOCKED")) ?? endings[endings.length - 1];
  }
  return endings[0];
}

export type Grade = { pass: boolean; notes: string[] };

export function gradePacket(
  stage: "v001" | "v002",
  marks: Record<string, CitationState | "">,
  disposition: Disposition | "",
): Grade {
  const claims: DrillClaim[] = stage === "v001" ? CLAIMS_V1 : CLAIMS_V2;
  const notes: string[] = [];
  let marksOk = true;
  for (const claim of claims) {
    const mark = marks[claim.id];
    if (!mark) {
      marksOk = false;
      notes.push(`${claim.id} still needs a citation state.`);
      continue;
    }
    if (mark !== claim.key) {
      marksOk = false;
      notes.push(
        `${claim.id}: “${mark.replaceAll("_", " ")}” does not match the extract. Judge the claim as written, not the CSS assertion.`,
      );
    }
  }
  if (!disposition) {
    notes.push("Choose a packet-integrity disposition. It is not a truth verdict.");
    return { pass: false, notes };
  }
  if (!marksOk) return { pass: false, notes };

  if (stage === "v001") {
    if (disposition !== "RETURN FOR CORRECTION") {
      return {
        pass: false,
        notes: [
          "The citation states are right, including the mismatch on CLM-SYN-03.",
          "A material mismatch cannot pass. Integrity disposition: RETURN FOR CORRECTION.",
          "Keep v001. Do not overwrite it with a cleaner story.",
        ],
      };
    }
    return {
      pass: true,
      notes: [
        "RETURN FOR CORRECTION.",
        "CLM-SYN-03 said three witnesses were inspected. The extract records two leaves, and Copy-C as NOT INSPECTED.",
        "File the correction as v002. v001 stays in the record.",
      ],
    };
  }

  if (disposition === "RETURN FOR CORRECTION" || disposition === "BLOCKED") {
    return {
      pass: false,
      notes: [
        "v002’s claims match the extracts, and the missing witness is disclosed.",
        "RETURN or BLOCKED would reject a reconstructable packet. Use PASS WITH RESERVATIONS, or PASS FOR PI SYNTHESIS if you accept the disclosed limit.",
      ],
    };
  }

  const tighter =
    disposition === "PASS FOR PI SYNTHESIS"
      ? "Recorded as PASS FOR PI SYNTHESIS. The tighter integrity call is PASS WITH RESERVATIONS: Copy-C was never inspected. Acceptance is still not truth."
      : "PASS WITH RESERVATIONS. Partial coverage is disclosed. Fable may use the packet for synthesis. That is not a finding that the claims are true in the world.";

  return { pass: true, notes: [tighter] };
}

export function gradeChallenge(rank: Rank | ""): Grade {
  if (!rank) {
    return { pass: false, notes: ["Rank the objection before you close the challenge."] };
  }
  if (rank === "MATERIAL") {
    return {
      pass: true,
      notes: [
        "MATERIAL. The catalog card is enough to narrow the hypothesis: the wrapper is not the folio’s edition.",
        "It is not, by itself, a CRITICAL failure of the whole case. Fable still has to adjudicate. This drill stops before validation and disposition.",
      ],
    };
  }
  if (rank === "CRITICAL") {
    return {
      pass: false,
      notes: [
        "The objection is real, but CRITICAL is for a defect that makes the claim unfit to proceed at all.",
        "Here the card narrows one hypothesis — folder label versus edition. That weight is MATERIAL.",
      ],
    };
  }
  return {
    pass: false,
    notes: [
      "LIMITED or SPECULATIVE underweights a sourced alternative. The catalog card is in the packet, and it distinguishes the wrapper from the leaves.",
      "Rank it MATERIAL.",
    ],
  };
}

export function briefYaml(id: string, role: RoleId, brief: Brief, line: string): string {
  return [
    `assignment_id: "${id}"`,
    `issued_by: "Fable / Principal Investigator"`,
    `assigned_role: "${role}"`,
    `assignment_status: "${line === "ISSUED" ? "ISSUED" : "BLOCKED"}"`,
    "purpose:",
    `  research_question_or_evidence_need: "${brief.researchQuestion}"`,
    `  why_this_assignment_exists: "${brief.why}"`,
    `  expected_decision_or_next_gate: "${brief.nextGate}"`,
    "scope:",
    `  corpus_or_domain: "${brief.corpus}"`,
    `  inclusions: "${brief.inclusions}"`,
    `  exclusions: "${brief.exclusions}"`,
    `  language_or_edition_bounds: "${brief.editionBounds}"`,
    `  required_coverage: "${brief.coverage}"`,
    "method:",
    `  independence_requirement: "${brief.independence}"`,
    "risk_and_access:",
    `  risk_tier: "${brief.risk}"`,
    `  data_classification: "${brief.classification}"`,
    `  execution_permission: "${brief.execution}"`,
    `  access_authorization_reference: "${brief.accessRef}"`,
    `  human_approval_required: ${brief.humanApproval}`,
    "context:",
    `  parent_discovery_id: "${brief.parentDiscovery}"`,
    `  parent_hypothesis_id: "${brief.parentHypothesis}"`,
    `  packet_ref: "${brief.packetRef}"`,
    `  commercial_gate_met: ${brief.commercialGate}`,
    "completion:",
    `  status_line: "${line}"`,
  ].join("\n");
}
