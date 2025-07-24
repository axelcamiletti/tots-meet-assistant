#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 TOTS Meet Assistant - Configuración inicial\n');

const questions = [
  'Firebase Project ID: ',
  'OpenAI API Key (sk-...): ',
  'Entorno (development/production): '
];

const answers = {};

let currentQuestion = 0;

function askQuestion() {
  if (currentQuestion < questions.length) {
    rl.question(questions[currentQuestion], (answer) => {
      const key = questions[currentQuestion].split(':')[0].toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[()]/g, '');
      
      answers[key] = answer.trim();
      currentQuestion++;
      askQuestion();
    });
  } else {
    generateEnvFile();
    rl.close();
  }
}

function generateEnvFile() {
  const envContent = `# Firebase Configuration
FIREBASE_PROJECT_ID=${answers.firebase_project_id || 'tots-meet-assistant'}

# OpenAI Configuration
OPENAI_API_KEY=${answers.openai_api_key || 'your-openai-key-here'}
OPENAI_MODEL=gpt-4o-mini

# Environment
NODE_ENV=${answers.entorno || 'development'}

# CORS Configuration
ALLOWED_ORIGINS=https://meet.google.com,chrome-extension://your-extension-id,https://your-angular-app.web.app

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100

# Firestore Collections
MEETINGS_COLLECTION=meetings
USERS_COLLECTION=users
ANALYTICS_COLLECTION=analytics
`;

  fs.writeFileSync('.env', envContent);
  
  console.log('\n✅ Archivo .env creado exitosamente!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Ejecutar: npm install');
  console.log('2. Configurar Firebase CLI: firebase login');
  console.log('3. Probar emuladores: npm run serve');
  console.log('4. Ejecutar pruebas: node test.js\n');
}

askQuestion();
