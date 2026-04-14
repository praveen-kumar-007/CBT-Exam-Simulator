import fs from 'fs';
const path = 'c:/Users/impra/OneDrive/Desktop/New folder/CBT-Exam-Simulator/admin/AdminApp.tsx';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');
// We want to remove lines 2568 and 2569 (1-indexed)
// which are indices 2567 and 2568 (0-indexed)
lines.splice(2567, 2); 
fs.writeFileSync(path, lines.join('\n'));
console.log('Fixed file');
