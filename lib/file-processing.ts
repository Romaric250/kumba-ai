import pdfParse from 'pdf-parse'
import Tesseract from 'tesseract.js'

// PDF text extraction
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

// Image OCR text extraction
export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  try {
    const { data: { text } } = await Tesseract.recognize(buffer, 'eng+fra', {
      logger: m => console.log(m) // Optional: log progress
    })
    return text
  } catch (error) {
    console.error('Error extracting text from image:', error)
    throw new Error('Failed to extract text from image')
  }
}

// Main function to process uploaded files
export async function processUploadedFile(
  fileUrl: string, 
  fileType: string
): Promise<string> {
  try {
    // Fetch the file from the URL
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }
    
    const buffer = Buffer.from(await response.arrayBuffer())
    
    let extractedText = ''
    
    if (fileType === 'pdf') {
      extractedText = await extractTextFromPDF(buffer)
    } else if (fileType === 'image') {
      extractedText = await extractTextFromImage(buffer)
    } else {
      throw new Error(`Unsupported file type: ${fileType}`)
    }
    
    // Clean and validate extracted text
    const cleanedText = cleanExtractedText(extractedText)
    
    if (cleanedText.length < 50) {
      throw new Error('Extracted text is too short. Please ensure the file contains readable text.')
    }
    
    return cleanedText
  } catch (error) {
    console.error('Error processing file:', error)
    throw error
  }
}

// Clean and normalize extracted text
function cleanExtractedText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters that might interfere with AI processing
    .replace(/[^\w\s\-.,;:!?()[\]{}'"]/g, '')
    // Trim whitespace
    .trim()
}

// Validate file type and size
export function validateFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 10MB'
    }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not supported. Please upload PDF or image files.'
    }
  }
  
  return { isValid: true }
}

// Get file type from MIME type
export function getFileType(mimeType: string): string {
  if (mimeType === 'application/pdf') {
    return 'pdf'
  } else if (mimeType.startsWith('image/')) {
    return 'image'
  } else {
    throw new Error(`Unsupported MIME type: ${mimeType}`)
  }
}

// Estimate reading time for content
export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200 // Average reading speed
  const wordCount = text.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// Extract key topics from text (simple keyword extraction)
export function extractKeyTopics(text: string): string[] {
  // Simple keyword extraction - can be enhanced with NLP libraries
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
  
  // Count word frequency
  const wordCount: { [key: string]: number } = {}
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })
  
  // Get top keywords
  const sortedWords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)
  
  return sortedWords
}
