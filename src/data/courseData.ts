export interface Lesson {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
  unlocked: boolean;
}

export interface Module {
  id: number;
  month: number;
  title: string;
  lessons: Lesson[];
}

export interface Tier {
  name: string;
  months: string;
  badge: 'basic' | 'intermediate' | 'advanced';
  modules: Module[];
  totalLessons: number;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  streak: number;
}

export const currentUser = {
  name: "Sardor Rakhimov",
  avatar: "SR",
  points: 1240,
  streak: 12,
  completedLessons: 18,
  totalLessons: 108,
};

export const leaderboard: LeaderboardUser[] = [
  { rank: 1, name: "Aziza Karimova", avatar: "AK", points: 2850, streak: 34 },
  { rank: 2, name: "Bobur Toshmatov", avatar: "BT", points: 2340, streak: 21 },
  { rank: 3, name: "Sardor Rakhimov", avatar: "SR", points: 1240, streak: 12 },
  { rank: 4, name: "Dilnoza Umarova", avatar: "DU", points: 980, streak: 8 },
  { rank: 5, name: "Eldor Hasanov", avatar: "EH", points: 720, streak: 5 },
  { rank: 6, name: "Feruza Alimova", avatar: "FA", points: 560, streak: 3 },
  { rank: 7, name: "Gulnora Saidova", avatar: "GS", points: 340, streak: 2 },
];

const makeLessons = (start: number, count: number, unlockedUpTo: number): Lesson[] =>
  Array.from({ length: count }, (_, i) => ({
    id: start + i,
    title: lessonTitles[start + i - 1] || `Lesson ${start + i}`,
    duration: `${12 + Math.floor(Math.random() * 20)}min`,
    completed: start + i <= unlockedUpTo - 1,
    unlocked: start + i <= unlockedUpTo,
  }));

const lessonTitles = [
  // Month 1 (1-12)
  "Python Setup & Environment", "Variables & Data Types", "Strings & String Methods",
  "Numbers & Math Operations", "Lists & Tuples", "Dictionaries & Sets",
  "Conditionals (if/elif/else)", "For & While Loops", "Functions Basics",
  "Function Arguments & Returns", "File I/O Operations", "Error Handling (try/except)",
  // Month 2 (13-24)
  "Modules & Packages", "List Comprehensions", "Lambda Functions",
  "Map, Filter, Reduce", "Object-Oriented Programming", "Classes & Objects",
  "Inheritance & Polymorphism", "Decorators", "Generators & Iterators",
  "Regular Expressions", "Working with JSON", "Python Project: CLI To-Do App",
  // Month 3 (25-36)
  "Intro to Web Development", "HTTP & REST Fundamentals", "Django Installation & Setup",
  "Django Project Structure", "URL Routing & Views", "Django Templates Basics",
  "Template Inheritance", "Static Files & Media", "Django Models & ORM",
  "Database Migrations", "Django Admin Panel", "CRUD Operations",
  // Month 4 (37-48)
  "Django Forms", "Form Validation", "Class-Based Views", "Authentication System",
  "User Registration", "Login & Logout", "Permissions & Groups",
  "Django REST Framework Intro", "Serializers", "API Views & ViewSets",
  "API Authentication", "Project: E-commerce Backend",
  // Month 5 (49-60)
  "E-commerce: Product Models", "E-commerce: Cart Logic", "E-commerce: Order System",
  "E-commerce: Payment Integration", "E-commerce: Search & Filters",
  "E-commerce: Reviews & Ratings", "E-commerce: Admin Dashboard",
  "E-commerce: API Endpoints", "E-commerce: Testing Basics",
  "E-commerce: Unit Tests", "E-commerce: Integration Tests", "E-commerce: Deployment Prep",
  // Month 6 (61-72)
  "PostgreSQL Deep Dive", "Database Optimization", "Query Performance",
  "Caching with Redis", "Celery Task Queue", "Background Jobs",
  "Email Notifications", "File Upload & S3", "Docker Basics",
  "Docker Compose for Django", "CI/CD Pipeline Basics", "E-commerce Final Project Review",
  // Month 7 (73-84)
  "WebSocket Fundamentals", "Django Channels Setup", "ASGI vs WSGI",
  "Real-time Chat: Models", "Real-time Chat: Consumers", "Real-time Chat: Routing",
  "Chat UI with JavaScript", "Group Chat Implementation", "Online Status Tracking",
  "Message Read Receipts", "File Sharing in Chat", "Chat Notifications",
  // Month 8 (85-96)
  "Advanced Django Patterns", "Custom Middleware", "Signal Handlers",
  "Multi-tenancy Basics", "API Rate Limiting", "GraphQL with Django",
  "Microservices Architecture", "Service Communication", "Event-Driven Design",
  "Monitoring & Logging", "Performance Profiling", "Security Best Practices",
  // Month 9 (97-108)
  "AWS/Cloud Deployment", "Nginx & Gunicorn", "SSL & Domain Setup",
  "Kubernetes Basics", "Scaling Strategies", "Database Replication",
  "Final Project Planning", "Final Project Development", "Code Review & Refactoring",
  "Testing & QA", "Production Deployment", "Course Graduation & Next Steps",
];

export const tiers: Tier[] = [
  {
    name: "Basic",
    months: "Months 1-2",
    badge: "basic",
    totalLessons: 24,
    modules: [
      { id: 1, month: 1, title: "Python Fundamentals", lessons: makeLessons(1, 12, 19) },
      { id: 2, month: 2, title: "Advanced Python Basics", lessons: makeLessons(13, 12, 19) },
    ],
  },
  {
    name: "Intermediate",
    months: "Months 3-6",
    badge: "intermediate",
    totalLessons: 48,
    modules: [
      { id: 3, month: 3, title: "Django Foundations", lessons: makeLessons(25, 12, 19) },
      { id: 4, month: 4, title: "Django REST & Auth", lessons: makeLessons(37, 12, 19) },
      { id: 5, month: 5, title: "E-commerce Project", lessons: makeLessons(49, 12, 19) },
      { id: 6, month: 6, title: "DevOps & Optimization", lessons: makeLessons(61, 12, 19) },
    ],
  },
  {
    name: "Advanced",
    months: "Months 7-9",
    badge: "advanced",
    totalLessons: 36,
    modules: [
      { id: 7, month: 7, title: "Real-time Chat Project", lessons: makeLessons(73, 12, 19) },
      { id: 8, month: 8, title: "Advanced Patterns", lessons: makeLessons(85, 12, 19) },
      { id: 9, month: 9, title: "Deployment & Graduation", lessons: makeLessons(97, 12, 19) },
    ],
  },
];

export const sampleLessonContent = `
## Variables & Data Types in Python

Python is a **dynamically typed** language, meaning you don't need to declare variable types explicitly.

### Basic Data Types

| Type | Example | Description |
|------|---------|-------------|
| \`int\` | \`42\` | Integer numbers |
| \`float\` | \`3.14\` | Floating-point numbers |
| \`str\` | \`"hello"\` | Text strings |
| \`bool\` | \`True\` | Boolean values |

### Variable Assignment

\`\`\`python
# Simple variable assignment
name = "Django Developer"
age = 25
is_student = True
gpa = 3.8

# Multiple assignment
x, y, z = 1, 2, 3

# Type checking
print(type(name))   # <class 'str'>
print(type(age))    # <class 'int'>
\`\`\`

### Type Conversion

\`\`\`python
# Converting between types
num_str = "42"
num_int = int(num_str)    # String to Integer
num_float = float(num_str) # String to Float

# Be careful with invalid conversions!
try:
    invalid = int("hello")  # This will raise ValueError
except ValueError as e:
    print(f"Error: {e}")
\`\`\`

> 💡 **Pro Tip:** Always use meaningful variable names. \`user_age\` is better than \`x\`.

### Practice Task

Write a program that:
1. Creates variables for a student's name, age, and GPA
2. Prints a formatted string with all the information
3. Converts the GPA to a percentage (multiply by 25)
`;

export const sampleCode = `# Variables & Data Types Practice
# Complete the code below

# 1. Create variables for a student
student_name = "Ali"
student_age = 20
student_gpa = 3.6

# 2. Print formatted information
print(f"Student: {student_name}")
print(f"Age: {student_age}")
print(f"GPA: {student_gpa}")

# 3. Convert GPA to percentage
percentage = student_gpa * 25
print(f"Percentage: {percentage}%")
`;
