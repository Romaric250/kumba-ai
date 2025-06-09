import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { openai } from '@/lib/openai'
import { 
  analyzeContentComplexity, 
  extractLearningObjectives, 
  identifyContentStructure 
} from '@/lib/file-processing'

interface AnalyzeContentRequest {
  materialId: string
  analysisType?: 'full' | 'quick' | 'structure' | 'objectives'
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: AnalyzeContentRequest = await request.json()

    if (!body.materialId) {
      return NextResponse.json(
        { error: 'Material ID is required' },
        { status: 400 }
      )
    }

    // Get learning material
    const material = await db.learningMaterial.findUnique({
      where: {
        id: body.materialId,
        userId: session.user.id
      }
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Learning material not found' },
        { status: 404 }
      )
    }

    if (!material.extractedText) {
      return NextResponse.json(
        { error: 'No extracted text available for analysis' },
        { status: 400 }
      )
    }

    const analysisType = body.analysisType || 'full'
    let analysis: any = {}

    // Perform different types of analysis based on request
    switch (analysisType) {
      case 'quick':
        analysis = await performQuickAnalysis(material.extractedText)
        break
      case 'structure':
        analysis = await performStructureAnalysis(material.extractedText)
        break
      case 'objectives':
        analysis = await performObjectivesAnalysis(material.extractedText)
        break
      case 'full':
      default:
        analysis = await performFullAnalysis(material.extractedText, session.user.language || 'en')
        break
    }

    // Save analysis results to database (optional)
    await updateMaterialWithAnalysis(material.id, analysis)

    return NextResponse.json({
      materialId: material.id,
      analysisType,
      analysis,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error analyzing content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function performQuickAnalysis(text: string) {
  const complexity = analyzeContentComplexity(text)
  
  return {
    type: 'quick',
    wordCount: complexity.wordCount,
    readingLevel: complexity.readingLevel,
    estimatedReadingTime: complexity.estimatedReadingTime,
    keyTopics: complexity.keyTopics.slice(0, 5),
    summary: `${complexity.wordCount} words, ${complexity.readingLevel} level, ~${complexity.estimatedReadingTime} min read`
  }
}

async function performStructureAnalysis(text: string) {
  const structure = identifyContentStructure(text)
  const complexity = analyzeContentComplexity(text)
  
  return {
    type: 'structure',
    structure,
    organization: {
      hasChapters: structure.hasChapters,
      hasSections: structure.hasSections,
      hasLists: structure.hasNumberedLists || structure.hasBulletPoints,
      hasTechnicalContent: structure.hasCodeBlocks || structure.hasFormulas
    },
    sentenceComplexity: {
      averageLength: complexity.avgSentenceLength,
      totalSentences: complexity.sentenceCount
    },
    recommendations: generateStructureRecommendations(structure, complexity)
  }
}

async function performObjectivesAnalysis(text: string) {
  const objectives = extractLearningObjectives(text)
  
  return {
    type: 'objectives',
    learningObjectives: objectives,
    objectiveCount: objectives.length,
    categories: categorizeObjectives(objectives),
    coverage: assessObjectiveCoverage(objectives)
  }
}

async function performFullAnalysis(text: string, language: string = 'en') {
  // Combine all analysis types
  const complexity = analyzeContentComplexity(text)
  const structure = identifyContentStructure(text)
  const objectives = extractLearningObjectives(text)
  
  // AI-powered content analysis
  const aiAnalysis = await performAIAnalysis(text, language)
  
  return {
    type: 'full',
    complexity: {
      readingLevel: complexity.readingLevel,
      wordCount: complexity.wordCount,
      sentenceCount: complexity.sentenceCount,
      avgSentenceLength: complexity.avgSentenceLength,
      estimatedReadingTime: complexity.estimatedReadingTime
    },
    structure: {
      organization: structure,
      recommendations: generateStructureRecommendations(structure, complexity)
    },
    objectives: {
      extracted: objectives,
      categories: categorizeObjectives(objectives),
      coverage: assessObjectiveCoverage(objectives)
    },
    keyTopics: complexity.keyTopics,
    aiInsights: aiAnalysis,
    learningRecommendations: generateLearningRecommendations(complexity, structure, objectives),
    difficultyAssessment: assessDifficulty(complexity, structure, text)
  }
}

async function performAIAnalysis(text: string, language: string) {
  try {
    const prompt = language === 'fr' 
      ? `Analysez ce contenu éducatif et fournissez:
1. Résumé en 2-3 phrases
2. Concepts clés (5 maximum)
3. Prérequis suggérés
4. Niveau de difficulté (débutant/intermédiaire/avancé)
5. Domaine d'étude principal

Contenu: ${text.substring(0, 2000)}...`
      : `Analyze this educational content and provide:
1. Summary in 2-3 sentences
2. Key concepts (max 5)
3. Suggested prerequisites
4. Difficulty level (beginner/intermediate/advanced)
5. Main subject area

Content: ${text.substring(0, 2000)}...`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an educational content analyst. Provide structured, concise analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    })

    const aiResponse = response.choices[0]?.message?.content || ''
    return parseAIAnalysisResponse(aiResponse)
  } catch (error) {
    console.error('Error in AI analysis:', error)
    return {
      summary: 'AI analysis unavailable',
      keyConcepts: [],
      prerequisites: [],
      difficultyLevel: 'unknown',
      subjectArea: 'general'
    }
  }
}

function parseAIAnalysisResponse(response: string) {
  // Simple parsing - in production, you'd want more robust parsing
  return {
    summary: response.substring(0, 200) + '...',
    keyConcepts: ['Concept 1', 'Concept 2', 'Concept 3'], // Placeholder
    prerequisites: ['Basic knowledge'], // Placeholder
    difficultyLevel: 'intermediate', // Placeholder
    subjectArea: 'general' // Placeholder
  }
}

function generateStructureRecommendations(structure: any, complexity: any): string[] {
  const recommendations = []

  if (!structure.hasChapters && !structure.hasSections && complexity.wordCount > 1000) {
    recommendations.push("Consider breaking this content into smaller sections for better learning")
  }

  if (!structure.hasNumberedLists && !structure.hasBulletPoints) {
    recommendations.push("Adding bullet points or numbered lists could improve readability")
  }

  if (complexity.avgSentenceLength > 25) {
    recommendations.push("Some sentences are quite long - consider simplifying for better comprehension")
  }

  if (structure.hasFormulas || structure.hasCodeBlocks) {
    recommendations.push("Technical content detected - ensure adequate practice exercises")
  }

  return recommendations
}

function categorizeObjectives(objectives: string[]): { [category: string]: string[] } {
  // Simple categorization - could be enhanced with ML
  const categories: { [key: string]: string[] } = {
    knowledge: [],
    comprehension: [],
    application: [],
    analysis: []
  }

  objectives.forEach(objective => {
    const lower = objective.toLowerCase()
    if (lower.includes('understand') || lower.includes('know') || lower.includes('identify')) {
      categories.knowledge.push(objective)
    } else if (lower.includes('explain') || lower.includes('describe') || lower.includes('summarize')) {
      categories.comprehension.push(objective)
    } else if (lower.includes('apply') || lower.includes('use') || lower.includes('implement')) {
      categories.application.push(objective)
    } else if (lower.includes('analyze') || lower.includes('compare') || lower.includes('evaluate')) {
      categories.analysis.push(objective)
    } else {
      categories.knowledge.push(objective) // Default category
    }
  })

  return categories
}

function assessObjectiveCoverage(objectives: string[]): string {
  if (objectives.length === 0) return 'No clear objectives identified'
  if (objectives.length < 3) return 'Limited objective coverage'
  if (objectives.length < 6) return 'Good objective coverage'
  return 'Comprehensive objective coverage'
}

function generateLearningRecommendations(complexity: any, structure: any, objectives: string[]): string[] {
  const recommendations = []

  if (complexity.readingLevel === 'advanced') {
    recommendations.push("This is advanced material - ensure strong foundational knowledge first")
  }

  if (complexity.estimatedReadingTime > 60) {
    recommendations.push("Consider breaking study sessions into 30-45 minute chunks")
  }

  if (objectives.length > 6) {
    recommendations.push("Many learning objectives - focus on 2-3 key goals per study session")
  }

  if (structure.hasFormulas || structure.hasCodeBlocks) {
    recommendations.push("Practice exercises recommended for technical content")
  }

  return recommendations
}

function assessDifficulty(complexity: any, structure: any, text: string): {
  level: 'beginner' | 'intermediate' | 'advanced'
  factors: string[]
  score: number
} {
  let score = 0
  const factors = []

  // Reading level factor
  if (complexity.readingLevel === 'advanced') {
    score += 3
    factors.push('Advanced reading level')
  } else if (complexity.readingLevel === 'intermediate') {
    score += 2
    factors.push('Intermediate reading level')
  } else {
    score += 1
    factors.push('Beginner reading level')
  }

  // Technical content factor
  if (structure.hasFormulas || structure.hasCodeBlocks) {
    score += 2
    factors.push('Technical content present')
  }

  // Length factor
  if (complexity.wordCount > 5000) {
    score += 1
    factors.push('Lengthy content')
  }

  // Determine final level
  let level: 'beginner' | 'intermediate' | 'advanced'
  if (score <= 2) level = 'beginner'
  else if (score <= 4) level = 'intermediate'
  else level = 'advanced'

  return { level, factors, score }
}

async function updateMaterialWithAnalysis(materialId: string, analysis: any) {
  // Store analysis results in the database
  // This could be a separate table or JSON field
  try {
    await db.learningMaterial.update({
      where: { id: materialId },
      data: {
        // Store analysis in description or create a new field
        description: `Analysis completed: ${analysis.type} analysis on ${new Date().toISOString()}`
      }
    })
  } catch (error) {
    console.error('Error updating material with analysis:', error)
  }
}
