import type { Evidence, Requirement, RequirementStatus } from '../types';
import { anyExpectationEvidence } from '../extraction/patterns';

export interface RequirementMatch {
  requirement: Requirement;
  matchedEvidence: Evidence[];
  status: RequirementStatus;
  metExpectations: string[];
  unmetTechnicalExpectations: string[];
  unmetOrganizationalExpectations: string[];
  coverageRatio: number;
}

/**
 * The heart of the translation engine: for a Requirement, gather every
 * piece of Evidence tagged with one of its Controls, then check literal
 * coverage of each technical/organizational expectation string. This is a
 * deterministic evidence-presence check, not a legal-sufficiency
 * judgement — see README Limitations.
 */
export function matchRequirement(requirement: Requirement, corpusEvidence: Evidence[]): RequirementMatch {
  const matchedEvidence = corpusEvidence.filter((e) =>
    e.controlIds.some((c) => requirement.controlIds.includes(c))
  );
  const texts = matchedEvidence.map((e) => e.text);

  const allExpectations = [...requirement.technicalExpectations, ...requirement.organizationalExpectations];
  const metExpectations = allExpectations.filter((exp) => anyExpectationEvidence(exp, texts));
  const unmetTechnicalExpectations = requirement.technicalExpectations.filter(
    (exp) => !anyExpectationEvidence(exp, texts)
  );
  const unmetOrganizationalExpectations = requirement.organizationalExpectations.filter(
    (exp) => !anyExpectationEvidence(exp, texts)
  );

  let coverageRatio: number;
  if (allExpectations.length === 0) {
    coverageRatio = matchedEvidence.length > 0 ? 1 : 0;
  } else {
    coverageRatio = metExpectations.length / allExpectations.length;
  }

  let status: RequirementStatus;
  if (matchedEvidence.length === 0) {
    status = 'MISSING';
  } else if (coverageRatio >= 0.999) {
    status = 'SUPPORTED';
  } else {
    status = 'PARTIAL';
  }

  return {
    requirement,
    matchedEvidence,
    status,
    metExpectations,
    unmetTechnicalExpectations,
    unmetOrganizationalExpectations,
    coverageRatio,
  };
}

export function matchAllRequirements(requirements: Requirement[], corpusEvidence: Evidence[]): RequirementMatch[] {
  return requirements.map((r) => matchRequirement(r, corpusEvidence));
}
