import SyllabusTopic from '../models/SyllabusTopic.js';

const sampleSyllabus = [
  {
    subject: 'Indian Polity & Governance',
    paper: 'GS2',
    code: 'GS2-POLITY-01',
    title: 'Indian Constitution - Historical Underpinnings & Features',
    description: 'Historical underpinnings, evolution, features, amendments, significant provisions and basic structure.',
    subtopics: [
      'Regulating Act 1773 & Charter Acts',
      'Government of India Acts 1919 & 1935',
      'Constituent Assembly and Making of Constitution',
      'Preamble & Salient Features',
      'Amendments & Basic Structure Doctrine'
    ]
  },
  {
    subject: 'Indian Polity & Governance',
    paper: 'GS2',
    code: 'GS2-POLITY-02',
    title: 'Union and the States - Functions & Responsibilities',
    description: 'Functions and responsibilities of the Union and the States, federal structure challenges, and local devolution.',
    subtopics: [
      'Federal vs Unitary features',
      'Seventh Schedule division of powers',
      'Inter-state councils & relations',
      'Panchayati Raj & Devolution of funds',
      'Emergency provisions'
    ]
  },
  {
    subject: 'Modern Indian History & Culture',
    paper: 'GS1',
    code: 'GS1-HISTORY-01',
    title: 'Indian Culture - Art Forms & Architecture',
    description: 'Salient aspects of Art Forms, Literature and Architecture from ancient to modern times.',
    subtopics: [
      'Mauryan & Temple Architecture',
      'Classical Dance Forms and Music',
      'Bhakti & Sufi movements',
      'Indus Valley Civilization sites'
    ]
  },
  {
    subject: 'Economic Development',
    paper: 'GS3',
    code: 'GS3-ECONOMY-01',
    title: 'Indian Economy & Issues Relating to Planning',
    description: 'Indian Economy and issues relating to planning, mobilization of resources, growth, development and employment.',
    subtopics: [
      'Five-Year Plans history',
      'Inclusive Growth indices',
      'Capital mobilization methods',
      'Job creation & unemployment trends'
    ]
  },
  {
    subject: 'Ethics, Integrity & Aptitude',
    paper: 'GS4',
    code: 'GS4-ETHICS-01',
    title: 'Ethics and Human Interface',
    description: 'Essence, determinants and consequences of Ethics in-human actions; dimensions of ethics; ethics in private and public relationships.',
    subtopics: [
      'Moral philosophies & thinkers',
      'Values in public administration',
      'Emotional intelligence utilities',
      'Case study approaches'
    ]
  },
  {
    subject: 'CSAT Aptitude',
    paper: 'CSAT',
    code: 'CSAT-QUANT-01',
    title: 'Quantitative Aptitude & Number Systems',
    description: 'Basic numeracy (numbers and their relations, orders of magnitude, etc. - Class X level).',
    subtopics: [
      'Prime numbers and Divisibility rules',
      'HCF and LCM structures',
      'Percentages & Profit and Loss',
      'Ratios, Proportions & Averages'
    ]
  }
];

export const seedSyllabus = async () => {
  try {
    // Clear existing
    await SyllabusTopic.deleteMany({});
    
    // Insert new
    await SyllabusTopic.insertMany(sampleSyllabus);
    console.log(`Syllabus seeded successfully: ${sampleSyllabus.length} core topics created.`);
  } catch (error) {
    console.error(`Syllabus seeding failed: ${error.message}`);
    throw error;
  }
};

export default seedSyllabus;
