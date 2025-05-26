// src/types/auth.js
const authTypes = {
  USER_ROLES: ['user', 'admin'],
  TOKEN_TYPES: ['access', 'refresh', 'reset'],
  AUTH_STATUSES: ['pending', 'verified', 'suspended']
};

// src/types/property.js  
const propertyTypes = {
  PROPERTY_TYPES: ['Villa', 'Apartment', 'Bungalow', 'Studio', 'Penthouse'],
  LISTING_TYPES: ['rent', 'sale'],
  FURNISHED_TYPES: ['Furnished', 'Unfurnished', 'Semi'],
  LISTED_BY_TYPES: ['Owner', 'Agent', 'Builder'],
  PROPERTY_STATUS: ['active', 'inactive', 'sold', 'rented']
};

// src/types/common.js
const commonTypes = {
  PAGINATION_DEFAULTS: {
    page: 1,
    limit: 20,
    maxLimit: 100
  },
  SORT_ORDERS: ['asc', 'desc'],
  CACHE_EXPIRY: {
    short: 300,    // 5 minutes
    medium: 1800,  // 30 minutes
    long: 3600     // 1 hour
  }
};

module.exports = {
  authTypes,
  propertyTypes,
  commonTypes
};