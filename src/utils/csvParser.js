// src/utils/csvParser.js
// CSV parsing utilities with data transformation and validation
const csv = require('csv-parser');
const fs = require('fs');

const parseCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

const validateCSVHeaders = (headers, requiredHeaders) => {
  const missing = requiredHeaders.filter(header => !headers.includes(header));
  return {
    isValid: missing.length === 0,
    missingHeaders: missing
  };
};

const transformPropertyData = (row) => {
  return {
    id: row.id,
    title: row.title?.trim(),
    type: row.type,
    price: parseFloat(row.price) || 0,
    state: row.state?.trim(),
    city: row.city?.trim(),
    areaSqFt: parseInt(row.areaSqFt) || 0,
    bedrooms: parseInt(row.bedrooms) || 0,
    bathrooms: parseInt(row.bathrooms) || 0,
    amenities: row.amenities ? row.amenities.split('|').map(a => a.trim()) : [],
    furnished: row.furnished,
    availableFrom: new Date(row.availableFrom),
    listedBy: row.listedBy,
    tags: row.tags ? row.tags.split('|').map(t => t.trim()) : [],
    colorTheme: row.colorTheme,
    rating: parseFloat(row.rating) || 0,
    isVerified: row.isVerified === 'True',
    listingType: row.listingType
  };
};

const exportToCSV = (data, filename) => {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).map(value => 
    typeof value === 'string' && value.includes(',') ? `"${value}"` : value
  ).join(','));
  
  const csvContent = [headers, ...rows].join('\n');
  fs.writeFileSync(filename, csvContent);
  return filename;
};

module.exports = {
  parseCSVFile,
  validateCSVHeaders,
  transformPropertyData,
  exportToCSV
};