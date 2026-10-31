export interface OfficialLink {
  id: string;
  titleEn: string;
  titleHi: string;
  url: string;
  descriptionEn: string;
  descriptionHi: string;
  category: 'SEARCH' | 'FORMS' | 'PORTAL' | 'STATE_CEO' | 'GRIEVANCE';
  verifiedOn: string | null;
  requiresVerification: boolean;
}

export const OFFICIAL_LINKS_SEEDS: OfficialLink[] = [
  {
    id: 'link-eci-voter-search',
    titleEn: 'Official Electoral Roll Search (ECI)',
    titleHi: 'आधिकारिक मतदाता सूची खोज (चुनाव आयोग)',
    url: 'https://electoralsearch.eci.gov.in',
    descriptionEn: 'Search your official electoral roll status by EPIC, Details, or Mobile OTP directly on ECI portal.',
    descriptionHi: 'चुनाव आयोग के आधिकारिक पोर्टल पर ईपीआईसी, विवरण या मोबाइल ओटीपी द्वारा अपना मतदाता विवरण खोजें।',
    category: 'SEARCH',
    verifiedOn: '2026-10-30',
    requiresVerification: false,
  },
  {
    id: 'link-voters-service-portal',
    titleEn: 'ECI Voters’ Service Portal',
    titleHi: 'चुनाव आयोग मतदाता सेवा पोर्टल',
    url: 'https://voters.eci.gov.in',
    descriptionEn: 'Official portal to submit statutory Forms 6, 6A, 7, and 8 online.',
    descriptionHi: 'वैधानिक प्रारूप 6, 6क, 7 और 8 ऑनलाइन जमा करने हेतु आधिकारिक पोर्टल।',
    category: 'FORMS',
    verifiedOn: '2026-10-30',
    requiresVerification: false,
  },
  {
    id: 'link-ngsp-grievance',
    titleEn: 'ECI National Grievance Services Portal',
    titleHi: 'राष्ट्रीय शिकायत निवारण सेवा पोर्टल',
    url: 'https://eci-citizenservices.eci.nic.in',
    descriptionEn: 'Official platform for lodging statutory complaints with District and State election officers.',
    descriptionHi: 'जिला एवं राज्य निर्वाचन अधिकारियों के समक्ष आधिकारिक शिकायत दर्ज कराने का मंच।',
    category: 'GRIEVANCE',
    verifiedOn: '2026-10-30',
    requiresVerification: false,
  },
];
