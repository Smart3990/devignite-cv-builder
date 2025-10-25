import { groq, DEFAULT_MODEL } from "./groq-client";
import type { Cv } from "@shared/schema";

/**
 * AI-powered CV content optimization using Groq
 * Enhances professional language, improves ATS compatibility, and strengthens impact
 */
export async function optimizeCVContent(cv: Cv): Promise<Cv> {
  try {
    const prompt = `You are an expert CV optimizer and career coach. Optimize the following CV content for maximum professional impact and ATS (Applicant Tracking System) compatibility.

CV Data:
- Name: ${cv.fullName}
- Summary: ${cv.summary || "Not provided"}
- Experience: ${JSON.stringify(cv.experience || [])}
- Education: ${JSON.stringify(cv.education || [])}
- Skills: ${JSON.stringify(cv.skills || [])}

Instructions:
1. Improve the professional summary to be more impactful and keyword-rich
2. Enhance work experience descriptions with strong action verbs and quantifiable achievements
3. Ensure ATS compatibility (clear formatting, relevant keywords)
4. Keep all improvements realistic and professional
5. Return ONLY a JSON object with the optimized content

Return format:
{
  "summary": "optimized professional summary",
  "experience": [array of experience objects with enhanced descriptions],
  "improvementNotes": ["list of 3-5 key improvements made"]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional CV optimization expert. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: DEFAULT_MODEL,
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");

    // Merge optimized content back into CV
    return {
      ...cv,
      summary: result.summary || cv.summary,
      experience: result.experience || cv.experience,
    };
  } catch (error) {
    console.error("CV optimization failed:", error);
    throw new Error(
      error instanceof Error 
        ? `AI optimization failed: ${error.message}` 
        : "Failed to optimize CV. Please try again."
    );
  }
}

/**
 * Generate a professional cover letter based on CV and job details
 */
export async function generateCoverLetter(
  cv: Cv,
  jobTitle: string,
  companyName: string,
  jobDescription?: string
): Promise<{
  fullName: string;
  email: string;
  phone: string;
  location: string;
  date: string;
  companyName: string;
  jobTitle: string;
  content: string;
}> {
  try {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const prompt = `Generate a highly professional, ATS-optimized cover letter for ${cv.fullName} applying for the position of ${jobTitle} at ${companyName}.

APPLICANT INFORMATION:
- Name: ${cv.fullName}
- Email: ${cv.email}
- Phone: ${cv.phone || ""}
- Location: ${cv.location || ""}
- Professional Summary: ${cv.summary || ""}
- Key Skills: ${cv.skills?.join(", ") || ""}
- Recent Experience: ${cv.experience?.[0]?.title || ""} at ${cv.experience?.[0]?.company || ""}
${jobDescription ? `\nJOB DESCRIPTION: ${jobDescription}` : ""}

REQUIREMENTS:
Create an ATS-optimized cover letter following these strict professional standards:

1. OPENING PARAGRAPH (3-4 sentences):
   - Express genuine interest in the specific role and company
   - Mention where you found the position
   - Include a compelling value proposition
   - Use keywords from the job description naturally

2. BODY PARAGRAPH 1 (4-5 sentences):
   - Highlight 2-3 most relevant achievements with quantifiable results
   - Connect your experience directly to job requirements
   - Use strong action verbs (led, achieved, implemented, drove)
   - Include specific metrics and outcomes when possible

3. BODY PARAGRAPH 2 (3-4 sentences):
   - Demonstrate knowledge of the company and its mission
   - Explain why you're a cultural fit
   - Show enthusiasm for contributing to their goals
   - Mention specific company projects or values if known

4. CLOSING PARAGRAPH (2-3 sentences):
   - Reiterate interest and qualification summary
   - Include a clear call to action (request for interview)
   - Express gratitude and professionalism

FORMATTING RULES:
- Use clear, professional business language
- Avoid clichés and generic phrases
- Keep total length 350-450 words
- Use formal but warm tone
- Ensure ATS compatibility (no special characters, clean formatting)

Return ONLY a JSON object:
{
  "content": "the complete cover letter text with proper paragraph breaks using \\n\\n"
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert ATS-optimized cover letter writer with 15 years of experience in recruitment. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: DEFAULT_MODEL,
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
    
    return {
      fullName: cv.fullName,
      email: cv.email,
      phone: cv.phone || "",
      location: cv.location || "",
      date: today,
      companyName,
      jobTitle,
      content: result.content || "",
    };
  } catch (error) {
    console.error("Cover letter generation failed:", error);
    throw new Error("Failed to generate cover letter. Please try again.");
  }
}

/**
 * Optimize LinkedIn profile sections based on CV
 */
export async function optimizeLinkedInProfile(cv: Cv): Promise<{
  fullName: string;
  headline: string;
  about: string;
  experience: string;
  skills: string;
  accomplishments: string;
  suggestions: string[];
}> {
  try {
    const prompt = `Create a comprehensive, highly professional LinkedIn profile optimization for ${cv.fullName} based on their CV.

PROFILE INFORMATION:
- Name: ${cv.fullName}
- Current Title: ${cv.experience?.[0]?.title || ""}
- Current Company: ${cv.experience?.[0]?.company || ""}
- Professional Summary: ${cv.summary || ""}
- Key Skills: ${cv.skills?.join(", ") || ""}
- Experience History: ${JSON.stringify(cv.experience || [])}
- Education: ${JSON.stringify(cv.education || [])}

REQUIREMENTS - Generate the following sections:

1. HEADLINE (120 characters maximum):
   - Include current role or career focus
   - Add 2-3 high-value keywords
   - Make it compelling and searchable
   - Format: "Title | Expertise | Value Proposition"

2. ABOUT SECTION (4-5 well-structured paragraphs, 300-400 words):
   
   PARAGRAPH 1 - Professional Identity (3-4 sentences):
   - Strong opening statement about professional identity
   - Years of experience and core expertise
   - Unique value proposition
   
   PARAGRAPH 2 - Core Competencies (4-5 sentences):
   - Detailed overview of main skills and strengths
   - Specific technologies, methodologies, or approaches
   - Industry-specific expertise
   
   PARAGRAPH 3 - Notable Achievements (3-4 sentences):
   - 2-3 quantifiable achievements with metrics
   - Impact on previous organizations
   - Leadership or innovation highlights
   
   PARAGRAPH 4 - Professional Passion (3-4 sentences):
   - What drives and motivates you professionally
   - Areas of special interest or expertise
   - Future career aspirations or focus areas
   
   PARAGRAPH 5 - Call to Action (2-3 sentences):
   - Open to opportunities or collaborations
   - How people can connect or reach out
   - Professional interests for networking

3. EXPERIENCE SUMMARY (2-3 paragraphs):
   - Synthesize career progression
   - Highlight key roles and industries
   - Emphasize growth trajectory

4. SKILLS OPTIMIZATION (1-2 paragraphs):
   - Categorize skills by relevance
   - Suggest additional skills to add
   - Prioritization recommendations

5. ACCOMPLISHMENTS SECTION (2 paragraphs):
   - Certifications to highlight
   - Projects or publications worth mentioning
   - Awards or recognition

6. PROFILE IMPROVEMENT SUGGESTIONS (7-10 items):
   - Actionable recommendations for profile enhancement
   - SEO and keyword optimization tips
   - Engagement strategies

TONE & STYLE:
- First-person perspective
- Professional yet personable
- Industry-appropriate language
- Authentic and engaging
- ATS and LinkedIn algorithm optimized

Return ONLY a JSON object:
{
  "headline": "optimized headline",
  "about": "complete about section with \\n\\n for paragraph breaks",
  "experience": "experience summary with paragraphs",
  "skills": "skills optimization guidance",
  "accomplishments": "accomplishments section",
  "suggestions": ["array of 7-10 specific improvement suggestions"]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a senior LinkedIn optimization expert and career coach with expertise in personal branding and professional networking. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: DEFAULT_MODEL,
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return {
      fullName: cv.fullName,
      headline: result.headline || "",
      about: result.about || "",
      experience: result.experience || "",
      skills: result.skills || "",
      accomplishments: result.accomplishments || "",
      suggestions: result.suggestions || [],
    };
  } catch (error) {
    console.error("LinkedIn optimization failed:", error);
    throw new Error("Failed to optimize LinkedIn profile. Please try again.");
  }
}

/**
 * Analyze CV and provide ATS optimization score and recommendations
 */
export async function analyzeCVForATS(cv: Cv): Promise<{
  score: number;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
}> {
  try {
    const prompt = `Analyze this CV for ATS (Applicant Tracking System) compatibility and provide a detailed score.

CV Content:
- Summary: ${cv.summary || "None"}
- Experience: ${cv.experience?.length || 0} positions
- Skills: ${cv.skills?.join(", ") || "None"}
- Education: ${cv.education?.length || 0} entries

Evaluate:
1. Keyword optimization (industry-relevant terms)
2. Formatting clarity (simple, scannable structure)
3. Quantifiable achievements (metrics, numbers, percentages)
4. Action verb usage (strong verbs in descriptions)
5. Overall ATS-friendliness

Return ONLY a JSON object:
{
  "score": <number 0-100>,
  "recommendations": ["array of 5-7 specific improvement recommendations"],
  "strengths": ["array of 3-4 current strengths"],
  "weaknesses": ["array of 3-4 areas to improve"]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an ATS and recruitment expert. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: DEFAULT_MODEL,
      temperature: 0.5,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return {
      score: result.score || 0,
      recommendations: result.recommendations || [],
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
    };
  } catch (error) {
    console.error("ATS analysis failed:", error);
    throw new Error("Failed to analyze CV for ATS. Please try again.");
  }
}
