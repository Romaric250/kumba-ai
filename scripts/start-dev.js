#!/usr/bin/env node

/**
 * Development startup script for Kumba.AI
 * This script helps you get started quickly with all the necessary checks
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🎓 Welcome to Kumba.AI Development Setup!')
console.log('=' .repeat(50))

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env')
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!')
  console.log('📝 Please create a .env file with the following variables:')
  console.log(`
DATABASE_URL="mongodb://localhost:27017/kumba-ai"
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-your-openai-api-key"
UPLOADTHING_SECRET="sk_live_your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
`)
  process.exit(1)
}

console.log('✅ .env file found')

// Check if node_modules exists
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  console.log('📦 Installing dependencies...')
  try {
    execSync('npm install', { stdio: 'inherit' })
    console.log('✅ Dependencies installed')
  } catch (error) {
    console.log('❌ Failed to install dependencies')
    process.exit(1)
  }
}

// Check if Prisma client is generated
try {
  require('@prisma/client')
  console.log('✅ Prisma client is ready')
} catch (error) {
  console.log('🔧 Generating Prisma client...')
  try {
    execSync('npx prisma generate', { stdio: 'inherit' })
    console.log('✅ Prisma client generated')
  } catch (error) {
    console.log('❌ Failed to generate Prisma client')
    process.exit(1)
  }
}

// Check database connection
console.log('🔍 Checking database connection...')
try {
  execSync('npx prisma db push', { stdio: 'inherit' })
  console.log('✅ Database connection successful')
} catch (error) {
  console.log('❌ Database connection failed')
  console.log('💡 Make sure MongoDB is running and DATABASE_URL is correct')
  process.exit(1)
}

// Ask if user wants to seed the database
const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('🌱 Do you want to seed the database with sample data? (y/N): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('🌱 Seeding database...')
    try {
      execSync('npm run db:seed', { stdio: 'inherit' })
      console.log('✅ Database seeded successfully')
      console.log('📝 Sample credentials:')
      console.log('   Email: student@kumba.ai')
      console.log('   Password: password123')
    } catch (error) {
      console.log('❌ Failed to seed database')
    }
  }

  console.log('\n🚀 Starting development server...')
  console.log('🌐 Open http://localhost:3000 in your browser')
  console.log('⏹️  Press Ctrl+C to stop the server')
  console.log('=' .repeat(50))

  // Start the development server
  try {
    execSync('npm run dev', { stdio: 'inherit' })
  } catch (error) {
    console.log('❌ Failed to start development server')
    process.exit(1)
  }

  rl.close()
})
