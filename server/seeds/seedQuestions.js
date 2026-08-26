import Question from '../models/Question.js';
import SyllabusTopic from '../models/SyllabusTopic.js';

export const seedQuestions = async () => {
  try {
    // Clear existing questions
    await Question.deleteMany({});

    // Fetch a topic if exists to associate
    const polityTopic = await SyllabusTopic.findOne({ code: 'GS2-POLITY-01' });
    const historyTopic = await SyllabusTopic.findOne({ code: 'GS1-HISTORY-01' });
    const csatTopic = await SyllabusTopic.findOne({ code: 'CSAT-QUANT-01' });

    const sampleQuestions = [
      {
        subject: 'Indian Polity & Governance',
        paper: 'GS1',
        topic: polityTopic ? polityTopic._id : null,
        questionText: 'Which of the following parts of the Constitution of India describes India as a Secular State?',
        options: [
          'Fundamental Rights',
          'Preamble to the Constitution',
          'Directive Principles of State Policy',
          'Ninth Schedule'
        ],
        correctOption: 1,
        explanation: 'The Preamble to the Constitution of India declares India to be a "Sovereign Socialist Secular Democratic Republic". The word "Secular" was added by the 42nd Constitutional Amendment Act of 1976.',
        difficulty: 'easy',
        source: 'pyq',
        year: 2015
      },
      {
        subject: 'Indian Polity & Governance',
        paper: 'GS1',
        topic: polityTopic ? polityTopic._id : null,
        questionText: 'Under the Indian Constitution, concentration of wealth violates which of the following principles?',
        options: [
          'The Right to Equality',
          'Directive Principles of State Policy',
          'The Right to Freedom',
          'The Concept of Welfare'
        ],
        correctOption: 1,
        explanation: 'According to Article 39(c) of the Constitution (Directive Principles of State Policy), the State shall direct its policy towards securing that the operation of the economic system does not result in the concentration of wealth and means of production to the common detriment.',
        difficulty: 'medium',
        source: 'pyq',
        year: 2021
      },
      {
        subject: 'CSAT Aptitude',
        paper: 'CSAT',
        topic: csatTopic ? csatTopic._id : null,
        questionText: 'Two numbers are in the ratio 3:4. If 8 is added to both, the ratio becomes 4:5. What is the sum of the numbers?',
        options: [
          '48',
          '56',
          '64',
          '72'
        ],
        correctOption: 1,
        explanation: 'Let numbers be 3x and 4x. (3x + 8)/(4x + 8) = 4/5 => 5(3x + 8) = 4(4x + 8) => 15x + 40 = 16x + 32 => x = 8. Sum of numbers = 3x + 4x = 7x = 7(8) = 56.',
        difficulty: 'medium',
        source: 'mcq'
      }
    ];

    await Question.insertMany(sampleQuestions);
    console.log(`Questions seeded successfully: ${sampleQuestions.length} sample items created.`);
  } catch (error) {
    console.error(`Questions seeding failed: ${error.message}`);
    throw error;
  }
};

export default seedQuestions;
