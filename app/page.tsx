import Link from "next/link";
import { BookOpen, Users, Target, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-white to-accent-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Kumba.AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/signin"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="btn-primary"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            You don't learn with{" "}
            <span className="text-primary-600">Kumba.AI</span>
            <br />
            <span className="text-secondary-600">Kumba.AI teaches you</span>{" "}
            how to learn
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            The AI mentor that enforces discipline and structured learning for African students.
            No shortcuts. Just mastery.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/auth/signup"
              className="btn-primary text-lg px-8 py-4"
            >
              Start Learning Today
            </Link>
            <Link
              href="#features"
              className="btn-secondary text-lg px-8 py-4"
            >
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">10 Days</div>
              <div className="text-gray-600">Structured Learning Path</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary-600 mb-2">70%</div>
              <div className="text-gray-600">Minimum Passing Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-600 mb-2">2 Languages</div>
              <div className="text-gray-600">French & English</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Kumba.AI is Different
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built specifically for African students with discipline, structure, and respect for the learning process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center">
              <Target className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Enforced Discipline</h3>
              <p className="text-gray-600">
                No jumping ahead. Master each topic before proceeding to the next.
              </p>
            </div>

            <div className="card text-center">
              <BookOpen className="h-12 w-12 text-secondary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your Materials</h3>
              <p className="text-gray-600">
                Upload your PDFs, notes, and images. We work with what you have.
              </p>
            </div>

            <div className="card text-center">
              <Users className="h-12 w-12 text-accent-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Mentor</h3>
              <p className="text-gray-600">
                Strict but caring guidance that respects African values of discipline.
              </p>
            </div>

            <div className="card text-center">
              <Globe className="h-12 w-12 text-earth-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Bilingual</h3>
              <p className="text-gray-600">
                Learn in French or English, designed for Cameroon and Africa.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Kumba.AI Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Your Materials</h3>
              <p className="text-gray-600">
                Upload your study notes, PDFs, or scanned images. Our AI will analyze and understand the content.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-secondary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Your Roadmap</h3>
              <p className="text-gray-600">
                Receive a structured 10-day learning plan with clear goals, quizzes, and progress tracking.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Learn with Discipline</h3>
              <p className="text-gray-600">
                Follow the structured path. Pass quizzes to unlock new topics. No shortcuts allowed.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6" />
              <span className="text-xl font-bold">Kumba.AI</span>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering African students through disciplined, AI-guided learning.
            </p>
            <p className="text-sm text-gray-500">
              © 2024 Kumba.AI. Built for Africa, with love.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
