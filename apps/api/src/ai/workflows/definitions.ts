import { WorkflowDefinition } from '../interfaces.js';

export const WORKFLOW_DEFINITIONS: Record<string, WorkflowDefinition> = {
  // 1. Missing Name (Flagship Workflow)
  missing_name: {
    id: 'missing_name',
    titleEn: 'Missing Name & Omission Assistance',
    titleHi: 'मतदाता सूची से छूटा हुआ नाम सहायता',
    descriptionEn: 'Step-by-step guidance when your name is not found on the electoral roll.',
    descriptionHi: 'मतदाता सूची में नाम न मिलने पर चरणबद्ध सहायता।',
    startingRouteId: 'check_voter_status',
    officialReference: {
      title: 'ECI Electoral Search',
      url: 'https://electoralsearch.eci.gov.in',
    },
    steps: [
      {
        id: 'step_1_epic_check',
        titleEn: 'EPIC Number Check',
        titleHi: 'ईपीआईसी नंबर की जांच',
        questionEn: 'Do you have an existing Voter ID Card (EPIC number) or have you previously been registered?',
        questionHi: 'क्या आपके पास मौजूदा वोटर आईडी कार्ड (ईपीआईसी नंबर) है या आप पहले पंजीकृत थे?',
        options: [
          { id: 'has_epic', labelEn: 'Yes, I have an EPIC number', labelHi: 'हाँ, मेरे पास ईपीआईसी नंबर है', nextStepId: 'step_2_official_search' },
          { id: 'no_epic_first_time', labelEn: 'No, this is my first time', labelHi: 'नहीं, मैं पहली बार पंजीकरण कर रहा हूँ', nextStepId: 'step_new_reg_redirect' },
          { id: 'not_sure', labelEn: 'Not sure / Previously registered without card', labelHi: 'निश्चित नहीं / पहले पंजीकृत था', nextStepId: 'step_2_official_search' },
        ],
        allowedTools: ['navigateTo', 'highlightElement'],
      },
      {
        id: 'step_2_official_search',
        titleEn: 'Official Roll Search Guidance',
        titleHi: 'आधिकारिक मतदाता खोज निर्देश',
        questionEn: 'Please visit electoralsearch.eci.gov.in or use our Status Check to verify your entry. What was the observed result?',
        questionHi: 'कृपया आधिकारिक पोर्टल पर खोजें। आपको क्या परिणाम प्राप्त हुआ?',
        options: [
          { id: 'outcome_present', labelEn: 'Confirmed Present in Official Result', labelHi: 'आधिकारिक खोज में नाम मिल गया', nextStepId: 'step_found_success' },
          { id: 'outcome_not_found', labelEn: 'Not Found in Checked Search', labelHi: 'जांची गई खोज में नाम नहीं मिला', nextStepId: 'step_3_navigate_missing' },
          { id: 'outcome_differs', labelEn: 'Details Appear Inconsistent', labelHi: 'रिकॉर्ड मिला, लेकिन विवरण भिन्न हैं', nextStepId: 'step_correction_redirect' },
          { id: 'outcome_failed', labelEn: 'Search Could Not Be Completed (Timeout/Error)', labelHi: 'खोज पूरी नहीं हो सकी (तकनीकी त्रुटि)', nextStepId: 'step_retry_help' },
        ],
        allowedTools: ['navigateTo', 'openOfficialSource'],
      },
      {
        id: 'step_3_navigate_missing',
        titleEn: 'Start Missing Name Assistance Case',
        titleHi: 'छूटे हुए नाम का केस दर्ज करें',
        questionEn: 'Since the official search did not return your record, we can help you prepare an official Form 6 for re-inclusion. Would you like to open the Missing Name form now?',
        questionHi: 'क्योंकि आधिकारिक खोज में आपका नाम नहीं मिला, हम नाम पुनः जोड़ने हेतु फॉर्म 6 तैयार करने में मदद कर सकते हैं। क्या आप फॉर्म खोलना चाहते हैं?',
        options: [
          {
            id: 'open_form',
            labelEn: 'Yes, open Missing Name Assistant',
            labelHi: 'हाँ, मिसिंग नेम असिस्टेंट खोलें',
            nextStepId: 'step_4_explain_documents',
            recommendedAction: {
              id: 'nav-missing',
              type: 'navigate_to',
              label: 'Open Missing Name Assistant',
              payload: { routeId: 'missing_name_assistance' },
            },
          },
          { id: 'need_more_info', labelEn: 'Tell me what documents I will need first', labelHi: 'पहले बताएं कौन से दस्तावेज लगेंगे', nextStepId: 'step_4_explain_documents' },
        ],
        allowedTools: ['navigateTo', 'highlightElement'],
      },
      {
        id: 'step_4_explain_documents',
        titleEn: 'Required Statutory Documents',
        titleHi: 'आवश्यक वैधानिक दस्तावेज',
        questionEn: 'For Form 6 (Inclusion of Name), you will need: (1) Proof of Age (Aadhaar, Birth Certificate, PAN, Passport, or 10th marksheet) and (2) Proof of Ordinary Residence (Water/Electricity bill, Bank passbook, Passport, or Rent deed). Do you have these available?',
        questionHi: 'प्रारूप 6 के लिए आपको आयु प्रमाण और सामान्य निवास प्रमाण की आवश्यकता होगी। क्या आपके पास ये उपलब्ध हैं?',
        options: [
          { id: 'docs_ready', labelEn: 'Yes, I have my documents ready', labelHi: 'हाँ, दस्तावेज तैयार हैं', nextStepId: 'step_5_official_procedure' },
          { id: 'need_time', labelEn: 'I need to arrange them first', labelHi: 'मुझे पहले इन्हें जुटाना होगा', nextStepId: 'step_5_official_procedure' },
        ],
        allowedTools: ['openHelp'],
      },
      {
        id: 'step_5_official_procedure',
        titleEn: 'Statutory Procedure & Submission',
        titleHi: 'वैधानिक प्रक्रिया एवं जमा करना',
        questionEn: 'VoteRule will generate an Application Preparation Sheet for you. Remember that final inclusion decisions are made strictly by your local Electoral Registration Officer (ERO). How would you prefer to submit?',
        questionHi: 'VoteRule आपके लिए आवेदन तैयारी पत्र तैयार करेगा। याद रखें कि अंतिम निर्णय ईआरओ द्वारा ही लिया जाता है। आप कैसे जमा करना चाहते हैं?',
        options: [
          { id: 'submit_online_eci', labelEn: 'Submit online at voters.eci.gov.in', labelHi: 'voters.eci.gov.in पर ऑनलाइन जमा करें', nextStepId: 'step_6_complete' },
          { id: 'submit_physical_blo', labelEn: 'Hand over printout to my Booth Level Officer (BLO)', labelHi: 'बीएलओ को भौतिक रूप से सौंपें', nextStepId: 'step_6_complete' },
        ],
        allowedTools: ['openOfficialSource'],
      },
      {
        id: 'step_6_complete',
        titleEn: 'Assistance Workflow Complete',
        titleHi: 'सहायता प्रक्रिया संपन्न',
        questionEn: 'You are all set! You can download your preparation sheet anytime from your dashboard or call the National Voter Helpline 1950 if you need further on-ground guidance.',
        questionHi: 'प्रक्रिया पूर्ण हुई! आप अपने डैशबोर्ड से कभी भी तैयारी पत्र डाउनलोड कर सकते हैं या 1950 पर कॉल कर सकते हैं।',
        options: [
          { id: 'finish_done', labelEn: 'Go to my Dashboard', labelHi: 'डैशबोर्ड पर जाएं', recommendedAction: { id: 'nav-dash', type: 'navigate_to', label: 'Go to Dashboard', payload: { routeId: 'dashboard' } } },
        ],
        allowedTools: ['navigateTo'],
      },
      {
        id: 'step_found_success',
        titleEn: 'Record Verified',
        titleHi: 'रिकॉर्ड सत्यापित',
        questionEn: 'Great news! Your name is present on the official roll. You are eligible to cast your vote at your assigned polling station. Would you like to save this check outcome in your VoteRule dashboard?',
        questionHi: 'शुभ समाचार! आपका नाम आधिकारिक सूची में है। क्या आप इसे अपने डैशबोर्ड में सहेजना चाहते हैं?',
        options: [
          { id: 'save_to_dash', labelEn: 'Save outcome to dashboard', labelHi: 'डैशबोर्ड में सहेजें', recommendedAction: { id: 'nav-check', type: 'navigate_to', label: 'Save Status Check', payload: { routeId: 'check_voter_status' } } },
        ],
        allowedTools: ['navigateTo'],
      },
      {
        id: 'step_new_reg_redirect',
        titleEn: 'New Voter Enrollment (Form 6)',
        titleHi: 'नया मतदाता पंजीकरण (प्रारूप 6)',
        questionEn: 'Since you are registering for the first time, you should use official Form 6. You can check your advance qualifying dates using our Eligibility Checker.',
        questionHi: 'चूंकि आप पहली बार पंजीकरण कर रहे हैं, आपको प्रारूप 6 का उपयोग करना चाहिए। आप हमारी पात्रता जांच से तिथियां देख सकते हैं।',
        options: [
          { id: 'go_eligibility', labelEn: 'Check my Eligibility & Qualifying Date', labelHi: 'मेरी पात्रता जांचें', recommendedAction: { id: 'nav-elig', type: 'navigate_to', label: 'Open Eligibility Checker', payload: { routeId: 'eligibility_check' } } },
        ],
        allowedTools: ['navigateTo'],
      },
      {
        id: 'step_correction_redirect',
        titleEn: 'Correction of Details (Form 8)',
        titleHi: 'विवरण सुधार (प्रारूप 8)',
        questionEn: 'If your record was found but has spelling or address inaccuracies, you should submit statutory Form 8 for correction of particulars.',
        questionHi: 'यदि नाम या पते में अशुद्धि है, तो सुधार हेतु प्रारूप 8 प्रस्तुत किया जाना चाहिए।',
        options: [
          { id: 'learn_form_8', labelEn: 'Learn more about Form 8 corrections', labelHi: 'प्रारूप 8 के बारे में जानें' },
        ],
        allowedTools: ['openHelp'],
      },
      {
        id: 'step_retry_help',
        titleEn: 'Official Search Unavailable',
        titleHi: 'खोज अनुपलब्ध',
        questionEn: 'If the official ECI portal is undergoing maintenance or timing out, please try again after a few minutes, or contact the National Voter Helpline at 1950.',
        questionHi: 'यदि आधिकारिक सर्वर में तकनीकी समस्या है, तो कृपया कुछ समय बाद पुनः प्रयास करें या 1950 पर संपर्क करें।',
        options: [
          { id: 'helpline_info', labelEn: 'View Helpline details (1950)', labelHi: 'हेल्पलाइन विवरण देखें', recommendedAction: { id: 'nav-assist', type: 'navigate_to', label: 'View Helplines', payload: { routeId: 'assisted_support' } } },
        ],
        allowedTools: ['navigateTo'],
      },
    ],
  },

  // 2. New Voter Registration
  new_registration: {
    id: 'new_registration',
    titleEn: 'New Voter Registration Guidance (Form 6)',
    titleHi: 'नया मतदाता पंजीकरण मार्गदर्शक (प्रारूप 6)',
    descriptionEn: 'Guide for first-time electors and citizens turning 18.',
    descriptionHi: 'पहली बार पंजीकरण करने वाले नागरिकों के लिए मार्गदर्शन।',
    startingRouteId: 'eligibility_check',
    officialReference: {
      title: 'ECI Form 6 - Inclusion of Name',
      url: 'https://voters.eci.gov.in',
    },
    steps: [
      {
        id: 'new_reg_step_1',
        titleEn: 'Age & Qualifying Date Check',
        titleHi: 'आयु एवं पात्रता तिथि',
        questionEn: 'Under Section 14(b) RPA 1950, you are eligible if you turn 18 on or before: 1 Jan, 1 Apr, 1 Jul, or 1 Oct. Would you like to verify your exact qualifying date?',
        questionHi: 'क्या आप अपनी सही अर्हक तिथि की पुष्टि करना चाहते हैं?',
        options: [
          { id: 'yes_check_elig', labelEn: 'Check eligibility now', labelHi: 'पात्रता जांचें', recommendedAction: { id: 'nav-elig', type: 'navigate_to', label: 'Check Eligibility', payload: { routeId: 'eligibility_check' } } },
        ],
        allowedTools: ['navigateTo'],
      },
    ],
  },

  // 3. Duplicate Registration Concern
  duplicate_concern: {
    id: 'duplicate_concern',
    titleEn: 'Duplicate Registration Self-Check & Resolution',
    titleHi: 'दोहरा पंजीकरण स्व-जांच एवं समाधान',
    descriptionEn: 'Identify and resolve redundant entries under Sections 17 & 18 RPA 1950.',
    descriptionHi: 'जनप्रतिनिधित्व अधिनियम की धारा 17 व 18 के तहत दोहरे पंजीकरण की जांच।',
    startingRouteId: 'duplicate_self_check',
    officialReference: {
      title: 'Representation of the People Act 1950 (Section 17 & 18)',
      url: 'https://www.indiacode.nic.in',
    },
    steps: [
      {
        id: 'dup_step_1',
        titleEn: 'Duplicate Risk Assessment',
        titleHi: 'दोहरा पंजीकरण मूल्यांकन',
        questionEn: 'Have you moved residences from another town or state without formally transferring your voter registration?',
        questionHi: 'क्या आप पूर्व निवास से बिना स्थानांतरण आवेदन किए नए स्थान पर आए हैं?',
        options: [
          { id: 'yes_moved', labelEn: 'Yes, I moved from another place', labelHi: 'हाँ, मैंने निवास बदला है', recommendedAction: { id: 'nav-dup', type: 'navigate_to', label: 'Open Duplicate Self-Check', payload: { routeId: 'duplicate_self_check' } } },
          { id: 'no_same_place', labelEn: 'No, I have always lived here', labelHi: 'नहीं, मैं हमेशा यहीं रहा हूँ' },
        ],
        allowedTools: ['navigateTo'],
      },
    ],
  },

  // 4. Deceased Elector Reporting
  deceased_report: {
    id: 'deceased_report',
    titleEn: 'Reporting a Deceased Elector for Verification',
    titleHi: 'मृत मतदाता प्रविष्टि की सूचना',
    descriptionEn: 'Responsible reporting of deceased elector records to support roll accuracy.',
    descriptionHi: 'मतदाता सूची की शुद्धता हेतु मृत प्रविष्टि की जिम्मेदार सूचना।',
    startingRouteId: 'deceased_person_report',
    officialReference: {
      title: 'ECI Form 7 - Objection / Deletion',
      url: 'https://voters.eci.gov.in',
    },
    steps: [
      {
        id: 'dec_step_1',
        titleEn: 'Basis of Knowledge',
        titleHi: 'जानकारी का आधार',
        questionEn: 'Under statutory safeguards, deletions require official death verification by the ERO and cannot be initiated anonymously or maliciously. Are you an immediate family member, legal heir, or verified neighbour?',
        questionHi: 'कानूनी सुरक्षा नियमों के तहत, विलोपन हेतु ईआरओ द्वारा सत्यापन आवश्यक है। क्या आप निकट परिजन हैं?',
        options: [
          { id: 'family_member', labelEn: 'Yes, I am a family member / neighbour', labelHi: 'हाँ, मैं पारिवारिक सदस्य हूँ', recommendedAction: { id: 'nav-dec', type: 'navigate_to', label: 'Open Deceased Reporting Form', payload: { routeId: 'deceased_person_report' } } },
        ],
        allowedTools: ['navigateTo'],
      },
    ],
  },
};

