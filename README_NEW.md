# 🎓 **Kumba.AI** - AI-Powered Learning Mentor

> *"Empowering African students with disciplined, AI-guided learning"*

Kumba.AI is an innovative educational platform that transforms how African students learn by providing personalized, AI-powered learning experiences. Named after the vibrant city of Kumba in Cameroon, this platform embodies the spirit of growth, community, and educational excellence.

## 🌟 **Key Features**

### 📚 **Smart Content Processing**
- **Multi-format Support**: Upload PDFs, images, and scanned documents
- **Advanced OCR**: Extract text from handwritten notes and images (English & French)
- **AI Analysis**: Intelligent content analysis and structure recognition
- **Content Complexity Assessment**: Automatic difficulty and reading level analysis
- **Multi-language**: Full support for English and French

### 🗺️ **Intelligent Learning Roadmaps**
- **10-Day Plans**: Structured learning paths with daily goals
- **Sequential Learning**: Disciplined progression with locked topics
- **Adaptive Difficulty**: AI adjusts based on performance
- **Time Estimation**: Realistic study time predictions
- **Multiple Learning Modes**: Strict, Flexible, Exam Prep, and Review modes

### 🧠 **Advanced Quiz System**
- **AI-Generated Quizzes**: Dynamic questions based on content analysis
- **Multiple Question Types**: Multiple choice, true/false, fill-in-blank, matching
- **Adaptive Difficulty**: Questions adjust to user performance
- **Instant Feedback**: Detailed explanations and learning insights
- **Performance Analytics**: Track improvement over time
- **Retake Management**: Limited attempts with strategic spacing

### 📊 **Comprehensive Analytics Dashboard**
- **Learning Streaks**: Track daily learning consistency with gamification
- **Performance Metrics**: Detailed progress visualization and charts
- **Time Tracking**: Monitor study time efficiency and patterns
- **Mastery Trends**: Track improvement in understanding over time
- **Personalized Insights**: AI-powered learning recommendations
- **Achievement System**: Unlock badges and milestones

### 🤖 **AI Mentor Integration**
- **24/7 Support**: Always-available AI tutor with contextual awareness
- **Contextual Help**: Assistance based on current progress and struggles
- **Cultural Relevance**: African proverbs and culturally appropriate guidance
- **Motivational Coaching**: Encouraging yet disciplined approach
- **Personalized Feedback**: Tailored advice based on learning patterns

### 🎯 **Learning Modes & Flexibility**
- **Strict Mode**: Sequential learning with mandatory prerequisites
- **Flexible Mode**: Allow topic skipping for review and exploration
- **Exam Preparation**: Intensive mode with frequent assessments
- **Review Mode**: Focus on previously completed topics for reinforcement

## 🏗️ **Technical Architecture**

### **Frontend**
- **Next.js 15** with App Router and Turbopack
- **TypeScript** for type safety and better development experience
- **Tailwind CSS 4** for modern styling and design system
- **Radix UI** for accessible, unstyled components
- **React Hook Form** with Zod validation
- **Zustand** for state management
- **Lucide React** for consistent iconography

### **Backend & APIs**
- **Next.js API Routes** for serverless backend functions
- **Prisma ORM** with MongoDB for flexible data modeling
- **NextAuth.js** for secure authentication
- **OpenAI GPT-4** for advanced AI capabilities
- **UploadThing** for secure file uploads and management
- **Comprehensive API Layer** with 15+ specialized endpoints

### **AI & Processing**
- **OpenAI GPT-4** for content analysis, quiz generation, and mentoring
- **Tesseract.js** for advanced OCR processing (English & French)
- **PDF-Parse** for efficient PDF text extraction
- **Custom algorithms** for learning progression and analytics
- **Intelligent content structure recognition**

### **Database Schema**
- **Users**: Authentication and profile management
- **Learning Materials**: File storage and content analysis
- **Learning Plans**: Structured 10-day learning paths
- **Topics**: Individual learning units with goals and content
- **Quizzes**: AI-generated assessments with multiple question types
- **Progress Tracking**: Detailed learning analytics and time tracking
- **Quiz Results**: Performance history and improvement tracking

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js 18+ (recommended: 20+)
- MongoDB (local installation or cloud service like MongoDB Atlas)
- OpenAI API key (GPT-4 access recommended)
- UploadThing account for file management

### **Quick Setup**

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
   # Database
   DATABASE_URL="mongodb://localhost:27017/kumba-ai"
   
   # Authentication
   NEXTAUTH_SECRET="your-super-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # AI Services
   OPENAI_API_KEY="sk-your-openai-api-key"
   
   # File Upload (UploadThing)
   UPLOADTHING_SECRET="sk_live_your-uploadthing-secret"
   UPLOADTHING_APP_ID="your-uploadthing-app-id"
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed with sample data**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### **Sample Credentials**
After running the seed script:
- **Email**: `student@kumba.ai`
- **Password**: `password123`

## 📖 **How It Works**

### 1. **Upload Learning Materials**
Students upload their study materials:
- PDF textbooks, lecture notes, and academic papers
- Scanned handwritten notes and assignments
- Images of whiteboards, slides, and diagrams
- Support for multiple file formats with intelligent processing

### 2. **AI Content Analysis**
Kumba.AI performs deep analysis:
- **Text Extraction**: OCR for images, parsing for PDFs
- **Content Structure**: Identify chapters, sections, key concepts
- **Complexity Assessment**: Determine reading level and difficulty
- **Learning Objectives**: Extract and categorize learning goals
- **Time Estimation**: Calculate realistic study time requirements

### 3. **Intelligent Roadmap Generation**
AI creates personalized learning paths:
- **10-day structured plan** with daily learning goals
- **Sequential progression** with clear prerequisites
- **Adaptive difficulty** based on content complexity
- **Time-boxed sessions** for optimal learning retention
- **Goal-oriented approach** with measurable outcomes

### 4. **Disciplined Learning Experience**
- **Day 1 always unlocked** to start immediately
- **Progressive unlocking** requires completion of previous topics
- **Mandatory quizzes** with 70% passing score requirement
- **Multiple learning modes** for different learning styles
- **Streak tracking** to build consistent study habits

### 5. **Comprehensive Assessment System**
- **AI-generated quizzes** tailored to content and difficulty
- **Multiple question types** for varied assessment
- **Instant feedback** with detailed explanations
- **Performance tracking** with improvement analytics
- **Adaptive questioning** based on user performance

### 6. **Progress Analytics & Insights**
- **Real-time dashboards** with learning metrics
- **Streak tracking** and consistency monitoring
- **Performance trends** and mastery progression
- **Time efficiency** analysis and optimization
- **Personalized recommendations** for improvement

## 🎯 **Competition-Winning Features**

### **Advanced AI Integration**
- **GPT-4 powered content analysis** for deep understanding
- **Contextual AI mentoring** with cultural awareness
- **Adaptive quiz generation** based on performance patterns
- **Intelligent learning path optimization**

### **Comprehensive Analytics**
- **15+ specialized API endpoints** for detailed tracking
- **Real-time progress visualization** with interactive charts
- **Learning pattern analysis** and predictive insights
- **Performance benchmarking** and improvement tracking

### **Multiple Learning Modes**
- **Strict Mode**: Enforced sequential learning
- **Flexible Mode**: Self-paced exploration
- **Exam Prep Mode**: Intensive assessment focus
- **Review Mode**: Reinforcement and retention

### **Cultural Relevance**
- **Bilingual support** (English & French)
- **African proverbs** and cultural context
- **Locally relevant examples** and scenarios
- **Community-focused learning approach**

## 📁 **API Endpoints**

### **Authentication & Users**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User authentication
- `GET /api/auth/session` - Session management

### **Content Management**
- `POST /api/upload` - File upload and processing
- `POST /api/content/analyze` - Content analysis
- `POST /api/roadmap` - Learning plan generation

### **Learning & Progress**
- `GET /api/progress/[planId]` - Learning plan progress
- `POST /api/progress/topic/[topicId]/complete` - Complete topic
- `GET /api/modes` - Learning mode management
- `POST /api/modes` - Set learning mode

### **Quiz System**
- `GET /api/quiz/[quizId]` - Get quiz details
- `POST /api/quiz/[quizId]/submit` - Submit quiz answers
- `GET /api/quiz/[quizId]/results` - Quiz results and analytics
- `POST /api/quiz/generate` - Generate new quiz

### **Analytics & Insights**
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/charts/progress` - Progress visualization data
- `POST /api/mentor/chat` - AI mentor interaction

## 🏆 **Why This Will Win**

1. **Comprehensive Solution**: Full-stack platform with advanced AI integration
2. **Cultural Relevance**: Designed specifically for African students
3. **Technical Excellence**: Modern tech stack with robust architecture
4. **User Experience**: Intuitive interface with powerful features
5. **Scalability**: Built for growth with efficient database design
6. **Innovation**: Unique combination of AI mentoring and disciplined learning

## 🚀 **Next Steps**

1. **Add OpenAI API key** to environment variables
2. **Test all features** with sample data
3. **Customize branding** and cultural elements
4. **Deploy to production** platform
5. **Gather user feedback** and iterate

---

**Ready to revolutionize education in Africa? Let's build the future of learning together! 🌍📚**
