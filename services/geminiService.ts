import { GoogleGenAI } from "@google/genai";
import { MasterCVData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTailoredCV = async (
  masterCV: MasterCVData,
  jobDescription: string,
  userContext: string,
  language: 'EN' | 'FR'
): Promise<string> => {
  // Convert Master Data to a string format for the prompt
  const masterCVContext = `
MASTER CV DATA:
PERSONAL INFO:
${JSON.stringify(masterCV.personalInfo, null, 2)}

PROFESSIONAL SUMMARY:
${masterCV.summary}

EXPERIENCES:
${masterCV.experiences.map(exp => `
${exp.company} - ${exp.title} (${exp.dates})
${exp.scope ? `Scope: ${exp.scope}` : ''}
Highlights:
${exp.highlights.map(h => `- ${h}`).join('\n')}
Keywords: ${exp.keywords.join(', ')}
`).join('\n')}

EDUCATION:
${masterCV.education.map(edu => `${edu.degree} - ${edu.institution} (${edu.dates})`).join('\n')}

SKILLS:
${Object.entries(masterCV.skills).map(([cat, skills]) => `${cat}: ${skills.join(', ')}`).join('\n')}

CERTIFICATIONS:
${masterCV.certifications.join(', ')}
`;

  const prompt = `
You are an elite Executive Resume Writer. Your task is to rewrite the Master CV into a **ONE-PAGE**, high-impact, ATS-compliant document tailored specifically to the Job Description.

INPUT DATA:
${masterCVContext}

USER CONTEXT:
${userContext}

JOB DESCRIPTION:
${jobDescription}

TARGET LANGUAGE: ${language === 'FR' ? 'FRENCH (Français)' : 'ENGLISH'}

--------------------------------------------------
EXECUTION GUIDELINES:

1.  **Strategic Alignment**: Identify the top 3 core competencies in the JD. Reorder and rewrite the "Skills" and "Experience" sections to prioritize these.
2.  **Job Titles (STRICT)**:
    *   **L'ORÉAL**: Default to "E-Commerce & Advocacy Manager". ONLY append "/ Commercial Operations Analyst" if the JD emphasizes data, SQL, or P&L analysis.
    *   **NISSAN**: Default to "Product Marketing Specialist". ONLY append "/ Commercial Strategy Analyst" if the JD emphasizes commercial modeling, strategy, or pricing.
    *   **Freelance**: Use "Independent Consultant" but you may elaborate on the specialization (e.g., "Independent Consultant - GenAI & E-Commerce").
3.  **Languages**:
    *   **DO NOT** list "Hindi".
    *   **ALWAYS** include "English (C1)" and "French (A2)" in a "Languages" category within the **KEY SKILLS** section.
    *   **CRITICAL**: Even if the CV is written in French, you MUST explicitly state "Français (A2)" to manage expectations.
4.  **Impact-First Writing**: Rewrite every bullet point using the "Action Verb + Task + Quantifiable Result" formula.

--------------------------------------------------
FORMAT REQUIREMENTS (STRICT MARKDOWN):

1.  **METADATA HEADER**: The VERY FIRST line of your response MUST be a metadata tag.
    Format: \`<!-- METADATA: Company_Name_Job_Title -->\` (Replace spaces with underscores).

2.  **CV CONTENT**:
    *   **Structure**: Follow the template below.
    *   **Dates**: Use '####' for the Date/Location line.
    *   **Contact Line**: Use the exact format: \`[Email] | [Phone] | [Location] | [LinkedIn](https://www.linkedin.com/in/tejaswee98/)\`.
    *   **Skills**: Use the format "- **Category**: Skill, Skill". The category MUST be bolded. Add "Languages" as the last category.

**Markdown Template**:

# [Name]
[Email] | [Phone] | [Location] | [LinkedIn](https://www.linkedin.com/in/tejaswee98/)

## PROFESSIONAL SUMMARY
[A single, justified, punchy paragraph of 3-4 lines maximum.]

## KEY SKILLS
- **[Category Name]**: [Skill], [Skill], [Skill], [Skill]
- **[Category Name]**: [Skill], [Skill], [Skill]
- **Languages**: English (C1), French (A2)

## PROFESSIONAL EXPERIENCE
### [Role Title] | [Company Name]
#### [Dates] | [Location]
- [Strong, quantified bullet point 1]
- [Strong, quantified bullet point 2]
- [Strong, quantified bullet point 3]

## EDUCATION
### [Degree] | [Institution]
#### [Dates]

## CERTIFICATIONS
- [Certification 1]
- [Certification 2]
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 16000 },
      }
    });

    return response.text || "Failed to generate CV.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate CV with Gemini.");
  }
};

export const generateCoverLetter = async (
  masterCV: MasterCVData,
  jobDescription: string,
  language: 'EN' | 'FR'
): Promise<string> => {
  const masterCVContext = JSON.stringify(masterCV, null, 2);

  const prompt = `
You are the candidate (${masterCV.personalInfo.name}) writing a cover letter. 
Your goal is to write a **Human-to-Human**, authentic, and engaging cover letter.

INPUT DATA:
${masterCVContext}

JOB DESCRIPTION:
${jobDescription}

TARGET LANGUAGE: ${language === 'FR' ? 'FRENCH (Français)' : 'ENGLISH'}

--------------------------------------------------
STYLE & FORMAT (STRICT):
1.  **PLAIN TEXT ONLY**: This is CRITICAL. Do NOT use markdown bolding (**), italics (*), or lists (-). Do NOT use bullet points. Write in standard paragraphs only.
2.  **Ready-to-Paste**: The output must be ready to copy-paste directly into an email body or LinkedIn message box. No subject lines, no address headers.
3.  **Concise**: Keep it UNDER 150 words. Short, punchy, direct.
4.  **Tone**: Conversational, confident, yet humble. strictly NO robotic AI phrases like "I am writing to express my interest".
5.  **Language Level**: If writing in French, keep the sentences slightly simpler to reflect an A2/B1 spoken level, even if written perfectly.

--------------------------------------------------
STRUCTURE:

1.  **The Hook**: Start with a sentence that connects your personal story or passion directly to the company's mission or this specific role.
2.  **The "Why Me"**: 2-3 sentences connecting specific past results to the JD problems.
3.  **The Close**: Brief call to action.

Output ONLY the body of the letter.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 8000 },
      }
    });

    return response.text || "Failed to generate Cover Letter.";
  } catch (error) {
    console.error("Gemini CL Error:", error);
    throw new Error("Failed to generate Cover Letter.");
  }
};

export const chatWithAI = async (
  history: { role: 'user' | 'model'; content: string }[],
  newMessage: string,
  currentCVContext: string
): Promise<string> => {
  try {
    const systemInstruction = `
You are a pragmatic, expert Career Coach. 
You have access to the User's currently generated CV below. 
If the user asks to change something, refer to this content.
If the user asks to rewrite a bullet point, provide the specific Markdown text they can copy.

CURRENT CV CONTENT:
${currentCVContext}
`;

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }))
    });

    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};
