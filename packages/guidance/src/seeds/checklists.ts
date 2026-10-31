import { DocumentRequirement } from '../types.js';

export const DOCUMENT_CHECKLIST_SEEDS: DocumentRequirement[] = [
  {
    id: 'doc-age-proof',
    category: 'AGE',
    titleEn: 'Proof of Age / Date of Birth',
    titleHi: 'आयु / जन्म तिथि का प्रमाण',
    descriptionEn: 'Official document evidencing your date of birth or age (applicable for new registration or DOB correction).',
    descriptionHi: 'आपकी जन्म तिथि या आयु को प्रमाणित करने वाला आधिकारिक दस्तावेज़।',
    acceptableDocumentsEn: [
      'Birth Certificate issued by Municipal Authority or Registrar of Births & Deaths',
      'Aadhaar Letter / Card (Mask all but the last 4 digits before uploading)',
      'PAN Card',
      'Driving Licence',
      'Indian Passport',
      'Matriculation / Class 10/12 Certificate / Marksheet',
    ],
    acceptableDocumentsHi: [
      'नगर पालिका या जन्म-मृत्यु रजिस्ट्रार द्वारा जारी जन्म प्रमाण पत्र',
      'आधार पत्र / कार्ड (अपलोड करने से पहले अंतिम 4 अंकों को छोड़कर बाकी छुपाएं)',
      'पैन कार्ड',
      'ड्राइविंग लाइसेंस',
      'भारतीय पासपोर्ट',
      'मैट्रिक / कक्षा 10/12 का प्रमाण पत्र या अंकतालिका',
    ],
    aadhaarMaskingInstructionEn:
      'IMPORTANT: If uploading Aadhaar as age proof, ensure you mask the first 8 digits so that only the last 4 digits are visible.',
    aadhaarMaskingInstructionHi:
      'महत्वपूर्ण: यदि आयु प्रमाण के रूप में आधार अपलोड कर रहे हैं, तो सुनिश्चित करें कि पहले 8 अंक ढके हुए हों और केवल अंतिम 4 अंक ही दिखाई दें।',
    sourceUrl: 'https://voters.eci.gov.in',
    verifiedOn: '2026-10-30',
  },
  {
    id: 'doc-address-proof',
    category: 'ADDRESS',
    titleEn: 'Proof of Ordinary Residence',
    titleHi: 'सामान्य निवास का प्रमाण',
    descriptionEn: 'Document proving that you are ordinarily resident at the stated address in the constituency.',
    descriptionHi: 'यह प्रमाणित करने वाला दस्तावेज़ कि आप संबंधित निर्वाचन क्षेत्र में उस पते पर सामान्य रूप से निवास करते हैं।',
    acceptableDocumentsEn: [
      'Water / Electricity / Gas Connection Bill for the address (not older than 1 year)',
      'Current Passbook of Nationalized / Scheduled Bank or Post Office',
      'Indian Passport',
      'Revenue Department Land / House Ownership / Registered Rent Agreement Deed',
      'Aadhaar Card (Ensure first 8 digits are masked, showing only last 4 digits)',
    ],
    acceptableDocumentsHi: [
      'पते का पानी / बिजली / गैस कनेक्शन बिल (1 वर्ष से पुराना न हो)',
      'राष्ट्रीयकृत / अनुसूचित बैंक या डाकघर की पासबुक',
      'भारतीय पासपोर्ट',
      'राजस्व विभाग का भूमि/मकान स्वामित्व विलेख या पंजीकृत किराया समझौता',
      'आधार कार्ड (पहले 8 अंकों को ढकें, केवल अंतिम 4 अंक दिखने चाहिए)',
    ],
    aadhaarMaskingInstructionEn:
      'IMPORTANT: VoterRule never stores unmasked Aadhaar numbers. Mask the first 8 digits before upload.',
    aadhaarMaskingInstructionHi:
      'महत्वपूर्ण: VoterRule कभी भी पूर्ण आधार संख्या संग्रहीत नहीं करता। अपलोड करने से पहले पहले 8 अंक ढकें।',
    sourceUrl: 'https://voters.eci.gov.in',
    verifiedOn: '2026-10-30',
  },
  {
    id: 'doc-death-proof',
    category: 'DECEASED',
    titleEn: 'Proof for Deceased Person Report',
    titleHi: 'मृत व्यक्ति रिपोर्ट हेतु प्रमाण',
    descriptionEn: 'Lawfully acquired documentary support confirming that the elector is deceased.',
    descriptionHi: 'मतदाता के निधन की पुष्टि करने वाला वैध आधिकारिक दस्तावेज़।',
    acceptableDocumentsEn: [
      'Official Death Certificate issued by Registrar of Births and Deaths',
      'Hospital Death Summary / Record',
      'Cremation / Burial Certificate from Municipal or Panchayat authority',
    ],
    acceptableDocumentsHi: [
      'जन्म एवं मृत्यु रजिस्ट्रार द्वारा जारी आधिकारिक मृत्यु प्रमाण पत्र',
      'अस्पताल का मृत्यु सारांश / रिकॉर्ड',
      'नगर निकाय या पंचायत प्राधिकरण द्वारा जारी दाह संस्कार / दफन प्रमाण पत्र',
    ],
    aadhaarMaskingInstructionEn: 'Do not submit documents containing unmasked Aadhaar numbers of any individual.',
    aadhaarMaskingInstructionHi: 'किसी भी व्यक्ति का पूर्ण आधार नंबर युक्त दस्तावेज़ अपलोड न करें।',
    sourceUrl: 'https://voters.eci.gov.in',
    verifiedOn: '2026-10-30',
  },
];
