import type { AssessmentQuestion } from "@/types";

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "q1",
    question: "Which activity do you enjoy the most in your free time?",
    icon: "sparkles",
    options: ["Building apps or tinkering with tech", "Reading or writing stories", "Solving puzzles and numbers", "Helping people or mentoring others", "Sketching, designing or creating"],
  },
  {
    id: "q2",
    question: "How do you prefer to study for an exam?",
    icon: "book",
    options: ["Practice problems and mock tests", "Group discussions", "Visual diagrams and mind maps", "Teaching the topic to someone else", "Real-world examples and case studies"],
  },
  {
    id: "q3",
    question: "Pick the subject you find most fascinating.",
    icon: "target",
    options: ["Computer Science", "Biology / Chemistry", "Math / Physics", "Economics / Commerce", "History / Civics"],
  },
  {
    id: "q4",
    question: "What kind of work environment suits you best?",
    icon: "users",
    options: ["Solo deep work with headphones on", "Team projects with brainstorming", "Field work and travel", "Structured office environment", "Flexible remote work"],
  },
  {
    id: "q5",
    question: "When faced with a tough problem, you usually...",
    icon: "brain",
    options: ["Break it into smaller steps logically", "Ask someone with experience", "Research and try new approaches", "Follow a proven process", "Think outside the box creatively"],
  },
  {
    id: "q6",
    question: "Which outcome matters most to you in a career?",
    icon: "rocket",
    options: ["High salary and fast growth", "Job security and stability", "Making a social impact", "Creative expression", "Flexibility and independence"],
  },
  {
    id: "q7",
    question: "How comfortable are you with public speaking or presenting?",
    icon: "mic",
    options: ["Very comfortable — I love it", "Comfortable with preparation", "Okay if the topic is mine", "Not a fan, but I manage", "I avoid it whenever possible"],
  },
  {
    id: "q8",
    question: "Which of these sounds like an ideal weekend project?",
    icon: "wrench",
    options: ["Building a website or app", "Conducting a science experiment", "Managing a small budget or event", "Volunteering for a cause", "Creating art, music or video"],
  },
];

export const assessmentResultDomains = [
  { id: "ai-ml-engineer", title: "AI / ML Engineer", domain: "Artificial Intelligence", match: 92 },
  { id: "fullstack-developer", title: "Full-Stack Developer", domain: "Software Engineering", match: 88 },
  { id: "data-scientist", title: "Data Scientist", domain: "Data Science", match: 86 },
  { id: "cyber-security", title: "Cyber Security Analyst", domain: "Cyber Security", match: 82 },
  { id: "graphic-designer", title: "Graphic Designer", domain: "Graphic Design", match: 78 },
  { id: "entrepreneur", title: "Entrepreneur", domain: "Entrepreneurship", match: 74 },
  { id: "mbbs-doctor", title: "Doctor (MBBS)", domain: "Medicine", match: 76 },
  { id: "chartered-accountant", title: "Chartered Accountant", domain: "Commerce", match: 70 },
  { id: "civil-services", title: "Civil Servant (IAS/IPS)", domain: "UPSC", match: 72 },
  { id: "digital-marketer", title: "Digital Marketer", domain: "Marketing", match: 76 },
];
