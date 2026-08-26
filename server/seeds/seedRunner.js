import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedSyllabus from './seedSyllabus.js';
import seedQuestions from './seedQuestions.js';

dotenv.config();

const runSeeds = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/preppilot';
    console.log(`Seed runner connecting to database at ${connStr}...`);
    await mongoose.connect(connStr);
    console.log('Database connected. Running seeds...');
    
    await seedSyllabus();
    await seedQuestions();
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding run failed:', error.message);
    process.exit(1);
  }
};

runSeeds();
