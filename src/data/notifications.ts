import type { AppNotification } from "@/types";

export const notifications: AppNotification[] = [
  { id: "n1", title: "NEET-UG registration opens soon", message: "Registration for NEET 2027 opens in December. Complete your profile to get a personalized checklist.", time: "2h ago", type: "exam", read: false },
  { id: "n2", title: "NTSE scholarship deadline approaching", message: "The NTSE application closes Nov 2026. You match 3 of 4 eligibility criteria — apply now!", time: "5h ago", type: "scholarship", read: false },
  { id: "n3", title: "Your Career DNA report is ready", message: "Your updated DNA report now reflects your latest assessment results. View your new career matches.", time: "1d ago", type: "career", read: false },
  { id: "n4", title: "New AI recommendation available", message: "Based on your profile, we found 3 new career matches with high compatibility scores.", time: "1d ago", type: "career", read: true },
  { id: "n5", title: "JEE Main mock test series", message: "A new 5-test series for JEE Main January 2027 session is now available in Resources.", time: "2d ago", type: "system", read: true },
  { id: "n6", title: "College Finder update", message: "We've added 120 new colleges with 2026 cutoff data. Refresh your saved list.", time: "3d ago", type: "exam", read: true },
  { id: "n7", title: "Profile completion reminder", message: "Your profile is 78% complete. Add your board scores for better career matching.", time: "4d ago", type: "system", read: true },
  { id: "n8", title: "Scholarship: Tata Trusts deadline", message: "Tata Scholarship applications close soon. Your income profile suggests eligibility.", time: "5d ago", type: "scholarship", read: true },
];
