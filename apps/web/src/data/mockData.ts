import { DashboardStat, Recommendation } from "@/types";

export const dashboardStats: DashboardStat[] = [
  {
    title: "Career Readiness",
    value: "78%",
    description: "Based on skills, resume and target role",
  },
  {
    title: "Recommended Internships",
    value: "12",
    description: "AI-matched opportunities for your profile",
  },
  {
    title: "Profile Strength",
    value: "82%",
    description: "Your resume and profile completion score",
  },
];

export const recommendations: Recommendation[] = [
  {
    id: "rec-1",
    internshipTitle: "Frontend Developer Intern",
    companyName: "TechNova",
    location: "Remote",
    remoteOk: true,
    deadline: "30 July 2026",
    matchBreakdown: {
      skillMatch: 86,
      domainMatch: 78,
      educationMatch: 82,
      experienceMatch: 70,
      compositeScore: 84,
      matchedSkills: ["React", "TypeScript", "Tailwind CSS"],
      missingSkills: ["Testing", "Next.js Advanced"],
      narrative:
        "You are a strong match because your frontend skills align well with this internship. Improving testing knowledge can make your profile stronger.",
    },
  },
  {
    id: "rec-2",
    internshipTitle: "UI/UX Engineering Intern",
    companyName: "BrightApps",
    location: "Dhaka",
    remoteOk: false,
    deadline: "12 August 2026",
    matchBreakdown: {
      skillMatch: 76,
      domainMatch: 72,
      educationMatch: 80,
      experienceMatch: 64,
      compositeScore: 75,
      matchedSkills: ["HTML", "CSS", "Figma", "React"],
      missingSkills: ["Accessibility", "Design System"],
      narrative:
        "This internship fits your UI interest. Learning accessibility and design system basics will improve your match score.",
    },
  },
  {
    id: "rec-3",
    internshipTitle: "React Developer Intern",
    companyName: "CodeBridge",
    location: "Hybrid",
    remoteOk: true,
    deadline: "20 August 2026",
    matchBreakdown: {
      skillMatch: 81,
      domainMatch: 75,
      educationMatch: 79,
      experienceMatch: 66,
      compositeScore: 80,
      matchedSkills: ["React", "JavaScript", "CSS"],
      missingSkills: ["API Integration", "Unit Testing"],
      narrative:
        "Your React knowledge makes this a good match. Focus on API integration and unit testing to improve your readiness.",
    },
  },
];