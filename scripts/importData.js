// scripts/importData.js
// Script to import CSV data into the database
const mongoose = require('mongoose');
const csvImportService = require('../src/services/csvImportService');
const config = require('../src/config/env');

const importData = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    const csvFilePath = process.argv[2] || 'data/properties.csv';
    
    const user = await csvImportService.createDefaultUser();
    console.log('Default user created/found');

    const result = await csvImportService.importProperties(csvFilePath, user._id);
    
    console.log('Import completed:');
    console.log(`- Processed: ${result.processed}`);
    console.log(`- Imported: ${result.imported}`);
    console.log(`- Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log('Errors:', result.errors.slice(0, 10));
    }

    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
};

importData();