export interface HelplineEntry {
  id: string;
  nameEn: string;
  nameHi: string;
  number: string;
  tollFree: boolean;
  hoursEn: string;
  hoursHi: string;
  jurisdiction: string;
  verifiedOn: string | null;
  requiresVerification: boolean;
  notesEn: string;
  notesHi: string;
}

export const HELPLINE_SEEDS: HelplineEntry[] = [
  {
    id: 'helpline-eci-1950',
    nameEn: 'National Voter Helpline',
    nameHi: 'राष्ट्रीय मतदाता हेल्पलाइन',
    number: '1950',
    tollFree: true,
    hoursEn: 'Available 10:00 AM to 5:00 PM on all working days',
    hoursHi: 'सभी कार्यदिवसों पर सुबह 10:00 बजे से शाम 5:00 बजे तक उपलब्ध',
    jurisdiction: 'IN',
    verifiedOn: '2026-10-30',
    requiresVerification: false,
    notesEn: 'Prefix your STD code when dialling 1950 from a mobile phone to reach your local District Contact Centre.',
    notesHi: 'अपने स्थानीय जिला संपर्क केंद्र से जुड़ने के लिए मोबाइल फोन से 1950 डायल करते समय अपना एसटीडी कोड लगाएं।',
  },
  {
    id: 'helpline-delhi-ceo',
    nameEn: 'Chief Electoral Officer, Delhi Helpline',
    nameHi: 'मुख्य निर्वाचन अधिकारी, दिल्ली हेल्पलाइन',
    number: '011-23992214',
    tollFree: false,
    hoursEn: 'Working hours (Monday - Friday)',
    hoursHi: 'कार्यदिवस (सोमवार - शुक्रवार)',
    jurisdiction: 'DL',
    verifiedOn: null,
    requiresVerification: true,
    notesEn: 'State CEO direct line (pending annual verification).',
    notesHi: 'राज्य सीईओ डायरेक्ट लाइन (सत्यापन लंबित)।',
  },
];
