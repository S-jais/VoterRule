export const PRODUCT_NAME = 'VoterRule';
export const PRODUCT_NAME_HI = 'वोटररूल';
export const PRODUCT_TAGLINE = 'Every Eligible Voter. Every Right. Every Voice.';

export const CIVIC_DISCLAIMER_EN =
  'VoterRule is an independent civic-assistance platform. Official registration, correction, inclusion, and deletion decisions are made solely by the competent election authorities.';

export const CIVIC_DISCLAIMER_HI =
  'VoterRule एक स्वतंत्र नागरिक सहायता मंच है। आधिकारिक पंजीकरण, सुधार, समावेशन और विलोपन के निर्णय केवल सक्षम चुनाव अधिकारियों द्वारा लिए जाते हैं।';

export const PORTAL_REF_NOTICE_EN = 'Portal reference (not an official ECI number)';
export const PORTAL_REF_NOTICE_HI = 'पोर्टल संदर्भ (यह आधिकारिक चुनाव आयोग संदर्भ संख्या नहीं है)';

export const K_ANONYMITY_THRESHOLD = 10;
export const DEFAULT_STALENESS_DAYS = 30;
export const MAX_THIRD_PARTY_REPORTS_PER_30_DAYS = 3;
export const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;

// Accusatory or prejudicial terms that are strictly prohibited across the codebase, UI, and enums
export const BANNED_TERMS = [
  'fraud',
  'fake',
  'illegal voter',
  'duplicate voter',
  'ghost voter',
  'bogus',
  'infiltrator',
  'impostor',
] as const;
