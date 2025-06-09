const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addSampleContent() {
  try {
    const learningPlanId = '6846c875b0fcac299ed4eaa7' // Master testing plan
    
    // Check if learning plan exists
    const existingPlan = await prisma.learningPlan.findUnique({
      where: { id: learningPlanId }
    })

    if (!existingPlan) {
      console.log('Learning plan not found. Please check if the ID exists in your database.')
      console.log('Skipping learning plan creation and proceeding with topics...')
    } else {
      console.log('Found existing learning plan:', existingPlan.title)
    }
    
    // Delete existing topics for this plan
    await prisma.topic.deleteMany({
      where: { learningPlanId }
    })
    
    // Create comprehensive topics
    const topics = [
      {
        title: 'Introduction to Software Testing',
        description: 'Foundation concepts and overview of testing',
        content: `# Introduction to Software Testing

Software testing is a critical process that ensures applications work correctly and meet requirements. This introduction covers the fundamental concepts you need to get started.

## Learning Objectives
- Understand what software testing is and its importance
- Learn different types of testing
- Set up your testing environment
- Write your first test case

## Key Concepts

### What is Software Testing?
Software testing is the process of evaluating and verifying that a software application or system meets specified requirements and functions correctly. It helps identify bugs, errors, and defects before the software is released.

### Types of Testing
\`\`\`
Unit Testing - Testing individual components
Integration Testing - Testing component interactions
System Testing - Testing the complete system
Acceptance Testing - Testing user requirements
\`\`\`

### Testing Pyramid
- **Unit Tests**: Fast, isolated, numerous
- **Integration Tests**: Medium speed, test interactions
- **End-to-End Tests**: Slow, test complete workflows

### Basic Test Structure
\`\`\`javascript
// Arrange - Set up test data
const calculator = new Calculator();

// Act - Execute the function
const result = calculator.add(2, 3);

// Assert - Verify the result
expect(result).toBe(5);
\`\`\`

## Practice Exercises
1. Identify different types of testing in a web application
2. Write a simple test case for a calculator function
3. Set up a basic testing framework

## Next Steps
Tomorrow we'll dive deeper into unit testing fundamentals and learn how to write effective test cases.`,
        goals: ['Understand testing basics', 'Learn testing types', 'Set up testing environment'],
        timeEstimate: 45,
        dayIndex: 1,
        status: 'unlocked'
      },
      {
        title: 'Variables and Data Types',
        description: 'Deep dive into JavaScript variables and data types',
        content: `# Variables and Data Types

Understanding variables and data types is crucial for JavaScript programming. This lesson covers everything you need to know about storing and manipulating data.

## Learning Objectives
- Master variable declarations (var, let, const)
- Understand all JavaScript data types
- Learn type conversion and coercion
- Practice with real-world examples

## Variable Declarations

### let vs const vs var
\`\`\`javascript
// let - block-scoped, can be reassigned
let score = 100;
score = 150; // OK

// const - block-scoped, cannot be reassigned
const PI = 3.14159;
// PI = 3.14; // Error!

// var - function-scoped (avoid in modern JS)
var oldStyle = "legacy";
\`\`\`

## Data Types in Detail

### Numbers
\`\`\`javascript
let integer = 42;
let decimal = 3.14;
let scientific = 2.5e6; // 2,500,000
let infinity = Infinity;
let notANumber = NaN;
\`\`\`

### Strings
\`\`\`javascript
let single = 'Hello';
let double = "World";
let template = \`Hello \${name}\`; // Template literals
let multiline = \`
    This is a
    multiline string
\`;
\`\`\`

### Booleans and Special Values
\`\`\`javascript
let isActive = true;
let isComplete = false;
let nothing = null;
let notDefined = undefined;
\`\`\`

## Type Conversion
\`\`\`javascript
// Explicit conversion
let str = String(123); // "123"
let num = Number("456"); // 456
let bool = Boolean(1); // true

// Implicit conversion (coercion)
let result = "5" + 3; // "53" (string)
let math = "5" - 3; // 2 (number)
\`\`\`

## Practice Exercises
1. Create variables using all three declaration methods
2. Practice string interpolation with template literals
3. Experiment with type conversion functions
4. Build a simple calculator using different data types`,
        goals: ['Master variable declarations', 'Understand all data types', 'Learn type conversion'],
        timeEstimate: 60,
        dayIndex: 2,
        status: 'locked'
      },
      {
        title: 'Control Structures and Functions',
        description: 'Learn conditional statements, loops, and function creation',
        content: `# Control Structures and Functions

Control structures and functions are the building blocks of JavaScript logic. Master these concepts to create dynamic and interactive programs.

## Learning Objectives
- Master conditional statements (if, else, switch)
- Understand different types of loops
- Create and use functions effectively
- Learn about scope and closures

## Conditional Statements

### if/else Statements
\`\`\`javascript
let age = 18;

if (age >= 18) {
    console.log("You can vote!");
} else if (age >= 16) {
    console.log("You can drive!");
} else {
    console.log("You're still young!");
}
\`\`\`

### Switch Statements
\`\`\`javascript
let day = "Monday";

switch (day) {
    case "Monday":
        console.log("Start of work week");
        break;
    case "Friday":
        console.log("TGIF!");
        break;
    default:
        console.log("Regular day");
}
\`\`\`

## Loops

### For Loops
\`\`\`javascript
// Traditional for loop
for (let i = 0; i < 5; i++) {
    console.log(i);
}

// For...of loop (arrays)
let fruits = ["apple", "banana", "orange"];
for (let fruit of fruits) {
    console.log(fruit);
}

// For...in loop (objects)
let person = {name: "John", age: 30};
for (let key in person) {
    console.log(key + ": " + person[key]);
}
\`\`\`

### While Loops
\`\`\`javascript
let count = 0;
while (count < 3) {
    console.log("Count: " + count);
    count++;
}

// Do-while loop
let input;
do {
    input = prompt("Enter 'quit' to exit:");
} while (input !== "quit");
\`\`\`

## Functions

### Function Declarations
\`\`\`javascript
// Function declaration
function greet(name) {
    return "Hello, " + name + "!";
}

// Function expression
const add = function(a, b) {
    return a + b;
};

// Arrow function
const multiply = (a, b) => a * b;

// Arrow function with block
const divide = (a, b) => {
    if (b === 0) {
        return "Cannot divide by zero";
    }
    return a / b;
};
\`\`\`

### Advanced Function Concepts
\`\`\`javascript
// Default parameters
function greetWithDefault(name = "World") {
    return "Hello, " + name + "!";
}

// Rest parameters
function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

// Closures
function createCounter() {
    let count = 0;
    return function() {
        return ++count;
    };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
\`\`\`

## Practice Exercises
1. Create a function that determines if a number is prime
2. Build a simple guessing game using loops and conditionals
3. Write a function that calculates factorial using recursion
4. Create a closure that maintains private state`,
        goals: ['Master control structures', 'Create effective functions', 'Understand scope and closures'],
        timeEstimate: 75,
        dayIndex: 3,
        status: 'locked'
      }
    ]
    
    // Add more topics for remaining days
    for (let day = 4; day <= 7; day++) {
      topics.push({
        title: `Advanced JavaScript - Day ${day}`,
        description: `Advanced concepts and practical applications - Day ${day}`,
        content: `# Advanced JavaScript - Day ${day}

This lesson covers advanced JavaScript concepts that will help you become a proficient developer.

## Learning Objectives
- Master advanced JavaScript features
- Build real-world applications
- Understand modern JavaScript patterns
- Practice with complex scenarios

## Key Topics for Day ${day}

### Advanced Concepts
- Object-oriented programming
- Asynchronous JavaScript (Promises, async/await)
- Modern ES6+ features
- Error handling and debugging

### Practical Applications
- DOM manipulation
- Event handling
- API integration
- Project development

## Code Examples
\`\`\`javascript
// Modern JavaScript example
class Calculator {
    constructor() {
        this.history = [];
    }
    
    async calculate(operation, a, b) {
        try {
            let result;
            switch(operation) {
                case 'add':
                    result = a + b;
                    break;
                case 'subtract':
                    result = a - b;
                    break;
                default:
                    throw new Error('Invalid operation');
            }
            
            this.history.push({operation, a, b, result});
            return result;
        } catch (error) {
            console.error('Calculation error:', error);
            throw error;
        }
    }
    
    getHistory() {
        return [...this.history];
    }
}

// Usage
const calc = new Calculator();
calc.calculate('add', 5, 3).then(result => {
    console.log('Result:', result);
});
\`\`\`

## Practice Projects
1. Build a todo list application
2. Create a weather app using APIs
3. Develop a simple game
4. Build a calculator with history

## Next Steps
Continue practicing with real projects and explore JavaScript frameworks like React, Vue, or Angular.`,
        goals: [`Master Day ${day} concepts`, 'Build practical applications', 'Integrate advanced features'],
        timeEstimate: 60,
        dayIndex: day,
        status: 'locked'
      })
    }
    
    // Create topics in database
    for (const topicData of topics) {
      const topic = await prisma.topic.create({
        data: {
          ...topicData,
          learningPlanId
        }
      })
      
      // Create a quiz for each topic
      await prisma.quiz.create({
        data: {
          title: `${topicData.title} - Mastery Quiz`,
          description: `Test your understanding of ${topicData.title.toLowerCase()}`,
          questions: [
            {
              id: 1,
              type: 'multiple_choice',
              question: `What is the main focus of ${topicData.title}?`,
              options: ['Basic concepts', 'Advanced theory', 'Practical application', 'All of the above'],
              correctAnswer: 3,
              explanation: 'This topic covers multiple aspects of the subject.',
              points: 25
            },
            {
              id: 2,
              type: 'multiple_choice',
              question: 'Which approach is most effective for learning this topic?',
              options: ['Memorization only', 'Understanding and practice', 'Speed reading', 'Passive listening'],
              correctAnswer: 1,
              explanation: 'Understanding combined with practice leads to mastery.',
              points: 25
            },
            {
              id: 3,
              type: 'multiple_choice',
              question: 'What should you do after completing this lesson?',
              options: ['Move to next topic immediately', 'Practice with exercises', 'Skip the review', 'Forget about it'],
              correctAnswer: 1,
              explanation: 'Practice is essential for mastering programming concepts.',
              points: 25
            },
            {
              id: 4,
              type: 'multiple_choice',
              question: 'How can you best retain the information from this lesson?',
              options: ['Read once quickly', 'Take notes and practice', 'Watch videos only', 'Memorize everything'],
              correctAnswer: 1,
              explanation: 'Active learning through notes and practice improves retention.',
              points: 25
            }
          ],
          passingScore: 70,
          topicId: topic.id
        }
      })
    }
    
    console.log(`Successfully added ${topics.length} topics and quizzes for learning plan ${learningPlanId}`)
    
  } catch (error) {
    console.error('Error adding sample content:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSampleContent()
