// src/services/emailService.js
// Email service for property recommendations and notifications using nodemailer
const nodemailer = require('nodemailer');
const config = require('../config/env');

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  async init() {
    if (!config.emailHost || !config.emailUser || !config.emailPass) {
      console.warn('Email configuration missing, email functionality disabled');
      return;
    }

    this.transporter = nodemailer.createTransporter({
      host: config.emailHost,
      port: config.emailPort,
      secure: config.emailPort === 465,
      auth: {
        user: config.emailUser,
        pass: config.emailPass
      }
    });

    try {
      await this.transporter.verify();
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Email service initialization failed:', error.message);
      this.transporter = null;
    }
  }

  async sendPropertyRecommendation(recipientEmail, senderName, property, message = '') {
    if (!this.transporter) {
      throw new Error('Email service not available');
    }

    const subject = `Property Recommendation from ${senderName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Property Recommendation</h2>
        <p>Hello! ${senderName} has recommended a property for you:</p>
        
        <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>${property.title}</h3>
          <p><strong>Type:</strong> ${property.type}</p>
          <p><strong>Location:</strong> ${property.city}, ${property.state}</p>
          <p><strong>Price:</strong> ₹${property.price.toLocaleString()}</p>
          <p><strong>Area:</strong> ${property.areaSqFt} sq ft</p>
          <p><strong>Bedrooms:</strong> ${property.bedrooms} | <strong>Bathrooms:</strong> ${property.bathrooms}</p>
          <p><strong>Furnished:</strong> ${property.furnished}</p>
          <p><strong>Listing Type:</strong> ${property.listingType}</p>
        </div>
        
        ${message ? `<div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4>Personal Message:</h4>
          <p style="font-style: italic;">"${message}"</p>
        </div>` : ''}
        
        <p>Visit our platform to view more details and contact the property owner.</p>
        
        <div style="margin-top: 30px; font-size: 12px; color: #666;">
          <p>This email was sent because ${senderName} recommended this property to you through our platform.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: config.emailUser,
      to: recipientEmail,
      subject,
      html
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(userEmail, userName) {
    if (!this.transporter) return { success: false, reason: 'Email service not available' };

    const subject = 'Welcome to Property Listing Platform';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Property Listing Platform!</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for joining our property listing platform. You can now:</p>
        <ul>
          <li>Browse thousands of properties</li>
          <li>List your own properties</li>
          <li>Save favorites</li>
          <li>Get property recommendations</li>
        </ul>
        <p>Happy property hunting!</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: config.emailUser,
        to: userEmail,
        subject,
        html
      });
      return { success: true };
    } catch (error) {
      console.error('Welcome email failed:', error);
      return { success: false, reason: error.message };
    }
  }

  isAvailable() {
    return this.transporter !== null;
  }
}

module.exports = new EmailService();