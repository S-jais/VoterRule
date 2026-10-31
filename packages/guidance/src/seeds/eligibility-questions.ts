export interface EligibilityQuestion {
  id: string;
  order: number;
  questionEn: string;
  questionHi: string;
  helpTextEn: string;
  helpTextHi: string;
  options: {
    value: string;
    labelEn: string;
    labelHi: string;
    qualifies: boolean | 'UNCERTAIN';
    guidanceEn?: string;
    guidanceHi?: string;
  }[];
}

export const ELIGIBILITY_QUESTIONS: EligibilityQuestion[] = [
  {
    id: 'citizenship',
    order: 1,
    questionEn: 'Are you a citizen of India?',
    questionHi: 'क्या आप भारत के नागरिक हैं?',
    helpTextEn: 'Under Article 326 of the Constitution of India and Section 16 of the RPA 1950, only Indian citizens are eligible for enrollment on the electoral roll.',
    helpTextHi: 'भारतीय संविधान के अनुच्छेद 326 और आरपीए 1950 की धारा 16 के तहत केवल भारतीय नागरिक ही मतदाता सूची में नाम दर्ज कराने के पात्र हैं।',
    options: [
      {
        value: 'YES_RESIDENT',
        labelEn: 'Yes, and I reside in India',
        labelHi: 'हाँ, और मैं भारत में रहता हूँ',
        qualifies: true,
      },
      {
        value: 'YES_OVERSEAS',
        labelEn: 'Yes, but I reside abroad (have not taken citizenship of another country)',
        labelHi: 'हाँ, लेकिन मैं विदेश में रहता हूँ (किसी अन्य देश की नागरिकता नहीं ली है)',
        qualifies: true,
        guidanceEn: 'You are eligible to register as an Overseas Elector using Form 6A.',
        guidanceHi: 'आप प्रारूप 6क का उपयोग करके प्रवासी मतदाता के रूप में पंजीकरण कराने के पात्र हैं।',
      },
      {
        value: 'NO',
        labelEn: 'No, I hold foreign citizenship',
        labelHi: 'नहीं, मेरे पास विदेशी नागरिकता है',
        qualifies: false,
        guidanceEn: 'Only Indian citizens are eligible for inclusion in the Indian electoral roll.',
        guidanceHi: 'केवल भारतीय नागरिक ही भारतीय मतदाता सूची में शामिल होने के पात्र हैं।',
      },
    ],
  },
  {
    id: 'age_qualifying',
    order: 2,
    questionEn: 'What is your age or birth date relative to the qualifying dates?',
    questionHi: 'पात्रता तिथियों के संदर्भ में आपकी आयु क्या है?',
    helpTextEn: 'The four statutory qualifying dates each year are: 1st January, 1st April, 1st July, and 1st October.',
    helpTextHi: 'प्रत्येक वर्ष की चार वैधानिक पात्रता तिथियां हैं: 1 जनवरी, 1 अप्रैल, 1 जुलाई और 1 अक्टूबर।',
    options: [
      {
        value: 'ALREADY_18_PLUS',
        labelEn: 'I am already 18 years or older',
        labelHi: 'मेरी आयु 18 वर्ष या उससे अधिक हो चुकी है',
        qualifies: true,
      },
      {
        value: 'TURNING_18_THIS_YEAR',
        labelEn: 'I am 17+ and will turn 18 by a qualifying date this year',
        labelHi: 'मेरी आयु 17 वर्ष से अधिक है और इस वर्ष किसी पात्रता तिथि तक 18 वर्ष हो जाएगी',
        qualifies: true,
        guidanceEn: 'You can submit an advance application using Form 6, which will be processed upon reaching 18.',
        guidanceHi: 'आप प्रारूप 6 में अग्रिम आवेदन कर सकते हैं, जिसे 18 वर्ष पूर्ण होने पर संसाधित किया जाएगा।',
      },
      {
        value: 'UNDER_17',
        labelEn: 'I am under 17 years old',
        labelHi: 'मेरी आयु अभी 17 वर्ष से कम है',
        qualifies: false,
        guidanceEn: 'You may apply in advance once you reach 17 years of age.',
        guidanceHi: '17 वर्ष की आयु पूरी होने पर आप अग्रिम आवेदन कर सकेंगे।',
      },
    ],
  },
  {
    id: 'ordinary_residence',
    order: 3,
    questionEn: 'Are you ordinarily resident in the constituency where you seek enrollment?',
    questionHi: 'क्या आप उस निर्वाचन क्षेत्र में सामान्य रूप से निवास करते हैं जहाँ आप पंजीकरण चाहते हैं?',
    helpTextEn: 'Section 20 of RPA 1950 defines ordinary residence based on where a person normally resides. Temporary absence does not disqualify.',
    helpTextHi: 'आरपीए 1950 की धारा 20 सामान्य निवास को परिभाषित करती है। अस्थायी अनुपस्थिति पात्रता को समाप्त नहीं करती।',
    options: [
      {
        value: 'RESIDENT_STATED_ADDRESS',
        labelEn: 'Yes, I ordinarily reside at this location',
        labelHi: 'हाँ, मैं सामान्यतः इसी पते पर निवास करता हूँ',
        qualifies: true,
      },
      {
        value: 'RECENTLY_SHIFTED',
        labelEn: 'I recently shifted from another location in India',
        labelHi: 'मैं हाल ही में भारत के किसी अन्य स्थान से यहाँ आया हूँ',
        qualifies: true,
        guidanceEn: 'If shifting residence, submit Form 8 for shifting to transfer your registration.',
        guidanceHi: 'निवास परिवर्तन की स्थिति में अपने पंजीकरण को स्थानांतरित करने के लिए प्रारूप 8 भरें।',
      },
      {
        value: 'STUDENT_OR_HOSTEL',
        labelEn: 'I am a student living in a hostel / temporary stay',
        labelHi: 'मैं छात्रावास या अस्थायी आवास में रहने वाला छात्र हूँ',
        qualifies: 'UNCERTAIN',
        guidanceEn: 'Students have the option to register either at their home address or at their hostel/college address with a certificate from the Head of the Institution. The competent Electoral Registration Officer makes the final determination.',
        guidanceHi: 'छात्रों के पास संस्थान प्रमुख के प्रमाण पत्र के साथ अपने पैतृक पते या छात्रावास पते पर पंजीकरण का विकल्प होता है। अंतिम निर्णय सक्षम ईआरओ द्वारा लिया जाता है।',
      },
    ],
  },
  {
    id: 'disqualifications',
    order: 4,
    questionEn: 'Are you subject to any statutory disqualification under Section 16 of RPA 1950?',
    questionHi: 'क्या आप आरपीए 1950 की धारा 16 के तहत किसी वैधानिक अयोग्यता के अधीन हैं?',
    helpTextEn: 'Disqualifications include being of unsound mind as declared by a competent court, or disqualified from voting under election offence laws.',
    helpTextHi: 'अयोग्यताओं में सक्षम न्यायालय द्वारा विकृतचित्त घोषित होना या चुनाव अपराध कानूनों के तहत मतदान से अयोग्य घोषित होना शामिल है।',
    options: [
      {
        value: 'NO_DISQUALIFICATION',
        labelEn: 'No, none of these apply to me',
        labelHi: 'नहीं, इनमें से कोई भी मुझ पर लागू नहीं होता',
        qualifies: true,
      },
      {
        value: 'SUBJECT_TO_ORDER',
        labelEn: 'Yes, I am subject to a court declaration or disqualification order',
        labelHi: 'हाँ, मेरे विरुद्ध न्यायालय का कोई आदेश या अयोग्यता लागू है',
        qualifies: false,
        guidanceEn: 'Persons under statutory disqualification are not eligible for enrollment while the order is in effect.',
        guidanceHi: 'आदेश प्रभावी रहने तक वैधानिक रूप से अयोग्य व्यक्ति पंजीकरण के पात्र नहीं हैं।',
      },
    ],
  },
];
