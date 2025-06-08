# 🎓 Kumba.AI - Your AI Learning Mentor

> "You don't learn with Kumba.AI. Kumba.AI teaches you how to learn."

Kumba.AI is a revolutionary educational platform designed specifically for African students, particularly in Cameroon. It's an AI-powered learning mentor that enforces discipline and structured learning with no shortcuts allowed.

## 🌍 **Vision**

To flip the current passive, unstructured learning paradigm in Africa by introducing an AI tutor that:
- Accepts students' materials (PDFs, images, notes)
- Generates a personalized, locked learning path
- Forces mastery and retention through AI-enforced discipline

## ✨ **Key Features**

### 🔒 **Enforced Sequential Learning**
- No jumping ahead to advanced topics
- Must master each day's content before proceeding
- Quiz-based progression with 70% minimum passing score

### 📚 **Your Materials, Your Learning**
- Upload PDFs, scanned notes, images, lecture slides
- AI processes and understands your content
- Works with local school materials - no need to buy content

### 🤖 **AI Mentor with Personality**
- Strict but caring guidance
- Respects African values of discipline and respect
- Provides culturally relevant examples and encouragement

### 🌐 **Bilingual Support**
- Full support for French and English
- Designed for Cameroon and broader African context
- Seamless language switching

### 📱 **Mobile-First Design**
- Optimized for phones and low-bandwidth environments
- Beautiful serif fonts (Georgia, Crimson Pro)
- African-inspired color palette

## 🛠 **Tech Stack**

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS with custom African-inspired design
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js with email/password
- **AI Integration**: OpenAI API (GPT-4) for content analysis and quiz generation
- **File Processing**: PDF.js for PDFs, Tesseract.js for OCR
- **File Uploads**: UploadThing (configurable)
- **State Management**: Zustand
- **UI Components**: Radix UI + custom components

## 🚀 **Getting Started**

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kumba-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:
   ```env
   DATABASE_URL="mongodb://localhost:27017/kumba-ai"
   NEXTAUTH_SECRET="your-secret-key-here"
   OPENAI_API_KEY="your-openai-api-key"
   ```

4. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 **How It Works**

### 1. **Upload Learning Materials**
Students upload their study materials:
- PDF textbooks and notes
- Scanned handwritten notes
- Lecture slides and images

### 2. **AI Analysis & Roadmap Generation**
Kumba.AI analyzes the content and creates:
- 10-day structured learning plan
- Daily topics with clear goals
- Time estimates for each section
- Prerequisites and dependencies

### 3. **Disciplined Learning Path**
- Day 1 is always unlocked
- Subsequent days require completion of previous topics
- Each topic includes reading material and quizzes
- 70% quiz score required to proceed

### 4. **AI Mentor Guidance**
- Provides encouragement and motivation
- Blocks access to advanced topics until prerequisites are met
- Offers culturally relevant examples and African proverbs
- Maintains strict but supportive learning environment

## 🏗 **Project Structure**

```
kumba-ai/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── learn/             # Learning interface
│   └── page.tsx           # Landing page
├── components/            # Reusable UI components
├── lib/                   # Core utilities and services
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database connection
│   ├── openai.ts         # AI integration
│   ├── file-processing.ts # File upload and processing
│   ├── progress-engine.ts # Learning progression logic
│   └── i18n.ts           # Internationalization
├── prisma/               # Database schema
├── types/                # TypeScript definitions
└── public/               # Static assets
```

## 🎯 **Core Philosophy**

### **Discipline Over Convenience**
- No shortcuts or skipping ahead
- Mastery required before progression
- Respect for the learning process

### **African Values Integration**
- Community and respect-centered approach
- Cultural relevance in examples and guidance
- Support for local educational materials

### **AI as Mentor, Not Assistant**
- AI guides the student, not the other way around
- Enforces learning discipline
- Provides structured, sequential education

## 🌟 **Unique Value Propositions**

1. **Reverse Control Dynamic**: Unlike other platforms where users command AI, here AI commands the user
2. **Discipline Engine**: First AI tutor that enforces learning order and doesn't tolerate skipping
3. **Multimodal & Local**: Works with real classroom notes and scans, not just elite materials
4. **Autonomous Mentor**: Can educate learners without human teacher intervention
5. **Made for Africa**: Solves African educational challenges while being globally scalable

## 🚧 **Development Status**

This is the initial implementation of Kumba.AI with core features:

### ✅ **Completed**
- Project setup and architecture
- Authentication system
- File upload and processing framework
- AI integration setup
- Database schema design
- Basic UI components and pages
- Bilingual support infrastructure

### 🔄 **In Progress**
- Complete learning interface
- Quiz generation and validation
- Progress tracking system
- Advanced AI mentor responses

### 📋 **Planned**
- Mobile app (React Native)
- Offline learning capabilities
- Advanced analytics and insights
- Community features
- Integration with African educational systems

## 🤝 **Contributing**

We welcome contributions from developers who share our vision of transforming education in Africa. Please read our contributing guidelines and code of conduct.

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 **Acknowledgments**

- Inspired by African educational values and proverbs
- Built with love for African students
- Powered by cutting-edge AI technology

---

**"The expert in anything was once a beginner. Keep learning, step by step."** - Kumba.AI Mentor
