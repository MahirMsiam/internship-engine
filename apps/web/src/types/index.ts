export type UserRole = "student" | "recruiter";

export type InteractionType = "view" | "save" | "apply" | "dismiss";

export type DashboardStat = {
  title: string;
  value: string;
  description: string;
};

export type MatchBreakdown = {
  skillMatch: number;
  domainMatch: number;
  educationMatch: number;
  experienceMatch: number;
  compositeScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  narrative: string;
};

export type Recommendation = {
  id: string;
  internshipTitle: string;
  companyName: string;
  location: string;
  remoteOk: boolean;
  deadline: string;
  matchBreakdown: MatchBreakdown;
};