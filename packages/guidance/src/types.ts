import { FormCode } from '@matdata-setu/shared';

export interface GuidanceItem {
  id: string;
  topic: string;
  jurisdiction: string; // 'IN' or state code e.g. 'DL', 'MH', 'UP'
  effectiveFrom: string;
  effectiveTo?: string;
  version: string;
  sourceUrl: string;
  sourceTitle: string;
  verifiedOn: string | null;
  verifiedBy: string | null;
  requiresVerification: boolean;
  titleEn: string;
  titleHi: string;
  textEn: string;
  textHi: string;
  supersedesId?: string;
}

export interface StateSchedule {
  id: string;
  stateCode: string;
  stateName: string;
  stateNameHi: string;
  phase: string;
  qualifyingDate: string;
  draftPublicationDate: string;
  claimsAndObjectionsStart: string;
  claimsAndObjectionsEnd: string;
  finalRollPublicationDate: string;
  sourceUrl: string;
  verifiedOn: string | null;
  verifiedBy: string | null;
  requiresVerification: boolean;
}

export interface DocumentRequirement {
  id: string;
  category: 'AGE' | 'ADDRESS' | 'IDENTITY' | 'OVERSEAS' | 'DECEASED';
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  acceptableDocumentsEn: string[];
  acceptableDocumentsHi: string[];
  aadhaarMaskingInstructionEn: string;
  aadhaarMaskingInstructionHi: string;
  sourceUrl: string;
  verifiedOn: string | null;
}

export interface RecommenderInput {
  hasPreviousRegistration: 'YES' | 'NO' | 'NOT_SURE';
  hasEpicCard: 'YES' | 'NO';
  isShiftingResidence: 'NO' | 'WITHIN_CONSTITUENCY' | 'ACROSS_CONSTITUENCY';
  hasNameOrParticularsCorrection: boolean;
  needsReplacementEpic: boolean;
  needsPwdMarking: boolean;
  isOverseasCitizen: boolean;
  suspectsDuplicateRecord: boolean;
  userState?: string;
}

export interface RecommendationResult {
  recommendedForm: FormCode;
  formNameEn: string;
  formNameHi: string;
  reasonsEn: string[];
  reasonsHi: string[];
  statutoryBasisEn: string;
  statutoryBasisHi: string;
  officialSourceUrl: string;
  verifiedOn: string | null;
  applicableDeadlineWindow?: string;
  caveatEn: string;
  caveatHi: string;
  documentChecklistIds: string[];
}
