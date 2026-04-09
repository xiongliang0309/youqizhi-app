const fs = require('fs');
const path = require('path');

const csvPath = '/Users/xl/我的项目/youqizhi-app/public/images/jobs/desc.csv';
const jobsDir = '/Users/xl/我的项目/youqizhi-app/public/images/jobs';

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');

const jobMap = {};
// Skip header line
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Basic CSV parsing
  const parts = line.split(',');
  if (parts.length >= 4) {
    const name = parts[1].trim();
    // The description might contain commas, so we take everything from index 3 onwards
    const desc = parts.slice(3).join(',').trim();
    jobMap[name] = desc;
  }
}

const files = fs.readdirSync(jobsDir);
const jobData = [];

for (const file of files) {
  if (file.endsWith('.png')) {
    const jobName = file.replace('.png', '');
    const desc = jobMap[jobName];
    
    if (desc) {
      jobData.push(`    { q: '${jobName}', a: '${desc}', icon: '/images/jobs/${file}' }`);
    } else {
      console.log(`Warning: No description found for ${jobName}`);
    }
  }
}

const result = `const SCIENCE_KNOWLEDGE_BASE = {
  job: [
${jobData.join(',\n')}
  ]
};`;

console.log(result);
