import {
  AIAction,
  Citation,
  ChatMessage,
  KnowledgeChunk,
  LLMOptions,
  LLMProvider,
  LLMResponse,
} from '../interfaces.js';
import { IntentClassifier } from '../intent/classifier.js';

export class RuleBasedLLMProvider implements LLMProvider {
  public readonly name = 'RuleBasedStatutoryProvider';

  public isAvailable(): boolean {
    return true; // Always available offline
  }

  public async generateResponse(
    messages: ChatMessage[],
    retrievedChunks: KnowledgeChunk[],
    options: LLMOptions
  ): Promise<LLMResponse> {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    const userText = lastUserMsg?.content || '';
    const classification = IntentClassifier.classify(userText, {
      currentRouteId: options.currentRouteId,
    });

    const isHindi = classification.language === 'hi' || options.locale === 'hi';
    const citations: Citation[] = retrievedChunks.map((chunk) => ({
      id: chunk.id,
      title: chunk.title,
      officialSource: chunk.officialSource,
      sourceUrl: chunk.sourceUrl,
      lastVerifiedDate: chunk.lastVerifiedDate,
      category: chunk.category,
      snippet: chunk.text.slice(0, 150) + '...',
    }));

    let displayText = '';
    let spokenText = '';
    const actions: AIAction[] = [];
    const suggestedPrompts: string[] = [];

    switch (classification.intent) {
      case 'greeting': {
        if (isHindi) {
          displayText = `नमस्ते! मैं **VoteRule AI** हूँ, आपका डिजिटल नागरिक सहायक।\n\nमैं आपको मतदाता पंजीकरण, मतदाता सूची में नाम जांचने, छूटे हुए नामों की पुनः प्रविष्टि (प्रारूप 6), और आधिकारिक चुनाव प्रक्रियाओं को समझने में सहायता करता हूँ।\n\n*नोट: यह एक स्वतंत्र नागरिक सहायता मंच है, और इसका चुनाव आयोग से कोई आधिकारिक संबंध नहीं है।*`;
          spokenText = `नमस्ते! मैं VoteRule AI हूँ, आपका डिजिटल नागरिक सहायक। मैं मतदाता सूची और पंजीकरण प्रक्रियाओं में आपकी सहायता के लिए तैयार हूँ।`;
          suggestedPrompts.push(
            'मेरी मतदाता सूची स्थिति जांचें',
            'मेरा नाम मतदाता सूची में नहीं है',
            'प्रारूप 6 क्या है?',
            'मतदान पात्रता की शर्तें क्या हैं?'
          );
        } else {
          displayText = `Hello! I'm **VoteRule AI**, your Digital Civic Assistant.\n\nI can help you check your electoral roll status, resolve missing voter records, prepare official statutory applications (Forms 6, 6A, 6B, 7, and 8), and understand Indian election procedures.\n\n> **Notice:** VoteRule is an independent civic-assistance platform. Official decisions rest solely with statutory Electoral Registration Officers (EROs).`;
          spokenText = `Hello! I'm VoteRule AI, your Digital Civic Assistant. I can help you verify your electoral roll status and navigate voter registration procedures.`;
          suggestedPrompts.push(
            'Check my voter registration',
            'My name is missing from the voter list',
            'Explain Form 6',
            'What are the voting eligibility requirements?'
          );
        }
        break;
      }

      case 'voterule_feature_explanation': {
        if (isHindi) {
          displayText = `**VoteRule (वोटररूल)** एक स्वतंत्र नागरिक प्रौद्योगिकी मंच है जो भारतीय नागरिकों को चुनावी अधिकारों के उपयोग में सहायता करता है:\n\n1. **आधिकारिक खोज सत्यापन:** आधिकारिक चुनाव आयोग पोर्टल पर स्थिति जांचने में सहायता।\n2. **छूटा हुआ नाम सहायता:** यदि नाम सूची में नहीं है, तो प्रारूप 6 तैयार करना।\n3. **दोहरा पंजीकरण स्व-जांच:** विभिन्न पतों पर अनावश्यक प्रविष्टियों की पहचान।\n4. **नागरिक गोपनीयता:** शून्य-ट्रैकिंग और आधार नंबर कभी न मांगने की गारंटी।`;
          spokenText = `VoteRule एक स्वतंत्र नागरिक मंच है जो मतदाता सूची सत्यापन और सरकारी फॉर्म तैयार करने में नागरिकों की सहायता करता है।`;
          suggestedPrompts.push('स्थिति जांच कैसे काम करती है?', 'क्या यह चुनाव आयोग का आधिकारिक पोर्टल है?');
        } else {
          displayText = `**VoteRule** is an independent, non-partisan civic-assistance platform designed to help eligible Indian citizens protect their voting rights:\n\n1. **Official Roll Status Check:** Guides citizens to official ECI search tools without scraping or CAPTCHA circumvention.\n2. **Missing Name Assistance:** Step-by-step diagnosis and Form 6 preparation when an elector's name is omitted.\n3. **Duplicate Self-Check:** Helps electors identify redundant entries from prior addresses under Sections 17 & 18 of RPA 1950.\n4. **Statutory Guidance:** Educational explanations of constitutional Articles 324–326 and ECI guidelines.`;
          spokenText = `VoteRule is an independent civic assistance platform helping electors verify their roll status and prepare official voter applications.`;
          suggestedPrompts.push('How does status check work?', 'Is VoteRule affiliated with ECI?');
        }
        break;
      }

      case 'missing_name_assistance': {
        if (isHindi) {
          displayText = `यदि आपका नाम मतदाता सूची में नहीं मिल रहा है, तो घबराएं नहीं। आधिकारिक खोज में नाम न मिलने का अर्थ स्वतः गैर-कानूनी विलोपन नहीं होता है।\n\n**प्रक्रिया:**\n1. अपने ईपीआईसी नंबर या नाम के वैकल्पिक वर्तनी से आधिकारिक खोज पुनः जांचें।\n2. यदि नाम वास्तव में छूट गया है, तो आप **प्रारूप 6** भरकर पुनः नाम जुड़वा सकते हैं।\n3. VoteRule पर आप **मिसिंग नेम असिस्टेंट** खोलकर आवेदन तैयारी पत्र तैयार कर सकते हैं।`;
          spokenText = `यदि आपका नाम सूची में नहीं मिला, तो आप प्रारूप 6 भरकर पुनः नाम सम्मिलित करवा सकते हैं। क्या आप मिसिंग नेम असिस्टेंट खोलना चाहते हैं?`;
          actions.push({
            id: 'act-nav-missing',
            type: 'navigate_to',
            label: 'Open Missing Name Assistant',
            payload: { routeId: 'missing_name_assistance' },
          });
          suggestedPrompts.push('प्रारूप 6 के लिए कौन से दस्तावेज चाहिए?', 'मिसिंग नेम असिस्टेंट खोलें');
        } else {
          displayText = `If your name was not found on the electoral roll, don't worry. A missing search result does **not** automatically establish unlawful deletion—it simply means the query returned zero records on the official portal.\n\n### Recommended Next Steps:\n1. **Verify Official Search:** Re-check using both your EPIC number and name spelling variations on \`electoralsearch.eci.gov.in\`.\n2. **Prepare Form 6:** If your entry was omitted, submit statutory **Form 6** for inclusion.\n3. **Launch VoteRule Assistant:** Use our guided in-app wizard to generate an Application Preparation Sheet for your Electoral Registration Officer (ERO).`;
          spokenText = `If your name is not on the roll, you can submit Form 6 for fresh inclusion. I can take you to our Missing Name Assistant right now.`;
          actions.push({
            id: 'act-nav-missing',
            type: 'navigate_to',
            label: 'Open Missing Name Assistant',
            payload: { routeId: 'missing_name_assistance' },
          });
          actions.push({
            id: 'act-start-workflow',
            type: 'start_workflow',
            label: 'Start Missing Name Guided Steps',
            payload: { workflowId: 'missing_name' },
          });
          suggestedPrompts.push('What documents are required for Form 6?', 'Take me to Missing Name Assistant');
        }
        break;
      }

      case 'eligibility_guidance': {
        if (isHindi) {
          displayText = `**भारतीय संविधान के अनुच्छेद 326** और जनप्रतिनिधित्व अधिनियम 1950 के अनुसार मतदान पात्रता:\n\n- **नागरिकता:** भारत का नागरिक होना अनिवार्य है।\n- **न्यूनतम आयु:** 18 वर्ष। 2021 के संशोधन के बाद वर्ष में 4 अर्हक तिथियां हैं: **1 जनवरी, 1 अप्रैल, 1 जुलाई, और 1 अक्टूबर**।\n- **निवास:** संबंधित निर्वाचन क्षेत्र का 'सामान्य निवासी' होना चाहिए।\n- **अयोग्यताएं:** सक्षम न्यायालय द्वारा विकृतचित्त घोषित या चुनावी भ्रष्टाचार के तहत अयोग्य व्यक्ति पंजीकृत नहीं हो सकते।`;
          spokenText = `भारतीय नागरिक जो 18 वर्ष के हो चुके हैं और किसी न्यायालय द्वारा अयोग्य नहीं हैं, वे 4 अर्हक तिथियों के तहत पंजीकरण के पात्र हैं।`;
          actions.push({
            id: 'act-nav-elig',
            type: 'navigate_to',
            label: 'Check Eligibility Calculator',
            payload: { routeId: 'eligibility_check' },
          });
          suggestedPrompts.push('4 अर्हक तिथियां क्या हैं?', 'पात्रता कैलकुलेटर खोलें');
        } else {
          displayText = `Under **Article 326 of the Constitution of India** and the Representation of the People Act 1950, voter eligibility requires:\n\n- **Citizenship:** Must be an Indian citizen.\n- **Age:** 18 years on or before any of the **four qualifying dates** (1 Jan, 1 Apr, 1 Jul, 1 Oct).\n- **Ordinary Residence:** Must be ordinarily resident in the assembly constituency.\n- **Disqualifications:** Non-citizens, persons declared of unsound mind by a competent court, or disqualified for corrupt election practices cannot register.\n\n> Prospective electors aged 17+ can submit advance applications during the annual Special Summary Revision (SSR).`;
          spokenText = `To vote in India, you must be a citizen aged 18 on any of the four qualifying dates, ordinarily resident, and not disqualified by law.`;
          actions.push({
            id: 'act-nav-elig',
            type: 'navigate_to',
            label: 'Open Eligibility Calculator',
            payload: { routeId: 'eligibility_check' },
          });
          suggestedPrompts.push('What are the four qualifying dates?', 'Can 17-year-olds apply in advance?');
        }
        break;
      }

      case 'voter_registration_guidance': {
        const formCode = classification.extractedEntities?.formCode || 'FORM_6';
        if (formCode === 'STATUS_CHECK') {
          if (isHindi) {
            displayText = `**मतदाता सूची स्थिति सत्यापन:**\n\n- **आधिकारिक प्रक्रिया:** आप अपने **EPIC नंबर** (मतदाता पहचान पत्र संख्या) या व्यक्तिगत विवरण द्वारा आधिकारिक निर्वाचन आयोग पोर्टल (\`voters.eci.gov.in\`) पर स्थिति की जांच कर सकते हैं।\n- **VoteRule सहायता:** VoteRule आपके खोज विवरण का एक स्वतंत्र रिकॉर्ड सुरक्षित रखने में मदद करता है ताकि यदि कभी आपका नाम अचानक गायब हो तो आपके पास प्रमाण रहे।\n- **गोपनीयता:** VoteRule कभी भी कैप्चा बाईपास नहीं करता और न ही आधार नंबर मांगता है।`;
            spokenText = `आप अपने EPIC नंबर से आधिकारिक मतदाता सूची में अपना नाम जांच सकते हैं। स्थिति जांच टूल खोलने के लिए नीचे टैप करें।`;
            actions.push({
              id: 'act-nav-check',
              type: 'navigate_to',
              label: 'मतदाता स्थिति जांचें',
              payload: { routeId: 'check_voter_status' },
            });
            suggestedPrompts.push('EPIC नंबर के बिना कैसे खोजें?', 'मेरा नाम मतदाता सूची में नहीं है');
          } else {
            displayText = `**Electoral Roll Status Verification:**\n\n- **Official Verification:** You can verify your enrollment on the official ECI portal (\`voters.eci.gov.in\`) using your **EPIC Number** (Voter ID card number) or State & Assembly Constituency details.\n- **VoteRule Assistance:** VoteRule provides a structured workflow to record your verification timestamp and search details, creating an independent verifiable record.\n- **Statutory Safeguard:** A missing search result does not automatically mean illegal deletion—names may be registered under alternative spellings or part numbers.`;
            spokenText = `You can verify your electoral roll registration using your EPIC number. Tap below to open the Status Check page.`;
            actions.push({
              id: 'act-nav-check',
              type: 'navigate_to',
              label: 'Open Status Check Tool',
              payload: { routeId: 'check_voter_status' },
            });
            suggestedPrompts.push('How to search without an EPIC number?', 'My name is missing from the voter list');
          }
        } else if (formCode === 'FORM_6') {
          displayText = `**Form 6 (Application for Inclusion of Name):**\n\n- **Purpose:** For first-time electors turning 18 or citizens whose names were omitted from the roll.\n- **Key Documents:** Proof of Date of Birth (Birth Certificate, Aadhaar, PAN, Passport) and Proof of Residence (Electricity/Water bill, Bank Passbook, Passport).\n- **Submission:** Online at \`voters.eci.gov.in\` or in person to your Booth Level Officer (BLO) / ERO.`;
          spokenText = `Form 6 is the official application to enroll your name in the electoral roll. It requires proof of birth date and proof of address.`;
        } else if (formCode === 'FORM_8') {
          displayText = `**Form 8 (Correction, Shifting, Replacement & PwD):**\n\n- **Shifting of Residence:** Shift your entry to a new address or constituency.\n- **Correction of Particulars:** Correct errors in name, relative name, DOB, gender, or photo.\n- **Replacement EPIC:** Request a new voter card if lost, destroyed, or mutilated.\n- **PwD Marking:** Mark disability status for accessible voting arrangements.`;
          spokenText = `Form 8 is used to correct errors, shift your address, request a replacement voter ID, or mark disability status.`;
        } else if (formCode === 'FORM_7') {
          displayText = `**Form 7 (Objections & Deletions):**\n\n- **Purpose:** Object to a proposed inclusion or request deletion on grounds of death, permanent shifting, or disqualification.\n- **Safeguard:** False declarations carry legal penalties under Section 31 RPA 1950. Deletion requires official physical inquiry by the ERO.`;
          spokenText = `Form 7 is used to object to an entry or report a deceased person for official verification by the election officer.`;
        } else {
          displayText = `### Official Statutory Forms Overview:\n\n- **Form 6:** New voter enrollment or omitted name inclusion.\n- **Form 6A:** Registration of Overseas (NRI) Indian citizens.\n- **Form 6B:** Voluntary intimation of Aadhaar (official portal only; VoteRule never collects Aadhaar).\n- **Form 7:** Objections to inclusions or reporting deletions (death/shifting).\n- **Form 8:** Correction of details, address shifting, replacement card, or PwD marking.`;
          spokenText = `India uses Form 6 for new enrollment, Form 8 for corrections and shifting, Form 7 for deletions, and Form 6A for overseas voters.`;
        }
        suggestedPrompts.push('What is Form 8?', 'What is Form 7?', 'Where do I submit Form 6?');
        break;
      }

      case 'duplicate_registration_guidance': {
        displayText = `Under **Sections 17 and 18 of the Representation of the People Act 1950**, having duplicate registrations in more than one constituency or multiple times in the same constituency is prohibited.\n\n- **How Duplicates Occur:** Usually when an elector shifts to a new city and files Form 6 instead of shifting their existing entry with Form 8.\n- **How to Resolve:** Submit statutory **Form 8** to shift your residence, or file **Form 7** to delete the former record.\n- **Important Note:** Name similarity alone does **not** prove two entries belong to the same person.`;
        spokenText = `Under election law, an elector can only be registered once. If you moved, file Form 8 to shift your entry and avoid duplicates.`;
        actions.push({
          id: 'act-nav-dup',
          type: 'navigate_to',
          label: 'Open Duplicate Self-Check',
          payload: { routeId: 'duplicate_self_check' },
        });
        suggestedPrompts.push('Open Duplicate Self-Check', 'How does Form 8 resolve duplicates?');
        break;
      }

      case 'deceased_person_reporting_guidance': {
        displayText = `Reporting a deceased elector entry helps maintain accurate electoral rolls:\n\n- **Legal Procedure:** Requires statutory **Form 7** submitted with an official death certificate or verified by immediate family members.\n- **Safeguards:** Names are **never** deleted on the basis of a third-party allegation alone. The Electoral Registration Officer (ERO) must issue a statutory notice and verify the facts through the local Booth Level Officer (BLO).\n- **Anti-Weaponization:** VoteRule strictly limits deceased reports to prevent misuse.`;
        spokenText = `To report a deceased elector, statutory Form 7 and official verification are required. Election officials verify all reports before making decisions.`;
        actions.push({
          id: 'act-nav-dec',
          type: 'navigate_to',
          label: 'Open Deceased Reporting Form',
          payload: { routeId: 'deceased_person_report' },
        });
        suggestedPrompts.push('Open Deceased Reporting Form', 'What documents are required for Form 7?');
        break;
      }

      case 'website_navigation': {
        const routeId = classification.extractedEntities?.routeId || 'home';
        displayText = `Navigating you to **${routeId.replace(/_/g, ' ').toUpperCase()}** now.`;
        spokenText = `Navigating to ${routeId.replace(/_/g, ' ')}.`;
        actions.push({
          id: `act-nav-${routeId}`,
          type: 'navigate_to',
          label: `Navigate to ${routeId}`,
          payload: { routeId },
        });
        break;
      }

      case 'voice_control_command': {
        const cmd = classification.extractedEntities?.actionCommand || 'stop';
        displayText = `Voice command processed: **${cmd}**.`;
        spokenText = cmd.includes('stop') || cmd.includes('ruk') ? '' : `Command acknowledged: ${cmd}.`;
        actions.push({
          id: 'act-voice-cmd',
          type: 'voice_command',
          label: cmd,
          payload: { command: cmd },
        });
        break;
      }

      case 'out_of_scope_or_unsupported': {
        displayText = `I am **VoteRule AI**, dedicated specifically to helping you understand Indian voter registration, electoral roll verification, and official statutory election procedures.\n\nI do not provide political opinions, party evaluations, or unrelated assistance. How may I assist you with your voter details or official ECI forms today?`;
        spokenText = `I am VoteRule AI, focused on voter registration and election procedures. How can I help you with your voter details today?`;
        suggestedPrompts.push('Check my voter registration', 'Explain Form 6', 'How to resolve missing name');
        break;
      }

      default: {
        // Fallback: Use best retrieved knowledge
        if (retrievedChunks.length > 0) {
          const topChunk = retrievedChunks[0]!;
          displayText = `Based on official records from **${topChunk.officialSource}**:\n\n${topChunk.text}\n\n*Reference: [${topChunk.title}](${topChunk.sourceUrl}) (Verified: ${topChunk.lastVerifiedDate})*`;
          spokenText = topChunk.text.split('.')[0] + '.';
        } else {
          displayText = `I am here to assist you with Indian voter registration, status checks, and official election forms. Please let me know what specific voter procedure you would like help with.`;
          spokenText = `I can help with Indian voter registration and election procedures. How can I assist you?`;
        }
        suggestedPrompts.push('Check voter status', 'Missing name assistance', 'Voter eligibility');
      }
    }

    return {
      displayText,
      spokenText,
      intent: classification.intent,
      citations,
      actions,
      suggestedPrompts,
    };
  }
}

