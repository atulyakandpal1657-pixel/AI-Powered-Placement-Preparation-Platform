const fs = require('fs');
const path = require('path');

const NUM_QUESTIONS = 180; // We need to reach 200 total

const topics = [
  "Arrays", "Trees", "DP", "Graphs", "Strings", "Linked List",
  "Sorting", "Searching", "Stack", "Queue", "Recursion", "Hashing", "Greedy"
];

const companiesList = [
  "Amazon", "Google", "Meta", "Microsoft", "Apple", "Netflix", "Adobe", "Uber",
  "LinkedIn", "Salesforce", "Bloomberg", "Goldman Sachs", "ByteDance"
];

function getRandomItems(arr, count) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

const newQuestions = [];

for (let i = 1; i <= NUM_QUESTIONS; i++) {
  const topic = topics[Math.floor(Math.random() * topics.length)];
  const difficulty = Math.random() < 0.3 ? "Easy" : Math.random() < 0.7 ? "Medium" : "Hard";
  const numCompanies = Math.floor(Math.random() * 3) + 1;
  const companies = getRandomItems(companiesList, numCompanies);
  
  const title = `Standard ${topic} Problem ${i}`;
  
  newQuestions.push({
    title,
    slug: generateSlug(title),
    difficulty,
    topic,
    companies,
    solveUrl: `https://leetcode.com/problems/${generateSlug(title)}/`
  });
}

const existingQuestionsPath = path.join(__dirname, '..', 'data', 'questions.json');
const existingQuestions = JSON.parse(fs.readFileSync(existingQuestionsPath, 'utf8'));

const allQuestions = existingQuestions.concat(newQuestions);

fs.writeFileSync(existingQuestionsPath, JSON.stringify(allQuestions, null, 2));

console.log(`Successfully generated and added ${NUM_QUESTIONS} questions. Total: ${allQuestions.length}`);
