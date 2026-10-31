import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { t } from '@voterrule/i18n';

export interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { locale, liteMode } = useApp();
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const isHindi = locale === 'hi';

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toastMsg]);

  // Tab highlight style calculation
  const hlLeft = activeTab === 0 ? '16.66%' : activeTab === 1 ? '50%' : '83.33%';

  const heroHeadlines: Record<string, string> = {
    en: 'Is your name on the electoral roll?',
    hi: 'क्या मतदाता सूची में आपका नाम है?',
    bn: 'ভোটার তালিকায় কি আপনার নাম আছে?',
    mr: 'मतदार यादीत आपले नाव आहे का?',
    ta: 'வாக்காளர் பட்டியலில் உங்கள் பெயர் உள்ளதா?',
    te: 'ఓటర్ల జాబితాలో మీ పేరు ఉందా?',
    gu: 'શું મતદારયાદીમાં તમારું નામ છે?',
    kn: 'ಮತದಾರರ ಪಟ್ಟಿಯಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರು ಇದೆಯೇ?',
    ml: 'വോട്ടർ പട്ടികയിൽ നിങ്ങളുടെ പേരുണ്ടോ?',
    pa: 'ਕੀ ਵੋਟਰ ਸੂਚੀ ਵਿੱਚ ਤੁਹਾਡਾ ਨਾਮ ਹੈ?',
    or: 'ଭୋଟର ତାଲିକାରେ ଆପଣଙ୍କ ନାମ ଅଛି କି?',
    as: 'ভোটাৰ তালিকাত আপোনাৰ নাম আছে নে?',
    kok: 'मतदार वळेरेंत तुमचें नांव आसा काय?',
    ur: 'کیا ووٹر لسٹ میں آپ کا نام ہے؟',
  };

  const heroSubtitles: Record<string, string> = {
    en: 'VoterRule helps you check your voter details, find out what may be wrong, and prepare the right official application. Every Eligible Voter. Every Right. Every Voice.',
    hi: 'VoterRule आपको अपने मतदाता विवरण जाँचने, संभावित गड़बड़ी समझने और सही सरकारी आवेदन तैयार करने में मदद करता है। Every Eligible Voter. Every Right. Every Voice.',
    bn: 'VoterRule আপনাকে ভোটার বিবরণ যাচাই করতে, সম্ভাব্য সমস্যা বুঝতে এবং সঠিক সরকারি আবেদন প্রস্তুত করতে সহায়তা করে। আমরা পথ দেখাই; সিদ্ধান্ত নেন নির্বাচন কর্তৃপক্ষ।',
    mr: 'VoterRule आपल्याला मतदार तपशील तपासण्यास, त्रुटी समजून घेण्यास आणि योग्य अधिकृत अर्ज तयार करण्यास मदत करतो. आम्ही मार्गदर्शन करतो; निर्णय निवडणूक अधिकारी घेतात.',
    ta: 'VoterRule உங்கள் விவரங்களைச் சரிபார்க்கவும், சிக்கல்களைப் புரிந்து கொள்ளவும், சரியான விண்ணப்பங்களைத் தயாரிக்கவும் உதவுகிறது. நாங்கள் வழிகாட்டுகிறோம்; தேர்தல் அதிகாரிகள் முடிவெடுக்கிறார்கள்.',
    te: 'VoterRule మీ వివరాలను సరిచూసుకోవడానికి, లోపాలను గుర్తించడానికి మరియు సరైన దరఖాస్తును సిద్ధం చేయడానికి సహాయపడుతుంది. మేము మార్గదర్శకత్వం చేస్తాము; అధికారులు నిర్ణయిస్తారు.',
    gu: 'VoterRule તમને મતદાર વિગતો તપાસવા, સમસ્યાઓ સમજવા અને સાચું અરજી ફોર્મ તૈયાર કરવામાં મદદ કરે છે. અમે માર્ગદર્શન આપીએ છીએ; નિર્ણય ચૂંટણી અધિકારીઓ લે છે.',
    kn: 'VoterRule ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಲು, ತಪ್ಪುಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಮತ್ತು ಸರಿಯಾದ ಅರ್ಜಿ ಸಿದ್ಧಪಡಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ. ನಾವು ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತೇವೆ; ಚುನಾವಣಾ ಅಧಿಕಾರಿಗಳು ನಿರ್ಧರಿಸುತ್ತಾರೆ.',
    ml: 'വോട്ടർ വിവരങ്ങൾ പരിശോധിക്കാനും പോരായ്മകൾ മനസ്സിലാക്കാനും ശരിയായ അപേക്ഷ തയ്യാറാക്കാനും VoterRule സഹായിക്കുന്നു. ഞങ്ങൾ വഴികാട്ടുന്നു; അധികാരികൾ തീരുമാനിക്കുന്നു.',
    pa: 'VoterRule ਤੁਹਾਨੂੰ ਵੋਟਰ ਵੇਰਵੇ ਜਾਂਚਣ, ਸਮੱਸਿਆਵਾਂ ਸਮਝਣ ਅਤੇ ਸਹੀ ਅਰਜ਼ੀ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ। ਅਸੀਂ ਮਾਰਗਦਰਸ਼ਨ ਕਰਦੇ ਹਾਂ; ਫੈਸਲਾ ਚੋਣ ਅਧਿਕਾਰੀ ਕਰਦੇ ਹਨ।',
    or: 'VoterRule ଆପଣଙ୍କ ବିବରଣୀ ଯାଞ୍ଚ କରିବା, ସମସ୍ୟା ବୁଝିବା ଓ ସଠିକ୍ ଆବେଦନ ପ୍ରସ୍ତୁତ କରିବାରେ ସାହାଯ୍ୟ କରେ। ଆମେ ମାର୍ଗଦର୍ଶନ କରୁ; ନିଷ୍ପତ୍ତି ନିର୍ବାଚନ ଅଧିକାରୀ ନିଅନ୍ତି।',
    as: 'VoterRule-এ আপোনাক ভোটাৰ বিৱৰণ পৰীক্ষা কৰিবলৈ, সমস্যা বুজিবলৈ আৰু সঠিক আবেদন প্ৰস্তুত কৰাত সহায় কৰে। আমি পথ দেখুৱাওঁ; সিদ্ধান্ত নিৰ্বাচন কৰ্তৃপক্ষই লয়।',
    kok: 'VoterRule तुमकां मतदार तपशील तपासपाक, उणीवो समजूंक आनी योग्य अर्ज तयार करपाक मदत करता. आमी मार्गदर्शन करतात; निर्णय निवडणूक अधिकारी घेतात.',
    ur: 'VoterRule آپ کو ووٹر تفصیلات چیک کرنے، مسائل کو سمجھنے اور صحیح سرکاری درخواست تیار کرنے میں مدد کرتا ہے۔ ہم رہنمائی کرتے ہیں؛ فیصلہ الیکشن حکام کرتے ہیں۔',
  };

  const noAadhaarText = locale === 'hi' ? 'आधार नंबर की ज़रूरत नहीं' : locale === 'bn' ? 'আধার নম্বরের প্রয়োজন নেই' : locale === 'ta' ? 'ஆதார் எண் தேவையில்லை' : locale === 'te' ? 'ఆధార్ నంబర్ అవసరం లేదు' : locale === 'mr' ? 'आधार क्रमांकाची गरज नाही' : locale === 'gu' ? 'આધાર નંબરની જરૂર નથી' : locale === 'kn' ? 'ಆಧಾರ್ ಸಂಖ್ಯೆ ಅಗತ್ಯವಿಲ್ಲ' : locale === 'ml' ? 'ആധാർ നമ്പർ ആവശ്യമില്ല' : locale === 'pa' ? 'ਆਧਾਰ ਨੰਬਰ ਦੀ ਲੋੜ ਨਹੀਂ' : locale === 'or' ? 'ଆଧାର ନମ୍ବର ଆବଶ୍ୟକ ନାହିଁ' : locale === 'as' ? 'আধাৰ নম্বৰৰ প্ৰয়োজন নাই' : locale === 'kok' ? 'आधार नंबर गरजेचो ना' : locale === 'ur' ? 'آدھار نمبر کی ضرورت نہیں' : 'No Aadhaar number needed';
  const noSelfieText = locale === 'hi' ? 'कोई सेल्फ़ी या बायोमेट्रिक जाँच नहीं' : locale === 'bn' ? 'সেলফি বা বায়োমেট্রিক পরীক্ষার প্রয়োজন নেই' : locale === 'ta' ? 'செல்ஃபி அல்லது பயோமெட்ரிக் சரிபார்ப்பு இல்லை' : locale === 'te' ? 'సెల్ఫీ లేదా బయోమెట్రిక్ తనిఖీ లేదు' : locale === 'mr' ? 'सेल्फी किंवा बायोमेट्रिक तपासणी नाही' : locale === 'gu' ? 'સેલ્ફી કે બાયોમેટ્રિક ચકાસણી નથી' : locale === 'kn' ? 'ಸೆಲ್ಫಿ ಅಥವಾ ಬಯೋಮೆಟ್ರಿಕ್ ಪರಿಶೀಲನೆ ಇಲ್ಲ' : locale === 'ml' ? 'സെൽഫിയോ ബയോമെട്രിക് പരിശോധനയോ ഇല്ല' : locale === 'pa' ? 'ਕੋਈ ਸੈਲਫੀ ਜਾਂ ਬਾਇਓਮੈਟ੍ਰਿਕ ਜਾਂਚ ਨਹੀਂ' : locale === 'or' ? 'କୌଣସି ସେଲ୍ଫି ବା ବାୟୋମେଟ୍ରିକ୍ ଯାଞ୍ଚ ନାହିଁ' : locale === 'as' ? 'কোনো চেল্ফি বা বায়\'মেট্ৰিক পৰীক্ষা নাই' : locale === 'kok' ? 'कसलीच सेल्फी वा बायोमेट्रिक तपासणी ना' : locale === 'ur' ? 'کوئی سیلفی یا بائیو میٹرک چیک نہیں' : 'No selfie or biometric check';
  const liteModeText = locale === 'hi' ? 'धीमे इंटरनेट के लिए लाइट मोड' : locale === 'bn' ? 'ধীরগতির ইন্টারনেটের জন্য লাইট মোড' : locale === 'ta' ? 'மெதுவான இணையத்திற்கு லைட் பயன்முறை' : locale === 'te' ? 'నెమ్మది ఇంటర్నెట్ కొరకు లైట్ మోడ్' : locale === 'mr' ? 'कमी गतीच्या इंटरनेटसाठी लाइट मोड' : locale === 'gu' ? 'ધીમા ઇન્ટરનેટ માટે લાઇટ મોડ' : locale === 'kn' ? 'ನಿಧಾನಗತಿಯ ಇಂಟರ್ನೆಟ್‌ಗಾಗಿ ಲೈಟ್ ಮೋಡ್' : locale === 'ml' ? 'വേഗത കുറഞ്ഞ ഇന്റർനെറ്റിനായി ലൈറ്റ് മോഡ്' : locale === 'pa' ? 'ਹੌਲੀ ਇੰਟਰਨੈੱਟ ਲਈ ਲਾਈਟ ਮੋਡ' : locale === 'or' ? 'ଧୀମା ଇଣ୍ଟରନେଟ୍ ପାଇଁ ଲାଇଟ୍ ମୋଡ୍' : locale === 'as' ? 'মন্থৰ ইণ্টাৰনেটৰ বাবে লাইট ম\'ড' : locale === 'kok' ? 'संथ इंटरनेट खातीर लाईट मोड' : locale === 'ur' ? 'سست انٹرنیٹ کے لیے لائٹ موڈ' : 'Lite mode for slow connections';

  return (
    <>
      {/* ============================================================
          1. HERO SECTION
          ============================================================ */}
      <section className="hero" id="top">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1>
              {heroHeadlines[locale] || heroHeadlines.en}
            </h1>
            <div className="tri-rule" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <p className="lede">
              {heroSubtitles[locale] || heroSubtitles.en}
            </p>

            <div className="cta-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onNavigate('/app/check')}
              >
                <svg className="icon" aria-hidden="true">
                  <use href="#i-search" />
                </svg>
                <span>{t(locale, 'landing.checkVoterDetailsBtn')}</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onNavigate('/app/missing-name')}
              >
                <span>{t(locale, 'landing.reportMissingNameBtn')}</span>
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => onNavigate('/eligibility-check')}
              >
                <span>{t(locale, 'landing.understandStepsBtn')}</span>
              </button>
            </div>

            <ul className="assure">
              <li>
                <svg className="icon" aria-hidden="true">
                  <use href="#i-check" />
                </svg>
                <span>{noAadhaarText}</span>
              </li>
              <li>
                <svg className="icon" aria-hidden="true">
                  <use href="#i-check" />
                </svg>
                <span>{noSelfieText}</span>
              </li>
              <li>
                <svg className="icon" aria-hidden="true">
                  <use href="#i-check" />
                </svg>
                <span>{liteModeText}</span>
              </li>
            </ul>
          </div>

          <div className="hero-art" id="heroArt" aria-hidden="true">
            <svg
              className={`art ${liteMode ? 'paused' : ''}`}
              id="art"
              viewBox="0 0 760 620"
              preserveAspectRatio="xMidYMid meet"
              focusable="false"
            >
              <defs>
                <linearGradient id="shW" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#fff" stopOpacity="0" />
                  <stop offset=".5" stopColor="#fff" stopOpacity=".85" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="shN" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" style={{ stopColor: 'var(--sheen-n)', stopOpacity: 0 }} />
                  <stop offset=".5" style={{ stopColor: 'var(--sheen-n)' }} />
                  <stop offset="1" style={{ stopColor: 'var(--sheen-n)', stopOpacity: 0 }} />
                </linearGradient>
                <linearGradient id="gF" gradientUnits="userSpaceOnUse" x1="-30" y1="0" x2="748" y2="0">
                  <stop offset="0" stopColor="#fff" stopOpacity="0" />
                  <stop offset=".14" stopColor="#fff" />
                  <stop offset=".9" stopColor="#fff" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <mask id="mFade" maskUnits="userSpaceOnUse" x="-40" y="-10" width="840" height="640">
                  <rect x="-40" y="-10" width="840" height="640" fill="url(#gF)" />
                </mask>
                <clipPath id="cpS">
                  <rect className="cp-rect" x="-40" y="0" width="840" height="620" />
                </clipPath>
                <clipPath id="cpW">
                  <rect className="cp-rect cp-w" x="-40" y="0" width="840" height="620" />
                </clipPath>
                <clipPath id="cpG">
                  <rect className="cp-rect cp-g" x="-40" y="0" width="840" height="620" />
                </clipPath>
                <mask id="mkS" maskUnits="userSpaceOnUse" x="-40" y="0" width="840" height="620">
                  <path className="mk" d="M -30 96 C 120 96 170 276 310 276 L 748 276" />
                </mask>
                <mask id="mkW" maskUnits="userSpaceOnUse" x="-40" y="0" width="840" height="620">
                  <path className="mk" d="M -30 420 C 130 420 170 310 310 310 L 748 310" />
                </mask>
                <mask id="mkG" maskUnits="userSpaceOnUse" x="-40" y="0" width="840" height="620">
                  <path className="mk" d="M -30 566 C 130 566 170 344 310 344 L 748 344" />
                </mask>
              </defs>

              <g mask="url(#mFade)">
                {/* geometric channel: rails, ticks, halos */}
                <g className="fade-a">
                  <path className="rail" d="M -30 40 H 120 L 236 234 H 424" />
                  <path className="rail" d="M -30 600 H 120 L 236 386 H 424" />
                  <path className="tick" d="M 60 62 V 578 M 120 62 V 578 M 180 150 V 490" />
                  <circle className="halo" cx="520" cy="310" r="152" />
                  <circle className="halo" cx="520" cy="310" r="190" />
                </g>

                {/* ribbons */}
                <g clipPath="url(#cpS)">
                  <path className="rb rb-s" d="M -30 96 C 120 96 170 276 310 276 L 748 276" />
                  <g mask="url(#mkS)">
                    <rect className="sheen sh1" x="-330" y="0" width="260" height="620" />
                  </g>
                </g>
                <g clipPath="url(#cpW)">
                  <path className="rb-e" d="M -30 420 C 130 420 170 310 310 310 L 748 310" />
                  <path className="rb rb-w" d="M -30 420 C 130 420 170 310 310 310 L 748 310" />
                  <g mask="url(#mkW)">
                    <rect className="sheen sw sh2" x="-330" y="0" width="260" height="620" />
                  </g>
                </g>
                <g clipPath="url(#cpG)">
                  <path className="rb rb-g" d="M -30 566 C 130 566 170 344 310 344 L 748 344" />
                  <g mask="url(#mkG)">
                    <rect className="sheen sh3" x="-330" y="0" width="260" height="620" />
                  </g>
                </g>
              </g>

              {/* alignment bracket and nodes */}
              <g className="fade-c">
                <path className="bracket" d="M 310 258 V 362 M 303 258 H 317 M 303 362 H 317" />
                <circle className="nd-s" cx="310" cy="276" r="5.5" />
                <circle className="nd-w" cx="310" cy="310" r="5.5" />
                <circle className="nd-g" cx="310" cy="344" r="5.5" />
              </g>

              {/* Ashoka Chakra-inspired ring: 24 spokes */}
              <g transform="translate(520 310)">
                <g className="fade-b">
                  <circle className="disc" r="122" />
                  <circle className="rim2" r="104" />
                  <circle className="dot" cx="14.75" cy="-112.03" r="2.4" />
                  <circle className="dot" cx="43.24" cy="-104.40" r="2.4" />
                  <circle className="dot" cx="68.79" cy="-89.65" r="2.4" />
                  <circle className="dot" cx="89.65" cy="-68.79" r="2.4" />
                  <circle className="dot" cx="104.40" cy="-43.24" r="2.4" />
                  <circle className="dot" cx="112.03" cy="-14.75" r="2.4" />
                  <circle className="dot" cx="112.03" cy="14.75" r="2.4" />
                  <circle className="dot" cx="104.40" cy="43.24" r="2.4" />
                  <circle className="dot" cx="89.65" cy="68.79" r="2.4" />
                  <circle className="dot" cx="68.79" cy="89.65" r="2.4" />
                  <circle className="dot" cx="43.24" cy="104.40" r="2.4" />
                  <circle className="dot" cx="14.75" cy="112.03" r="2.4" />
                  <circle className="dot" cx="-14.75" cy="112.03" r="2.4" />
                  <circle className="dot" cx="-43.24" cy="104.40" r="2.4" />
                  <circle className="dot" cx="-68.79" cy="89.65" r="2.4" />
                  <circle className="dot" cx="-89.65" cy="68.79" r="2.4" />
                  <circle className="dot" cx="-104.40" cy="43.24" r="2.4" />
                  <circle className="dot" cx="-112.03" cy="14.75" r="2.4" />
                  <circle className="dot" cx="-112.03" cy="-14.75" r="2.4" />
                  <circle className="dot" cx="-104.40" cy="-43.24" r="2.4" />
                  <circle className="dot" cx="-89.65" cy="-68.79" r="2.4" />
                  <circle className="dot" cx="-68.79" cy="-89.65" r="2.4" />
                  <circle className="dot" cx="-43.24" cy="-104.40" r="2.4" />
                  <circle className="dot" cx="-14.75" cy="-112.03" r="2.4" />
                </g>
                <line className="spoke" style={{ ['--i' as any]: 0 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(0)" />
                <line className="spoke" style={{ ['--i' as any]: 1 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(15)" />
                <line className="spoke" style={{ ['--i' as any]: 2 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(30)" />
                <line className="spoke" style={{ ['--i' as any]: 3 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(45)" />
                <line className="spoke" style={{ ['--i' as any]: 4 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(60)" />
                <line className="spoke" style={{ ['--i' as any]: 5 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(75)" />
                <line className="spoke" style={{ ['--i' as any]: 6 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(90)" />
                <line className="spoke" style={{ ['--i' as any]: 7 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(105)" />
                <line className="spoke" style={{ ['--i' as any]: 8 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(120)" />
                <line className="spoke" style={{ ['--i' as any]: 9 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(135)" />
                <line className="spoke" style={{ ['--i' as any]: 10 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(150)" />
                <line className="spoke" style={{ ['--i' as any]: 11 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(165)" />
                <line className="spoke" style={{ ['--i' as any]: 12 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(180)" />
                <line className="spoke" style={{ ['--i' as any]: 13 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(195)" />
                <line className="spoke" style={{ ['--i' as any]: 14 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(210)" />
                <line className="spoke" style={{ ['--i' as any]: 15 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(225)" />
                <line className="spoke" style={{ ['--i' as any]: 16 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(240)" />
                <line className="spoke" style={{ ['--i' as any]: 17 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(255)" />
                <line className="spoke" style={{ ['--i' as any]: 18 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(270)" />
                <line className="spoke" style={{ ['--i' as any]: 19 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(285)" />
                <line className="spoke" style={{ ['--i' as any]: 20 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(300)" />
                <line className="spoke" style={{ ['--i' as any]: 21 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(315)" />
                <line className="spoke" style={{ ['--i' as any]: 22 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(330)" />
                <line className="spoke" style={{ ['--i' as any]: 23 }} x1="0" y1="-22" x2="0" y2="-100" transform="rotate(345)" />
                <g className="fade-b">
                  <circle className="hub" r="14" />
                  <circle className="hub2" r="6" />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. INDEPENDENT VS OFFICIAL NOTICE
          ============================================================ */}
      <section className="sec" id="notice" aria-labelledby="notice-h">
        <div className="wrap">
          <h2 id="notice-h">
            {isHindi
              ? 'यह पोर्टल मदद करता है। निर्णय निर्वाचन अधिकारी लेते हैं।'
              : 'This portal helps. Election authorities decide.'}
          </h2>
          <div className="notice-card">
            <div className="notice-cols">
              <div className="notice-col you">
                <h3>
                  <span>{isHindi ? 'यह पोर्टल' : 'This portal'}</span>
                  <span className="who">{isHindi ? 'स्वतंत्र' : 'Independent'}</span>
                </h3>
                <ul>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                    <span>{isHindi ? 'आपको आधिकारिक मतदाता खोज तक पहुँचाता है' : 'Guides you to the official voter search'}</span>
                  </li>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                    <span>{isHindi ? 'बताता है कि आपकी स्थिति में कौन-सा फ़ॉर्म सही है' : 'Explains which form fits your situation'}</span>
                  </li>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                    <span>{isHindi ? 'आपके विवरण और दस्तावेज़ों की सूची तैयार करता है' : 'Prepares your details and document checklist'}</span>
                  </li>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                    <span>{isHindi ? 'आपके सहायता मामले को यहाँ ट्रैक करता है' : 'Tracks your support case here'}</span>
                  </li>
                </ul>
              </div>
              <div className="seam" aria-hidden="true">
                <div className="bridge">
                  <svg>
                    <use href="#mark" />
                  </svg>
                </div>
              </div>
              <div className="notice-col official">
                <h3>
                  <span>{isHindi ? 'निर्वाचन अधिकारी' : 'Election authorities'}</span>
                  <span className="who">{isHindi ? 'आधिकारिक' : 'Official'}</span>
                </h3>
                <ul>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-landmark" />
                    </svg>
                    <span>{isHindi ? 'आवेदन स्वीकार या अस्वीकार करते हैं' : 'Accept or reject applications'}</span>
                  </li>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-landmark" />
                    </svg>
                    <span>{isHindi ? 'सूची में नाम जोड़ते, सुधारते या हटाते हैं' : 'Add, correct or delete roll entries'}</span>
                  </li>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-landmark" />
                    </svg>
                    <span>{isHindi ? 'आधिकारिक खोज और फ़ॉर्म चलाते हैं' : 'Run the official search and forms'}</span>
                  </li>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-landmark" />
                    </svg>
                    <span>{isHindi ? 'मतदाता सूची प्रकाशित करते हैं' : 'Publish the electoral roll'}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="notice-foot">
              <strong>
                {isHindi
                  ? 'इस पोर्टल पर फ़ॉर्म भरने से आपका नाम मतदाता सूची में नहीं जुड़ता।'
                  : 'Filling in a form on this portal does not add you to the electoral roll.'}
              </strong>
              <a
                className="btn btn-secondary btn-sm"
                href="https://electoralsearch.eci.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{isHindi ? 'आधिकारिक मतदाता खोज खोलें' : 'Open the official voter search'}</span>
                <svg className="icon" aria-hidden="true">
                  <use href="#i-ext" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          3. SERVICES GRID
          ============================================================ */}
      <section className="sec" id="services" aria-labelledby="sv-h">
        <div className="wrap">
          <h2 id="sv-h">{isHindi ? 'आप यहाँ क्या कर सकते हैं' : 'What you can do here'}</h2>
          <p className="sub">
            {isHindi
              ? 'हर सेवा एक स्पष्ट अगले कदम पर खत्म होती है, अनुमान पर नहीं।'
              : 'Each service ends with a clear next step, never with a guess.'}
          </p>
          <div className="svc-grid">
            {/* Service 1 (Large) */}
            <button
              type="button"
              className="svc lg text-left cursor-pointer border-0 p-0"
              onClick={() => onNavigate('/app/check')}
            >
              <span className="svc-ico">
                <svg className="icon" aria-hidden="true">
                  <use href="#i-search" />
                </svg>
              </span>
              <h3>{isHindi ? 'पंजीकरण जाँचें' : 'Check Registration'}</h3>
              <p>
                {isHindi
                  ? 'आधिकारिक मतदाता सूची में खोजें, फिर परिणाम और तारीख़ दर्ज करें। आधिकारिक स्रोत की पुष्टि तक आपका रिकॉर्ड ‘स्वयं-रिपोर्ट’ के रूप में चिह्नित रहता है।'
                  : 'Search the official voter list, then record the result and the date. Your record is marked as self-reported until an official source confirms it.'}
              </p>
              <div
                className="chips"
                aria-label={isHindi ? 'दर्ज किए जा सकने वाले परिणाम' : 'Results you can record'}
              >
                <span className="chip">{isHindi ? 'मिला' : 'Present'}</span>
                <span className="chip">{isHindi ? 'नहीं मिला' : 'Not found'}</span>
                <span className="chip">{isHindi ? 'विवरण अलग' : 'Details differ'}</span>
                <span className="chip">{isHindi ? 'खोज नहीं हो सकी' : 'Search failed'}</span>
                <span className="chip">{isHindi ? 'और जाँच चाहिए' : 'Needs checking'}</span>
              </div>
              <span className="svc-act">
                <span>{isHindi ? 'शुरू करें' : 'Start'}</span>
                <svg className="icon" aria-hidden="true">
                  <use href="#i-arrow" />
                </svg>
              </span>
            </button>

            {/* Service 2 (Large) */}
            <button
              type="button"
              className="svc lg text-left cursor-pointer border-0 p-0"
              onClick={() => onNavigate('/app/missing-name')}
            >
              <span className="svc-ico">
                <svg className="icon" aria-hidden="true">
                  <use href="#i-user" />
                </svg>
              </span>
              <h3>{isHindi ? 'छूटा हुआ नाम बताएँ' : 'Report Missing Name'}</h3>
              <p>
                {isHindi
                  ? 'जब आपको लगे कि आप पात्र हैं पर सूची में नाम नहीं मिल रहा, तब चरण-दर-चरण मार्गदर्शन। अंत में सही फ़ॉर्म, दस्तावेज़ों की सूची और छापने योग्य शीट मिलती है।'
                  : 'A step-by-step guide for when you think you are eligible but cannot find your name. It ends with the right form, a document checklist and a printable sheet.'}
              </p>
              <div
                className="chips"
                aria-label={isHindi ? 'आपको क्या मिलता है' : 'What you get'}
              >
                <span className="chip">{isHindi ? 'दस्तावेज़ों की सूची' : 'Document checklist'}</span>
                <span className="chip">{isHindi ? 'छापने योग्य शीट' : 'Printable sheet'}</span>
                <span className="chip">{isHindi ? 'पोर्टल संदर्भ' : 'Portal reference'}</span>
              </div>
              <span className="svc-act">
                <span>{isHindi ? 'शुरू करें' : 'Start'}</span>
                <svg className="icon" aria-hidden="true">
                  <use href="#i-arrow" />
                </svg>
              </span>
            </button>

            {/* Service 3 */}
            <button
              type="button"
              className="svc text-left cursor-pointer border-0 p-0"
              onClick={() => onNavigate('/app/duplicate-self-check')}
            >
              <span className="svc-ico">
                <svg className="icon" aria-hidden="true">
                  <use href="#i-copy" />
                </svg>
              </span>
              <h3>{isHindi ? 'संभावित दोहरी प्रविष्टि जाँचें' : 'Check Possible Duplicate Registration'}</h3>
              <p>
                {isHindi
                  ? 'लगता है आप दो जगह पंजीकृत हैं? अपनी स्थिति जाँचें और सही सुधार का रास्ता जानें।'
                  : 'Think you are registered in two places? Check your own situation and get the right correction route.'}
              </p>
              <span className="svc-act">
                <span>{isHindi ? 'शुरू करें' : 'Start'}</span>
                <svg className="icon" aria-hidden="true">
                  <use href="#i-arrow" />
                </svg>
              </span>
            </button>

            {/* Service 4 */}
            <button
              type="button"
              className="svc text-left cursor-pointer border-0 p-0"
              onClick={() => onNavigate('/app/issues/new')}
            >
              <span className="svc-ico">
                <svg className="icon" aria-hidden="true">
                  <use href="#i-edit" />
                </svg>
              </span>
              <h3>{isHindi ? 'ग़लत विवरण बताएँ' : 'Report Incorrect Details'}</h3>
              <p>
                {isHindi
                  ? 'नाम की वर्तनी, जन्मतिथि, पता या मतदान क्षेत्र में गड़बड़ी।'
                  : 'Wrong spelling, date of birth, address or polling area.'}
              </p>
              <span className="svc-act">
                <span>{isHindi ? 'शुरू करें' : 'Start'}</span>
                <svg className="icon" aria-hidden="true">
                  <use href="#i-arrow" />
                </svg>
              </span>
            </button>

            {/* Service 5 */}
            <button
              type="button"
              className="svc text-left cursor-pointer border-0 p-0"
              onClick={() => onNavigate('/app/report/deceased')}
            >
              <span className="svc-ico">
                <svg className="icon" aria-hidden="true">
                  <use href="#i-file" />
                </svg>
              </span>
              <h3>{isHindi ? 'मृत व्यक्ति की सूचना दें' : 'Report a Deceased Person'}</h3>
              <p>
                {isHindi
                  ? 'समीक्षा के लिए जानकारी दें। किसी रिपोर्ट से किसी का नाम सूची से नहीं हटता।'
                  : 'Share a concern for review. A report never removes anyone from the roll.'}
              </p>
              <span className="svc-act">
                <span>{isHindi ? 'शुरू करें' : 'Start'}</span>
                <svg className="icon" aria-hidden="true">
                  <use href="#i-arrow" />
                </svg>
              </span>
            </button>

            {/* Service 6 */}
            <button
              type="button"
              className="svc text-left cursor-pointer border-0 p-0"
              onClick={() => onNavigate('/app/cases')}
            >
              <span className="svc-ico">
                <svg className="icon" aria-hidden="true">
                  <use href="#i-route" />
                </svg>
              </span>
              <h3>{isHindi ? 'मेरा मामला ट्रैक करें' : 'Track My Case'}</h3>
              <p>
                {isHindi
                  ? 'अपना पोर्टल संदर्भ, ताज़ा कार्रवाई और अगला कदम देखें।'
                  : 'See your portal reference, the latest action and what to do next.'}
              </p>
              <span className="svc-act">
                <span>{isHindi ? 'खोलें' : 'Open'}</span>
                <svg className="icon" aria-hidden="true">
                  <use href="#i-arrow" />
                </svg>
              </span>
            </button>

            {/* Service 7 */}
            <button
              type="button"
              className="svc text-left cursor-pointer border-0 p-0"
              onClick={() => onNavigate('/how-it-works')}
            >
              <span className="svc-ico">
                <svg className="icon" aria-hidden="true">
                  <use href="#i-book" />
                </svg>
              </span>
              <h3>{isHindi ? 'आधिकारिक प्रक्रियाएँ जानें' : 'Learn About Official Procedures'}</h3>
              <p>
                {isHindi
                  ? 'फ़ॉर्म 6, 7 और 8 सरल शब्दों में, स्रोत और जाँच की तारीख़ के साथ।'
                  : 'Forms 6, 7 and 8 in plain words, with the source and the date we checked.'}
              </p>
              <span className="svc-act">
                <span>{isHindi ? 'पढ़ें' : 'Read'}</span>
                <svg className="icon" aria-hidden="true">
                  <use href="#i-arrow" />
                </svg>
              </span>
            </button>

            {/* Service 8 */}
            <button
              type="button"
              className="svc text-left cursor-pointer border-0 p-0"
              onClick={() => onNavigate('/app/assist')}
            >
              <span className="svc-ico">
                <svg className="icon" aria-hidden="true">
                  <use href="#i-help" />
                </svg>
              </span>
              <h3>{isHindi ? 'सहायक सेवा पाएँ' : 'Access Assisted Support'}</h3>
              <p>
                {isHindi
                  ? 'अकेले पोर्टल इस्तेमाल न कर पाएँ तो फ़ोन या किसी भरोसेमंद व्यक्ति की मदद लें।'
                  : 'Get help by phone or from a trusted person if you cannot use the portal alone.'}
              </p>
              <span className="svc-act">
                <span>{isHindi ? 'मदद पाएँ' : 'Get help'}</span>
                <svg className="icon" aria-hidden="true">
                  <use href="#i-arrow" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. HOW IT WORKS: TRICOLOR VERIFICATION PATH
          ============================================================ */}
      <section className="sec" id="how" aria-labelledby="how-h">
        <div className="wrap">
          <h2 id="how-h">
            {isHindi
              ? '“कुछ गड़बड़ लगती है” से सही फ़ॉर्म तक — 3-चरणीय सत्यापन पथ'
              : 'From “something looks wrong” to the right form — The 3-Step Verification Path'}
          </h2>
          <div className="path" id="path">
            <div className="path-track" aria-hidden="true">
              <i />
              <i />
              <i />
              <span
                className="hl"
                id="hl"
                style={{ left: hlLeft, transform: 'translateX(-50%)' }}
              />
            </div>
            <div
              className="path-tabs"
              role="tablist"
              aria-label={isHindi ? 'तीन चरण' : 'Three steps'}
            >
              <button
                className="ptab"
                role="tab"
                id="tab1"
                aria-selected={activeTab === 0}
                aria-controls="panel1"
                tabIndex={activeTab === 0 ? 0 : -1}
                onClick={() => setActiveTab(0)}
              >
                <span className="node">1</span>
                <span>{isHindi ? 'अपनी जानकारी जाँचें' : 'Check your information'}</span>
                {activeTab === 0 && <span className="now">{isHindi ? 'देख रहे हैं' : 'Viewing'}</span>}
              </button>
              <button
                className="ptab"
                role="tab"
                id="tab2"
                aria-selected={activeTab === 1}
                aria-controls="panel2"
                tabIndex={activeTab === 1 ? 0 : -1}
                onClick={() => setActiveTab(1)}
              >
                <span className="node">2</span>
                <span>{isHindi ? 'समस्या समझें' : 'Understand the issue'}</span>
                {activeTab === 1 && <span className="now">{isHindi ? 'देख रहे हैं' : 'Viewing'}</span>}
              </button>
              <button
                className="ptab"
                role="tab"
                id="tab3"
                aria-selected={activeTab === 2}
                aria-controls="panel3"
                tabIndex={activeTab === 2 ? 0 : -1}
                onClick={() => setActiveTab(2)}
              >
                <span className="node">3</span>
                <span>{isHindi ? 'आधिकारिक प्रक्रिया अपनाएँ' : 'Follow the official process'}</span>
                {activeTab === 2 && <span className="now">{isHindi ? 'देख रहे हैं' : 'Viewing'}</span>}
              </button>
            </div>
          </div>

          <div className="panels">
            {activeTab === 0 && (
              <div className="panel" role="tabpanel" id="panel1" aria-labelledby="tab1">
                <p>
                  {isHindi
                    ? 'आधिकारिक सेवा से मतदाता सूची में खोजें, फिर जो मिला उसे यहाँ दर्ज करें।'
                    : 'Search the official voter list through the official service, then record what you found here.'}
                </p>
                <ul>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                    <span>
                      {isHindi
                        ? 'हम आपको आधिकारिक खोज तक ले जाते हैं और तैयार रखने की चीज़ों की सूची देते हैं।'
                        : 'We link you to the official search and list what to keep ready.'}
                    </span>
                  </li>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                    <span>
                      {isHindi
                        ? 'आप एक परिणाम चुनते हैं: मिला, नहीं मिला, विवरण अलग हैं, खोज नहीं हो सकी, या और जाँच चाहिए।'
                        : 'You choose one result: present, not found, details differ, search failed, or needs checking.'}
                    </span>
                  </li>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                    <span>
                      {isHindi
                        ? 'आप जो भी दर्ज करते हैं वह ‘स्वयं-रिपोर्ट’ के रूप में चिह्नित होता है।'
                        : 'Anything you enter is marked as self-reported.'}
                    </span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === 1 && (
              <div className="panel" role="tabpanel" id="panel2" aria-labelledby="tab2">
                <p>
                  {isHindi
                    ? 'कुछ सवाल आपको सही स्थिति में रखते हैं, कारण, स्रोत और हमारी आख़िरी जाँच की तारीख़ के साथ।'
                    : 'A few questions place you in the right case, with reasons, the source and the date we last checked it.'}
                </p>
                <ul>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                    <span>
                      {isHindi
                        ? 'किसी छूटे नाम को कभी ग़लत तरीके से हटाया गया नहीं मान लिया जाता।'
                        : 'A missing name is never assumed to be a wrongful deletion.'}
                    </span>
                  </li>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                    <span>
                      {isHindi
                        ? 'पात्रता के सवाल मार्गदर्शन हैं, कानूनी निर्णय नहीं।'
                        : 'Eligibility questions are guidance, not a legal decision.'}
                    </span>
                  </li>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                    <span>
                      {isHindi
                        ? 'नियम स्पष्ट न हों तो हम आपको आपके निर्वाचक रजिस्ट्रीकरण अधिकारी के पास भेजते हैं।'
                        : 'If the rules are unclear, we send you to your Electoral Registration Officer.'}
                    </span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === 2 && (
              <div className="panel" role="tabpanel" id="panel3" aria-labelledby="tab3">
                <p>
                  {isHindi
                    ? 'आपको सही फ़ॉर्म, दस्तावेज़ों की सूची और फ़ॉर्म के हिसाब से आपके विवरण वाली छापने योग्य शीट मिलती है। आप आधिकारिक माध्यम से जमा करते हैं।'
                    : 'You get the right form, a document checklist and a printable sheet with your details laid out for the form. You submit through the official channel.'}
                </p>
                <ul>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                    <span>
                      {isHindi
                        ? 'नए पंजीकरण के लिए फ़ॉर्म 6, आपत्ति या नाम हटाने के लिए फ़ॉर्म 7, सुधार और निवास बदलने के लिए फ़ॉर्म 8।'
                        : 'Form 6 for new registration, Form 7 for objections or deletion, Form 8 for corrections and change of residence.'}
                    </span>
                  </li>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                    <span>
                      {isHindi
                        ? 'इंटरनेट नहीं है? छापने योग्य मार्गदर्शन लें या वोटर हेल्पलाइन 1950 पर कॉल करें।'
                        : 'No internet? Use the printable guidance or call the Voter Helpline, 1950.'}
                    </span>
                  </li>
                  <li>
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                    <span>
                      {isHindi
                        ? 'आप बताते हैं कि क्या जमा किया। आधिकारिक परिणाम हम केवल प्रमाण के साथ दर्ज करते हैं।'
                        : 'You tell us what you submitted. We record an official outcome only with evidence.'}
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          5. TWO TRACKS (DEMO CASE)
          ============================================================ */}
      <section className="sec" id="tracks" aria-labelledby="tr-h">
        <div className="wrap">
          <h2 id="tr-h">
            <span>
              {isHindi
                ? 'आपके मामले के दो ट्रैक हैं। इन्हें कभी मिलाया नहीं जाता।'
                : 'Your case has two tracks. They are never mixed.'}
            </span>
            <span className="tag-demo">{isHindi ? 'डेमो डेटा' : 'Demo data'}</span>
          </h2>
          <p className="sub">
            {isHindi
              ? 'नीचे काल्पनिक उदाहरण है कि मामला बनाने के बाद आपको क्या दिखेगा।'
              : 'Below is a synthetic example of what you would see after creating a case.'}
          </p>
          <div className="tracks">
            {/* Track 1: Portal Review */}
            <div className="tcard">
              <h3>{isHindi ? 'इस पोर्टल की समीक्षा' : 'This portal’s review'}</h3>
              <p className="hint">{isHindi ? 'पोर्टल टीम क्या कर रही है' : 'What the portal team is doing'}</p>
              <p className="refline">
                <span>{isHindi ? 'पोर्टल संदर्भ (निर्वाचन आयोग की आधिकारिक संख्या नहीं)' : 'Portal reference (not an official ECI number)'}</span>
                <code>MS-DEMO-0000</code>
              </p>
              <div className="ringbox">
                <div
                  className="ring armed"
                  id="ring"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={5}
                  aria-valuenow={2}
                  aria-label={isHindi ? 'पोर्टल प्रगति: 5 में से 2 चरण पूरे' : 'Portal progress: 2 of 5 steps complete'}
                >
                  <svg viewBox="0 0 160 160" aria-hidden="true" focusable="false">
                    <g transform="translate(80 80)">
                      <circle className="rim" r="74" />
                      <circle className="dt" cx="8.68" cy="-65.93" r="1.7" />
                      <circle className="dt" cx="25.45" cy="-61.44" r="1.7" />
                      <circle className="dt" cx="40.48" cy="-52.76" r="1.7" />
                      <circle className="dt" cx="52.76" cy="-40.48" r="1.7" />
                      <circle className="dt" cx="61.44" cy="-25.45" r="1.7" />
                      <circle className="dt" cx="65.93" cy="-8.68" r="1.7" />
                      <circle className="dt" cx="65.93" cy="8.68" r="1.7" />
                      <circle className="dt" cx="61.44" cy="25.45" r="1.7" />
                      <circle className="dt" cx="52.76" cy="40.48" r="1.7" />
                      <circle className="dt" cx="40.48" cy="52.76" r="1.7" />
                      <circle className="dt" cx="25.45" cy="61.44" r="1.7" />
                      <circle className="dt" cx="8.68" cy="65.93" r="1.7" />
                      <circle className="dt" cx="-8.68" cy="65.93" r="1.7" />
                      <circle className="dt" cx="-25.45" cy="61.44" r="1.7" />
                      <circle className="dt" cx="-40.48" cy="52.76" r="1.7" />
                      <circle className="dt" cx="-52.76" cy="40.48" r="1.7" />
                      <circle className="dt" cx="-61.44" cy="25.45" r="1.7" />
                      <circle className="dt" cx="-65.93" cy="8.68" r="1.7" />
                      <circle className="dt" cx="-65.93" cy="-8.68" r="1.7" />
                      <circle className="dt" cx="-61.44" cy="-25.45" r="1.7" />
                      <circle className="dt" cx="-52.76" cy="-40.48" r="1.7" />
                      <circle className="dt" cx="-40.48" cy="-52.76" r="1.7" />
                      <circle className="dt" cx="-25.45" cy="-61.44" r="1.7" />
                      <circle className="dt" cx="-8.68" cy="-65.93" r="1.7" />
                      {/* 2 spokes active (0 and 1) */}
                      <line className="on" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(0)" />
                      <line className="on" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(15)" />
                      {/* Remaining 22 spokes inactive */}
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(30)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(45)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(60)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(75)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(90)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(105)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(120)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(135)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(150)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(165)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(180)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(195)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(210)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(225)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(240)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(255)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(270)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(285)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(300)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(315)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(330)" />
                      <line className="off" x1="0" y1="-37" x2="0" y2="-58" transform="rotate(345)" />
                      <circle className="inner" r="32" />
                    </g>
                  </svg>
                  <span className="count" aria-hidden="true">
                    2/5
                    <small>{isHindi ? 'चरण' : 'steps'}</small>
                  </span>
                </div>
                <p className="ring-note">
                  {isHindi
                    ? 'यह केवल पोर्टल की प्रगति है। यह आधिकारिक निर्णय नहीं है।'
                    : 'This is portal progress only. It is not an official decision.'}
                </p>
              </div>
              <ul className="stages">
                <li className="stage done">
                  <span className="b">
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                  </span>
                  <span className="t">{isHindi ? 'इस पोर्टल पर जमा' : 'Submitted to this portal'}</span>
                  <span className="st">{isHindi ? 'पूरा' : 'Done'}</span>
                </li>
                <li className="stage prog">
                  <span className="b">2</span>
                  <span className="t">{isHindi ? 'प्रारंभिक समीक्षा की प्रतीक्षा' : 'Awaiting initial review'}</span>
                  <span className="st">{isHindi ? 'जारी' : 'In progress'}</span>
                </li>
                <li className="stage">
                  <span className="b">3</span>
                  <span className="t">{isHindi ? 'समीक्षा जारी' : 'Review in progress'}</span>
                  <span className="st">{isHindi ? 'शुरू नहीं हुआ' : 'Not started'}</span>
                </li>
                <li className="stage">
                  <span className="b">4</span>
                  <span className="t">{isHindi ? 'आधिकारिक प्रक्रिया की सलाह' : 'Official route advised'}</span>
                  <span className="st">{isHindi ? 'शुरू नहीं हुआ' : 'Not started'}</span>
                </li>
                <li className="stage">
                  <span className="b">5</span>
                  <span className="t">{isHindi ? 'बंद' : 'Closed'}</span>
                  <span className="st">{isHindi ? 'शुरू नहीं हुआ' : 'Not started'}</span>
                </li>
              </ul>
            </div>

            {/* Track 2: Official Statutory Process */}
            <div className="tcard">
              <h3>{isHindi ? 'आधिकारिक प्रक्रिया' : 'Official statutory process'}</h3>
              <p className="hint">
                {isHindi
                  ? 'केवल आपकी रिपोर्ट या आधिकारिक प्रमाण से दर्ज'
                  : 'Recorded only from your report or official evidence'}
              </p>
              <ul className="stages off-stages">
                <li className="stage done">
                  <span className="b">
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                  </span>
                  <span className="t">{isHindi ? 'खाता बना' : 'Account created'}</span>
                  <span className="st">{isHindi ? 'पूरा' : 'Done'}</span>
                </li>
                <li className="stage done">
                  <span className="b">
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-check" />
                    </svg>
                  </span>
                  <span className="t">{isHindi ? 'जानकारी इस पोर्टल पर जमा' : 'Details submitted to portal'}</span>
                  <span className="st">{isHindi ? 'पूरा' : 'Done'}</span>
                </li>
                <li className="stage prog">
                  <span className="b">3</span>
                  <span className="t">{isHindi ? 'समीक्षा के लिए दस्तावेज़ मिले' : 'Documents received for review'}</span>
                  <span className="st">{isHindi ? 'जारी' : 'In progress'}</span>
                </li>
                <li className="stage">
                  <span className="b">4</span>
                  <span className="t">{isHindi ? 'आवेदन तैयार' : 'Application pack prepared'}</span>
                  <span className="st">{isHindi ? 'शुरू नहीं हुआ' : 'Not started'}</span>
                </li>
                <li className="stage">
                  <span className="b">5</span>
                  <span className="t">
                    {isHindi ? 'आधिकारिक माध्यम से जमा (आपकी रिपोर्ट के अनुसार)' : 'Submitted through official channel (as reported by you)'}
                  </span>
                  <span className="st">{isHindi ? 'शुरू नहीं हुआ' : 'Not started'}</span>
                </li>
                <li className="stage locked">
                  <span className="b">
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-lock" />
                    </svg>
                  </span>
                  <span className="t">{isHindi ? 'आधिकारिक जमा की पुष्टि' : 'Official submission acknowledged'}</span>
                  <span className="st">
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-lock" />
                    </svg>
                    <span>{isHindi ? 'आधिकारिक प्रमाण चाहिए' : 'Needs official evidence'}</span>
                  </span>
                </li>
                <li className="stage locked">
                  <span className="b">
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-lock" />
                    </svg>
                  </span>
                  <span className="t">{isHindi ? 'आधिकारिक निर्णय मिला' : 'Official decision received'}</span>
                  <span className="st">
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-lock" />
                    </svg>
                    <span>{isHindi ? 'आधिकारिक प्रमाण चाहिए' : 'Needs official evidence'}</span>
                  </span>
                </li>
                <li className="stage locked">
                  <span className="b">
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-lock" />
                    </svg>
                  </span>
                  <span className="t">{isHindi ? 'सूची में नाम शामिल होने की स्वतंत्र पुष्टि' : 'Roll inclusion independently confirmed'}</span>
                  <span className="st">
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-lock" />
                    </svg>
                    <span>{isHindi ? 'आधिकारिक प्रमाण चाहिए' : 'Needs official evidence'}</span>
                  </span>
                </li>
              </ul>
              <p className="tnote">
                {isHindi
                  ? 'चरण 6 से 8 केवल आधिकारिक प्रमाण से दर्ज होते हैं। आपके, किसी एल्गोरिद्म के या अकेले पोर्टल के द्वारा नहीं।'
                  : 'Stages 6 to 8 are recorded only from official evidence. Not by you, not by an algorithm, not by the portal alone.'}
              </p>
            </div>
          </div>
          <p className="callout">
            <svg className="icon" aria-hidden="true">
              <use href="#i-info" />
            </svg>
            <span>
              {isHindi
                ? 'इस पोर्टल द्वारा आपके मामले की समीक्षा कोई आधिकारिक निर्णय नहीं है।'
                : 'This portal reviewing your case is not an official decision.'}
            </span>
          </p>
        </div>
      </section>

      {/* ============================================================
          6. PRIVACY SECTION
          ============================================================ */}
      <section className="sec" id="privacy" aria-labelledby="pv-h">
        <div className="wrap priv">
          <div className="priv-l">
            <h2 id="pv-h">{isHindi ? 'आपकी जानकारी कैसे संभाली जाती है' : 'How your information is handled'}</h2>
            <p className="priv-lead">
              {isHindi
                ? 'हम कम से कम जानकारी रखते हैं, और उसे यथासंभव निजी रखते हैं।'
                : 'We hold as little as we can, and we keep it as private as we can.'}
            </p>
            <p className="pnote">
              {isHindi
                ? 'डेमो के लिए उत्पाद-प्रतिबद्धताएँ। लॉन्च से पहले कानूनी और सुरक्षा समीक्षा ज़रूरी है।'
                : 'Product commitments for this demo. Legal and security review is needed before launch.'}
            </p>
          </div>
          <ul className="plist">
            <li>
              <h3>{isHindi ? 'सिर्फ़ ज़रूरी जानकारी' : 'Only what is needed'}</h3>
              <p>
                {isHindi
                  ? 'न आधार नंबर, न सेल्फ़ी, न बायोमेट्रिक। माँगे गए हर विवरण का उद्देश्य बताया जाता है। कोई विज्ञापन या तीसरे पक्ष के ट्रैकर नहीं।'
                  : 'No Aadhaar number, no selfie, no biometrics. Each detail we ask for has a stated purpose. No ads or third-party trackers.'}
              </p>
            </li>
            <li>
              <h3>{isHindi ? 'एन्क्रिप्टेड पहचान-विवरण' : 'Encrypted identifiers'}</h3>
              <p>
                {isHindi
                  ? 'EPIC नंबर और नाम सहेजने से पहले एन्क्रिप्ट किए जाते हैं और स्क्रीन पर डिफ़ॉल्ट रूप से छिपे रहते हैं।'
                  : 'EPIC numbers and names are encrypted before they are stored, and masked on screen by default.'}
              </p>
            </li>
            <li>
              <h3>{isHindi ? 'निजी दस्तावेज़' : 'Private documents'}</h3>
              <p>
                {isHindi
                  ? 'अपलोड स्कैन होते हैं, निजी रूप से रखे जाते हैं और केवल कुछ सेकंड चलने वाले लिंक से खुलते हैं। हर बार देखना दर्ज होता है।'
                  : 'Uploads are scanned, stored privately and opened only through short-lived links. Every view is logged.'}
              </p>
            </li>
            <li>
              <h3>{isHindi ? 'सीमित और दर्ज किया गया स्टाफ़ प्रवेश' : 'Limited, logged staff access'}</h3>
              <p>
                {isHindi
                  ? 'समीक्षक केवल वही देखते हैं जो उनकी भूमिका के लिए ज़रूरी है। संवेदनशील विवरण खोलने के लिए लिखित कारण देना होता है, जो दर्ज होता है।'
                  : 'Reviewers see only what their role needs. Opening sensitive details needs a written reason that is recorded.'}
              </p>
            </li>
            <li>
              <h3>{isHindi ? 'आपके साथ कुछ भी अपने-आप नहीं होता' : 'Nothing happens to you automatically'}</h3>
              <p>
                {isHindi
                  ? 'संभावित मिलान, कोई रिपोर्ट या छूटा हुआ चेक-इन किसी को अस्वीकार नहीं करता, हटाता नहीं और दोषी नहीं ठहराता।'
                  : 'A possible match, a report or a missed check-in never rejects, deletes or accuses anyone.'}
              </p>
            </li>
            <li>
              <h3>{isHindi ? 'नियंत्रण आपके पास' : 'You are in control'}</h3>
              <p>
                {isHindi
                  ? 'अपना डेटा देखें, डाउनलोड करें या सुधारें। कभी भी सहमति वापस लें या खाता बंद करें।'
                  : 'View, download or correct your data. Withdraw consent or close your account at any time.'}
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* ============================================================
          7. METHODOLOGY SECTION
          ============================================================ */}
      <section className="sec" id="method" aria-labelledby="me-h">
        <div className="wrap">
          <h2 id="me-h">
            {isHindi ? 'हम क्या जाँच सकते हैं, और क्या नहीं' : 'What we can verify, and what we cannot'}
          </h2>
          <div className="meth">
            <div className="mcol can">
              <h3>{isHindi ? 'हम क्या कर सकते हैं' : 'What we can do'}</h3>
              <ul>
                <li>
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-check" />
                  </svg>
                  <span>
                    {isHindi
                      ? 'आपको आधिकारिक मतदाता खोज तक पहुँचाना और आपके पाए परिणाम को दर्ज करना'
                      : 'Guide you to the official voter search and record what you found'}
                  </span>
                </li>
                <li>
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-check" />
                  </svg>
                  <span>
                    {isHindi
                      ? 'आपकी स्थिति को मौजूदा आधिकारिक मार्गदर्शन से मिलाना, स्रोत और जाँच की तारीख़ के साथ'
                      : 'Match your situation to current official guidance, showing its source and check date'}
                  </span>
                </li>
                <li>
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-check" />
                  </svg>
                  <span>
                    {isHindi
                      ? 'आपके अपलोड किए दस्तावेज़ों की पूर्णता की समीक्षा करना'
                      : 'Review the documents you upload for completeness'}
                  </span>
                </li>
                <li>
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-check" />
                  </svg>
                  <span>
                    {isHindi
                      ? 'आपके सहायता मामले को शुरू से अंत तक ट्रैक करना'
                      : 'Track your support case from start to close'}
                  </span>
                </li>
              </ul>
            </div>
            <div className="mcol cant">
              <h3>{isHindi ? 'हम क्या नहीं कर सकते' : 'What we cannot do'}</h3>
              <ul>
                <li>
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-x" />
                  </svg>
                  <span>
                    {isHindi
                      ? 'आधिकारिक मतदाता सूची देखना, खोजना या बदलना'
                      : 'See, search or change the official electoral roll'}
                  </span>
                </li>
                <li>
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-x" />
                  </svg>
                  <span>
                    {isHindi
                      ? 'यह तय करना कि कौन पात्र है या आवेदन स्वीकार होगा या नहीं'
                      : 'Decide who is eligible or whether an application is accepted'}
                  </span>
                </li>
                <li>
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-x" />
                  </svg>
                  <span>
                    {isHindi
                      ? 'यह बताना कि कोई नाम क्यों छूटा है'
                      : 'Tell you why a name is missing'}
                  </span>
                </li>
                <li>
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-x" />
                  </svg>
                  <span>
                    {isHindi
                      ? 'आधिकारिक स्रोत के प्रमाण के बिना किसी आधिकारिक परिणाम की पुष्टि करना'
                      : 'Confirm an official outcome without evidence from an official source'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="prov">
            <h3>{isHindi ? 'हर जानकारी बताती है कि वह कहाँ से आई' : 'Every fact shows where it came from'}</h3>
            <div className="chips">
              <span className="pc">
                <i />
                <span>{isHindi ? 'स्वयं-रिपोर्ट' : 'Self-reported'}</span>
              </span>
              <span className="pc">
                <i />
                <span>{isHindi ? 'दस्तावेज़ की समीक्षा हुई' : 'Document reviewed'}</span>
              </span>
              <span className="pc rv">
                <i />
                <span>{isHindi ? 'समीक्षक द्वारा पुष्टि' : 'Reviewer-confirmed'}</span>
              </span>
              <span className="pc of">
                <i />
                <span>{isHindi ? 'आधिकारिक स्रोत' : 'Official source'}</span>
              </span>
              <span className="pc st-i">
                <i />
                <span>{isHindi ? 'पुरानी हो सकती है' : 'May be out of date'}</span>
              </span>
            </div>
            <p>
              {isHindi
                ? 'जिस जानकारी की आधिकारिक स्रोत से पुष्टि नहीं हुई, उसे कभी ‘सत्यापित’ नहीं दिखाया जाता।'
                : 'Information not confirmed by an official source is never shown as verified.'}
            </p>
          </div>
        </div>
      </section>

      {/* Floating Status Toast */}
      {toastMsg && (
        <div className="toast show" id="toast" role="status" aria-live="polite">
          {toastMsg}
        </div>
      )}
    </>
  );
};
