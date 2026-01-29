export interface Experience {
  company: string;
  title: string;
  location: string;
  dates: string;
  scope?: string;
  highlights: string[];
  keywords: string[];
}

export interface Education {
  degree: string;
  institution: string;
  location?: string;
  dates: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  nationality: string;
  languages: string;
}

export interface MasterCVData {
  personalInfo: PersonalInfo;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: Record<string, string[]>;
  certifications: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
