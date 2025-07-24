const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class AuthService {
  constructor() {
    this.oauth2Client = null;
    this.serviceAccount = null;
    this.initializeAuth();
  }

  async initializeAuth() {
    try {
      // Try OAuth2 first (preferred for production)
      await this.setupOAuth2();
    } catch (error) {
      console.log('⚠️ OAuth2 setup failed, falling back to service account:', error.message);
      try {
        await this.setupServiceAccount();
      } catch (serviceError) {
        console.log('⚠️ Service account setup failed, will use manual login:', serviceError.message);
        this.useManualLogin = true;
      }
    }
  }

  async setupOAuth2() {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('OAuth2 credentials not configured');
    }

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/callback'
    );

    // Check if we have stored tokens
    const tokenPath = path.join(__dirname, 'oauth-tokens.json');
    if (fs.existsSync(tokenPath)) {
      const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
      this.oauth2Client.setCredentials(tokens);
      
      // Verify and refresh if needed
      try {
        await this.oauth2Client.getAccessToken();
        console.log('✅ OAuth2 authentication ready');
        return;
      } catch (error) {
        console.log('⚠️ Stored tokens invalid, need re-authentication');
        fs.unlinkSync(tokenPath);
      }
    }

    throw new Error('OAuth2 authentication required - need to run auth flow');
  }

  async setupServiceAccount() {
    const serviceAccountPath = path.join(__dirname, 'service-account-key.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error('Service account key file not found');
    }

    const serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    this.serviceAccount = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        // Note: Google Meet doesn't have direct API access for joining meetings
        // We'll still need Puppeteer for the actual meeting interaction
      ]
    });

    console.log('✅ Service account authentication ready');
  }

  getAuthUrl() {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'profile',
        'email'
      ],
      prompt: 'consent'
    });

    return authUrl;
  }

  async handleAuthCallback(code) {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }

    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    // Store tokens for future use
    const tokenPath = path.join(__dirname, 'oauth-tokens.json');
    fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));

    console.log('✅ OAuth2 tokens stored successfully');
    return tokens;
  }

  async getAuthenticatedClient() {
    if (this.oauth2Client && this.oauth2Client.credentials) {
      return this.oauth2Client;
    }
    
    if (this.serviceAccount) {
      return await this.serviceAccount.getClient();
    }

    return null;
  }

  isAuthenticated() {
    return !this.useManualLogin && (
      (this.oauth2Client && this.oauth2Client.credentials) ||
      this.serviceAccount
    );
  }

  async getUserInfo() {
    try {
      const client = await this.getAuthenticatedClient();
      if (!client) return null;

      const people = google.people({ version: 'v1', auth: client });
      const profile = await people.people.get({
        resourceName: 'people/me',
        personFields: 'names,emailAddresses'
      });

      return {
        name: profile.data.names?.[0]?.displayName,
        email: profile.data.emailAddresses?.[0]?.value
      };
    } catch (error) {
      console.log('⚠️ Error getting user info:', error.message);
      return null;
    }
  }
}

module.exports = AuthService;
