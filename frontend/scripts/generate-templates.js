#!/usr/bin/env node

/**
 * CSV Template Generator for ExclusiveGrades
 * This script generates sample CSV templates for different operations
 */

const fs = require('fs');
const path = require('path');

const templates = {
  students: `first_name,surname,last_name,admission_number,class,sex,dob
John,D.,Doe,ADM-2024-001,SS1,M,2008-03-15
Jane,,Smith,ADM-2024-002,SS1,F,2008-05-20
Michael,C.,Johnson,ADM-2024-003,SS1,M,2008-01-10`,

  results: `student_name,admission_number,mathematics,english,physics,chemistry,biology,average,grade
John Doe,ADM-2024-001,85,92,88,90,87,88.4,A
Jane Smith,ADM-2024-002,75,80,78,82,79,78.8,B
Michael Johnson,ADM-2024-003,92,88,95,91,89,91.0,A`,

  teachers: `first_name,last_name,email,subject
Amara,Williams,amara.williams@school.com,Mathematics
Chidi,Okafor,chidi.okafor@school.com,English Language
Zainab,Hassan,zainab.hassan@school.com,Physics`,

  classes: `class_name,class_code,form_teacher,form_teacher_email
Senior Secondary 1,SS1,Mr. Emeka,emeka.nwankwo@school.com
Senior Secondary 2,SS2,Mrs. Grace,grace.adeyemi@school.com
Junior Secondary 3,JS3,Mr. Ade,ade.osei@school.com`,
};

const args = process.argv.slice(2);
const templateType = args[0] || 'students';

if (!templates[templateType]) {
  console.error(`Unknown template: ${templateType}`);
  console.log('Available templates:', Object.keys(templates).join(', '));
  process.exit(1);
}

const filename = `template-${templateType}.csv`;
const filepath = path.join(__dirname, filename);

try {
  fs.writeFileSync(filepath, templates[templateType]);
  console.log(`✓ Template created: ${filename}`);
} catch (error) {
  console.error(`✗ Error creating template:`, error.message);
  process.exit(1);
}
