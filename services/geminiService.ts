import { GoogleGenAI } from "@google/genai";
import { MasterCVData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTailoredCV = async (
  masterCV: MasterCVData,
  jobDescription: string,
  userContext: string
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

--------------------------------------------------
EXECUTION GUIDELINES:

1.  **Strategic Alignment**: Identify the top 3 core competencies in the JD. Reorder and rewrite the "Skills" and "Experience" sections to prioritize these.
2.  **Impact-First Writing**: Rewrite every bullet point using the "Action Verb + Task + Quantifiable Result" formula.
3.  **Space Economy**: Max 450 words. Combine related bullets.

--------------------------------------------------
FORMAT REQUIREMENTS (STRICT MARKDOWN):

1.  **METADATA HEADER**: The VERY FIRST line of your response MUST be a metadata tag containing the Company Name and Job Title extracted from the JD.
    Format: \`<!-- METADATA: Company_Name_Job_Title -->\`
    *   Replace spaces with underscores (_).
    *   Example: \`<!-- METADATA: LOreal_Ecommerce_Manager -->\` or \`<!-- METADATA: Google_Product_Owner -->\`.
    *   Do NOT add date or extension here.

2.  **CV CONTENT**:
    *   **Structure**: Follow the template below.
    *   **Dates**: Use '####' for the Date/Location line.
    *   **Contact**: Ensure the LinkedIn URL is written out fully (e.g., https://linkedin.com/...) so it can be hyperlinked.
    *   **Skills**: Use the format "- **Category**: Skill, Skill". The category MUST be bolded.

**Markdown Template**:

# [Name]
[Email] | [Phone] | [Location] | [Full LinkedIn URL]

## PROFESSIONAL SUMMARY
[A single, justified, punchy paragraph of 3-4 lines maximum.]

## KEY SKILLS
- **[Category Name]**: [Skill], [Skill], [Skill], [Skill]
- **[Category Name]**: [Skill], [Skill], [Skill]

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

export const chatWithAI = async (
  history: { role: 'user' | 'model'; content: string }[],
  newMessage: string
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are a pragmatic, expert Career Coach. Give brief, actionable advice. If the user asks to rewrite a bullet point, provide the specific Markdown text they can copy.",
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
