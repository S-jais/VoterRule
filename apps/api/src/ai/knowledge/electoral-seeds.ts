import { KnowledgeChunk } from '../interfaces.js';

export const ELECTORAL_CORPUS_SEEDS: KnowledgeChunk[] = [
  // 1. Constitutional Provisions
  {
    id: 'kb-const-art-326',
    title: 'Article 326: Universal Adult Suffrage and Voter Eligibility',
    officialSource: 'Constitution of India',
    sourceUrl: 'https://www.indiacode.nic.in',
    category: 'constitutional_provisions',
    language: 'en',
    publicationDate: '1950-01-26',
    lastVerifiedDate: '2026-10-31',
    version: '2026.1',
    reviewStatus: 'published',
    reviewedBy: 'Statutory Research Reviewer',
    publishedAt: '2026-10-31T00:00:00Z',
    text: `Article 326 of the Constitution of India guarantees universal adult suffrage. Every citizen of India who is not less than eighteen years of age on the statutory qualifying date, and who is not otherwise disqualified under the Constitution or any law made by the appropriate Legislature on the ground of non-residence, unsoundness of mind, crime or corrupt or illegal practice, is entitled to be registered as a voter at any election to the House of the People and to the Legislative Assembly of every State.`
  },
  {
    id: 'kb-const-art-324-325',
    title: 'Articles 324 & 325: ECI Superintendence & Non-Discriminatory Single Electoral Roll',
    officialSource: 'Constitution of India',
    sourceUrl: 'https://www.indiacode.nic.in',
    category: 'constitutional_provisions',
    language: 'en',
    publicationDate: '1950-01-26',
    lastVerifiedDate: '2026-10-31',
    version: '2026.1',
    reviewStatus: 'published',
    reviewedBy: 'Statutory Research Reviewer',
    publishedAt: '2026-10-31T00:00:00Z',
    text: `Article 324 vests the superintendence, direction, and control of the preparation of electoral rolls and the conduct of elections in the Election Commission of India. Article 325 mandates that there shall be one general electoral roll for every territorial constituency and no person shall be ineligible for inclusion or claim to be included in any special roll on grounds only of religion, race, caste, sex or any of them.`
  },

  // 2. Electoral Laws - Eligibility & Qualifying Dates
  {
    id: 'kb-rpa-qualifying-dates',
    title: 'Four Statutory Qualifying Dates (1 Jan, 1 Apr, 1 Jul, 1 Oct)',
    officialSource: 'Representation of the People Act 1950 (Section 14(b))',
    sourceUrl: 'https://www.indiacode.nic.in',
    category: 'electoral_laws',
    language: 'en',
    publicationDate: '2022-08-01',
    lastVerifiedDate: '2026-10-31',
    version: '2026.2',
    reviewStatus: 'published',
    reviewedBy: 'Statutory Research Reviewer',
    publishedAt: '2026-10-31T00:00:00Z',
    text: `Under Section 14(b) of the Representation of the People Act 1950 (amended via the Election Laws Amendment Act 2021), India operates four statutory qualifying dates in a calendar year: January 1, April 1, July 1, and October 1. A citizen who attains 18 years of age on or before any of these qualifying dates is eligible to be enrolled in the electoral roll. Prospective electors turning 18 later in the year can submit advance applications in Form 6 starting from the annual Special Summary Revision (SSR).`
  },
  {
    id: 'kb-rpa-ordinary-residence',
    title: 'Ordinary Residence Requirement (Section 20 RPA 1950)',
    officialSource: 'Representation of the People Act 1950 (Section 20)',
    sourceUrl: 'https://www.indiacode.nic.in',
    category: 'electoral_laws',
    language: 'en',
    publicationDate: '1950-05-12',
    lastVerifiedDate: '2026-10-31',
    version: '2026.1',
    reviewStatus: 'published',
    reviewedBy: 'Statutory Research Reviewer',
    publishedAt: '2026-10-31T00:00:00Z',
    text: `Section 20 of the Representation of the People Act 1950 defines 'ordinarily resident'. A person is not deemed ordinarily resident in a constituency solely because they own or possess a dwelling house there. The determining test is habitual residence in the ordinary course of life. Special provisions apply to Service Voters (armed forces, state police posted outside), MPs/MLAs, and citizens temporarily absent for employment or studies.`
  },
  {
    id: 'kb-rpa-disqualifications',
    title: 'Statutory Disqualifications for Registration (Section 16 RPA 1950)',
    officialSource: 'Representation of the People Act 1950 (Section 16)',
    sourceUrl: 'https://www.indiacode.nic.in',
    category: 'electoral_laws',
    language: 'en',
    publicationDate: '1950-05-12',
    lastVerifiedDate: '2026-10-31',
    version: '2026.1',
    reviewStatus: 'published',
    reviewedBy: 'Statutory Research Reviewer',
    publishedAt: '2026-10-31T00:00:00Z',
    text: `Section 16 of the Representation of the People Act 1950 enumerates grounds for disqualification: (a) non-citizenship of India; (b) unsoundness of mind as declared by a competent court of law; (c) disqualification under any law relating to corrupt practices and other offences in connection with elections. If a person incurs any disqualification after registration, their name is struck off the roll by the ERO following due inquiry.`
  },
  {
    id: 'kb-rpa-single-registration',
    title: 'Prohibition of Multiple Registrations (Sections 17 & 18 RPA 1950)',
    officialSource: 'Representation of the People Act 1950 (Sections 17 and 18)',
    sourceUrl: 'https://www.indiacode.nic.in',
    category: 'duplicate_rules',
    language: 'en',
    publicationDate: '1950-05-12',
    lastVerifiedDate: '2026-10-31',
    version: '2026.1',
    reviewStatus: 'published',
    reviewedBy: 'Statutory Research Reviewer',
    publishedAt: '2026-10-31T00:00:00Z',
    text: `Section 17 dictates that no person shall be entitled to be registered in the electoral roll for more than one constituency. Section 18 mandates that no person shall be entitled to be registered in the electoral roll for any constituency more than once. When shifting residence, a citizen must apply under Form 8 to shift enrollment, which automatically triggers deletion from the former constituency, preventing redundant entries.`
  },

  // 3. Statutory Forms (Registration of Electors Rules 1960)
  {
    id: 'kb-form-6-guide',
    title: 'Form 6: Application for Inclusion of Name in Electoral Roll',
    officialSource: 'Registration of Electors Rules 1960 (Rules 13(1) and 26)',
    sourceUrl: 'https://voters.eci.gov.in',
    category: 'forms',
    language: 'en',
    publicationDate: '2026-01-01',
    lastVerifiedDate: '2026-10-31',
    version: '2026.2',
    reviewStatus: 'published',
    reviewedBy: 'Statutory Research Reviewer',
    publishedAt: '2026-10-31T00:00:00Z',
    text: `Form 6 is the statutory application for inclusion of name in the electoral roll for first-time electors and citizens whose names do not appear in any existing roll. It requires proof of date of birth (Birth Certificate, Aadhaar, PAN, Passport, or Class 10 Certificate) and proof of ordinary residence (Water/Electricity/Gas Bill, Aadhaar, Current Bank Passbook, Passport, or Registered Rent Deed). Form 6 can be submitted online at voters.eci.gov.in or in paper form to the local BLO or ERO.`
  },
  {
    id: 'kb-form-6a-guide',
    title: 'Form 6A: Registration of Overseas (NRI) Electors',
    officialSource: 'Registration of Electors Rules 1960 (Rule 8A)',
    sourceUrl: 'https://voters.eci.gov.in',
    category: 'forms',
    language: 'en',
    publicationDate: '2026-01-01',
    lastVerifiedDate: '2026-10-31',
    version: '2026.1',
    reviewStatus: 'published',
    reviewedBy: 'Statutory Research Reviewer',
    publishedAt: '2026-10-31T00:00:00Z',
    text: `Form 6A is used by Indian citizens residing outside India due to employment, education or other reasons, who have not acquired foreign citizenship. The overseas elector is enrolled in the constituency in which their place of residence in India (as given in their valid Indian Passport) is located. They must produce a copy of their valid Indian passport containing visa endorsement.`
  },
  {
    id: 'kb-form-6b-guide',
    title: 'Form 6B: Voluntary Intimation of Aadhaar on Official ECI Portal',
    officialSource: 'Election Laws (Amendment) Act 2021 & ECI Notifications',
    sourceUrl: 'https://voters.eci.gov.in',
    category: 'forms',
    language: 'en',
    publicationDate: '2022-08-01',
    lastVerifiedDate: '2026-10-31',
    version: '2026.1',
    reviewStatus: 'published',
    reviewedBy: 'Statutory Research Reviewer',
    publishedAt: '2026-10-31T00:00:00Z',
    text: `Form 6B is for the voluntary intimation of Aadhaar number by existing electors to authenticate their electoral roll entry. Intimating Aadhaar is strictly voluntary and non-submission of Aadhaar does NOT result in deletion of an elector's name from the roll. VoteRule never collects, asks for, or stores Aadhaar numbers. Citizens wishing to complete Form 6B must do so directly on the official ECI portal.`
  },
  {
    id: 'kb-form-7-guide',
    title: 'Form 7: Objections to Proposed Inclusion or Deletion of Existing Name',
    officialSource: 'Registration of Electors Rules 1960 (Rules 13(2) and 26)',
    sourceUrl: 'https://voters.eci.gov.in',
    category: 'forms',
    language: 'en',
    publicationDate: '2026-01-01',
    lastVerifiedDate: '2026-10-31',
    version: '2026.1',
    reviewStatus: 'published',
    reviewedBy: 'Statutory Research Reviewer',
    publishedAt: '2026-10-31T00:00:00Z',
    text: `Form 7 is submitted either to object to a proposed inclusion in the draft roll during summary revision, or to request the deletion of an existing entry on grounds of death, permanent shifting, or disqualification. Filing false statutory declarations is an offence under Section 31 of RPA 1950. Deletion is never automatic; the ERO must conduct physical field verification and issue a statutory show-cause notice before any entry can be deleted.`
  },
  {
    id: 'kb-form-8-guide',
    title: 'Form 8: Shifting of Residence, Correction of Entries, Replacement EPIC, PwD Marking',
    officialSource: 'Registration of Electors Rules 1960 (Rules 13(1) and 26)',
    sourceUrl: 'https://voters.eci.gov.in',
    category: 'forms',
    language: 'en',
    publicationDate: '2026-01-01',
    lastVerifiedDate: '2026-10-31',
    version: '2026.2',
    reviewStatus: 'published',
    reviewedBy: 'Statutory Research Reviewer',
    publishedAt: '2026-10-31T00:00:00Z',
    text: `Form 8 unifies four major statutory electoral services: (1) Shifting of residence within the same assembly constituency or to another assembly constituency; (2) Correction of existing entries (Name, Gender, Date of Birth, Age, Relation Type, Relative Name, Mobile Number, or Photo); (3) Issue of replacement EPIC without correction (in cases of loss, mutilation, destruction, or wear); (4) Marking of Person with Disability (PwD) for accessible polling facilities.`
  },

  // 4. Missing Name & Omission Procedure
  {
    id: 'kb-missing-name-protocol',
    title: 'Protocol When Name is Missing from the Electoral Roll',
    officialSource: 'ECI Manual on Electoral Rolls',
    sourceUrl: 'https://voters.eci.gov.in',
    category: 'registration_processes',
    language: 'en',
    publicationDate: '2026-01-01',
    lastVerifiedDate: '2026-10-31',
    version: '2026.1',
    reviewStatus: 'published',
    reviewedBy: 'Statutory Research Reviewer',
    publishedAt: '2026-10-31T00:00:00Z',
    text: `If an official search returns no record: (1) Verify alternate name spellings and relative names on electoralsearch.eci.gov.in; (2) Search using your EPIC number directly; (3) Check with your Booth Level Officer (BLO) whether your polling booth or section boundaries changed during delimitation; (4) If your name has been omitted or deleted, file Form 6 for fresh inclusion immediately. An unreturned search does not prove unlawful deletion; official recourse is available through Form 6 or by filing a grievance on voters.eci.gov.in or calling 1950.`
  },

  // 5. Deceased Elector Reporting Safeguards
  {
    id: 'kb-deceased-reporting-safeguard',
    title: 'Safeguards Regarding Deceased Person Reporting and Verification',
    officialSource: 'ECI Instructions on Deletion of Deceased Electors',
    sourceUrl: 'https://www.eci.gov.in',
    category: 'support_procedures',
    language: 'en',
    publicationDate: '2025-06-15',
    lastVerifiedDate: '2026-10-31',
    version: '2026.1',
    reviewStatus: 'published',
    reviewedBy: 'Statutory Research Reviewer',
    publishedAt: '2026-10-31T00:00:00Z',
    text: `Under ECI guidelines, no name can be deleted on grounds of death based solely on private third-party allegations. Deletion requires: (a) Official death certificate registered under the Registration of Births and Deaths Act 1969, or (b) Statutory Form 7 filed by immediate family members / legal heirs, accompanied by physical field verification by the BLO and mandatory publication of list of proposed deletions for public notice. VoteRule enforces strict anti-weaponization limits (max 3 reports per user per 30 days).`
  },

  // 6. Official Helplines and Authority Contacts
  {
    id: 'kb-helpline-1950',
    title: 'National Voter Helpline 1950 & District Contact Centres',
    officialSource: 'Election Commission of India Contact Registry',
    sourceUrl: 'https://www.eci.gov.in',
    category: 'support_procedures',
    language: 'en',
    publicationDate: '2026-01-01',
    lastVerifiedDate: '2026-10-31',
    version: '2026.1',
    reviewStatus: 'published',
    reviewedBy: 'Statutory Research Reviewer',
    publishedAt: '2026-10-31T00:00:00Z',
    text: `The National Voter Helpline is 1950 (Toll Free). Electors can call 1950 from 10:00 AM to 5:00 PM on all working days. When calling from a mobile phone, callers should prefix their District STD code (e.g., 011-1950 in Delhi) to connect directly with their District Contact Centre. To locate your specific Electoral Registration Officer (ERO) or Booth Level Officer (BLO), visit https://voters.eci.gov.in and click 'Know Your Polling Station and Officer'.`
  }
];

