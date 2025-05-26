// src/services/csvImportService.js
// CSV data import service with data transformation and batch processing
const csv = require('csv-parser');
const fs = require('fs');
const Property = require('../models/Property');
const User = require('../models/User');

class CSVImportService {
  async importProperties(filePath, userId) {
    const results = [];
    const errors = [];
    let processed = 0;
    let imported = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', async () => {
          try {
            for (const row of results) {
              processed++;
              try {
                const transformedData = this.transformRowData(row, userId);
                
                const existingProperty = await Property.findOne({ id: transformedData.id });
                if (existingProperty) {
                  errors.push(`Property ${transformedData.id} already exists`);
                  continue;
                }

                const property = new Property(transformedData);
                await property.save();
                imported++;
              } catch (error) {
                errors.push(`Row ${processed}: ${error.message}`);
              }
            }

            resolve({
              processed,
              imported,
              errors,
              success: errors.length === 0
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  transformRowData(row, userId) {
    const amenitiesList = row.amenities ? row.amenities.split('|').map(a => a.trim()) : [];
    const tagsList = row.tags ? row.tags.split('|').map(t => t.trim()) : [];

    return {
      id: row.id,
      title: row.title,
      type: row.type,
      price: parseFloat(row.price),
      state: row.state,
      city: row.city,
      areaSqFt: parseInt(row.areaSqFt),
      bedrooms: parseInt(row.bedrooms),
      bathrooms: parseInt(row.bathrooms),
      amenities: amenitiesList,
      furnished: row.furnished,
      availableFrom: new Date(row.availableFrom),
      listedBy: row.listedBy,
      tags: tagsList,
      colorTheme: row.colorTheme,
      rating: parseFloat(row.rating),
      isVerified: row.isVerified === 'True',
      listingType: row.listingType,
      createdBy: userId,
      isActive: true
    };
  }

  async createDefaultUser() {
    const defaultEmail = 'admin@propertyplatform.com';
    let user = await User.findOne({ email: defaultEmail });
    
    if (!user) {
      user = new User({
        name: 'System Admin',
        email: defaultEmail,
        password: 'admin123',
        role: 'admin',
        isVerified: true
      });
      await user.save();
    }
    
    return user;
  }

  async validateCSVFormat(filePath) {
    const requiredColumns = [
      'id', 'title', 'type', 'price', 'state', 'city',
      'areaSqFt', 'bedrooms', 'bathrooms', 'furnished',
      'availableFrom', 'listedBy', 'listingType'
    ];

    return new Promise((resolve, reject) => {
      let headerChecked = false;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headers) => {
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));
          if (missingColumns.length > 0) {
            reject(new Error(`Missing required columns: ${missingColumns.join(', ')}`));
            return;
          }
          headerChecked = true;
        })
        .on('data', () => {
          if (headerChecked) {
            resolve(true);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async getImportStats() {
    const totalProperties = await Property.countDocuments();
    const propertiesByType = await Property.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const propertiesByState = await Property.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } }
    ]);

    return {
      totalProperties,
      propertiesByType,
      propertiesByState
    };
  }
}

module.exports = new CSVImportService();