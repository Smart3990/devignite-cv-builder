import type { Cv } from "@shared/schema";

// Content enhancement for CV data (ATS optimization and professional formatting)
export function enhanceCVContent(cv: Cv): Cv {
  return {
    ...cv,
    // Capitalize name properly
    fullName: capitalizeWords(cv.fullName),
    
    // Enhance summary with better formatting
    summary: cv.summary ? enhanceSummary(cv.summary) : cv.summary,
    
    // Enhance experience descriptions
    experience: cv.experience?.map(exp => ({
      ...exp,
      title: capitalizeWords(exp.title),
      company: capitalizeWords(exp.company),
      description: enhanceDescription(exp.description),
    })) || [],
    
    // Enhance education
    education: cv.education?.map(edu => ({
      ...edu,
      degree: capitalizeWords(edu.degree),
      institution: capitalizeWords(edu.institution),
      description: edu.description ? enhanceDescription(edu.description) : edu.description,
    })) || [],
    
    // Capitalize and trim skills
    skills: cv.skills?.map(skill => capitalizeWords(skill.trim())) || [],
  };
}

// Capitalize words properly (handles titles like "senior software engineer")
function capitalizeWords(text: string): string {
  if (!text) return text;
  
  // Words that should stay lowercase (articles, prepositions, conjunctions)
  const lowercase = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'of', 'in', 'with']);
  
  const words = text.trim().split(/\s+/);
  
  return words.map((word, index) => {
    const lower = word.toLowerCase();
    
    // Always capitalize first word
    if (index === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    
    // Keep acronyms uppercase if they're all caps
    if (word.length <= 4 && word === word.toUpperCase() && /^[A-Z]+$/.test(word)) {
      return word;
    }
    
    // Lowercase small words, capitalize others
    if (lowercase.has(lower)) {
      return lower;
    }
    
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

// Enhance summary text (professional formatting)
function enhanceSummary(summary: string): string {
  if (!summary) return summary;
  
  let enhanced = summary.trim();
  
  // Ensure it starts with a capital letter
  enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
  
  // Ensure it ends with a period
  if (!enhanced.match(/[.!?]$/)) {
    enhanced += '.';
  }
  
  // Fix multiple spaces
  enhanced = enhanced.replace(/\s+/g, ' ');
  
  // Fix spacing around punctuation
  enhanced = enhanced.replace(/\s+([,.!?;:])/g, '$1');
  enhanced = enhanced.replace(/([,.!?;:])\s*([a-zA-Z])/g, '$1 $2');
  
  return enhanced;
}

// Enhance description text (bullet points, formatting)
function enhanceDescription(description: string): string {
  if (!description) return description;
  
  let enhanced = description.trim();
  
  // Split into bullet points if it contains newlines
  const lines = enhanced.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const enhancedLines = lines.map(line => {
    let enhancedLine = line;
    
    // Ensure each line starts with a capital letter
    enhancedLine = enhancedLine.charAt(0).toUpperCase() + enhancedLine.slice(1);
    
    // Add period if missing and line doesn't end with punctuation
    if (!enhancedLine.match(/[.!?]$/)) {
      enhancedLine += '.';
    }
    
    // Fix multiple spaces
    enhancedLine = enhancedLine.replace(/\s+/g, ' ');
    
    return enhancedLine;
  });
  
  return enhancedLines.join('\n');
}

// ATS optimization keywords (can be expanded)
export function getATSKeywords(role: string): string[] {
  const commonKeywords: Record<string, string[]> = {
    'developer': ['Agile', 'Scrum', 'Git', 'CI/CD', 'Testing', 'Code Review', 'Problem Solving'],
    'designer': ['User Experience', 'User Interface', 'Prototyping', 'Wireframing', 'Design Thinking', 'Figma', 'Adobe Creative Suite'],
    'manager': ['Leadership', 'Team Management', 'Strategic Planning', 'Budget Management', 'Stakeholder Communication', 'Project Delivery'],
    'engineer': ['Technical Analysis', 'System Design', 'Documentation', 'Quality Assurance', 'Performance Optimization'],
  };
  
  const roleLower = role.toLowerCase();
  
  for (const [key, keywords] of Object.entries(commonKeywords)) {
    if (roleLower.includes(key)) {
      return keywords;
    }
  }
  
  return [];
}

// Suggest ATS improvements
export function suggestATSImprovements(cv: Cv): string[] {
  const suggestions: string[] = [];
  
  // Check if summary exists
  if (!cv.summary || cv.summary.length < 100) {
    suggestions.push("Add a professional summary (100+ characters) to highlight your key qualifications");
  }
  
  // Check experience descriptions
  if (cv.experience && cv.experience.length > 0) {
    cv.experience.forEach((exp, index) => {
      if (!exp.description || exp.description.length < 50) {
        suggestions.push(`Add more details to "${exp.title}" role - include achievements and responsibilities`);
      }
    });
  }
  
  // Check skills
  if (!cv.skills || cv.skills.length < 3) {
    suggestions.push("Add more skills (at least 5-10) relevant to your target role for better ATS matching");
  }
  
  // Check for action verbs in experience
  const actionVerbs = ['developed', 'managed', 'led', 'created', 'implemented', 'improved', 'designed', 'built', 'achieved'];
  if (cv.experience && cv.experience.length > 0) {
    const hasActionVerbs = cv.experience.some(exp => 
      actionVerbs.some(verb => exp.description?.toLowerCase().includes(verb))
    );
    
    if (!hasActionVerbs) {
      suggestions.push("Use action verbs (developed, managed, led, achieved) to start experience descriptions");
    }
  }
  
  return suggestions;
}
