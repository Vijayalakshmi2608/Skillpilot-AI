import type { EntranceExam } from "@/types";

export const exams: EntranceExam[] = [
  { id: "jee-main", name: "JEE Main", conductingBody: "NTA", level: "UG Entrance", mode: "Online", examDate: "Jan 2027", registrationDeadline: "Dec 2026", seats: "12,00,000+", domains: ["Engineering", "B.Arch", "B.Plan"], color: "blue" },
  { id: "jee-adv", name: "JEE Advanced", conductingBody: "IIT Joint Board", level: "UG Entrance", mode: "Online", examDate: "May 2027", registrationDeadline: "Apr 2027", seats: "2,50,000 (top JEE Main)", domains: ["IIT Admissions", "Engineering"], color: "indigo" },
  { id: "neet", name: "NEET-UG", conductingBody: "NTA", level: "UG Entrance", mode: "Offline", examDate: "May 2027", registrationDeadline: "Apr 2027", seats: "1,10,000 MBBS", domains: ["MBBS", "BDS", "AYUSH"], color: "emerald" },
  { id: "cuet", name: "CUET-UG", conductingBody: "NTA", level: "UG Entrance", mode: "Online", examDate: "May 2027", registrationDeadline: "Mar 2027", seats: "13L+ applications", domains: ["Central Universities", "B.Com", "BA", "B.Sc"], color: "violet" },
  { id: "clat", name: "CLAT", conductingBody: "Consortium of NLUs", level: "UG Entrance", mode: "Offline", examDate: "Dec 2026", registrationDeadline: "Nov 2026", seats: "2,500+ NLU", domains: ["BA LLB", "Law"], color: "red" },
  { id: "nift", name: "NIFT Entrance", conductingBody: "NIFT", level: "UG Entrance", mode: "Hybrid", examDate: "Feb 2027", registrationDeadline: "Dec 2026", seats: "1,800+", domains: ["Fashion Design", "Management"], color: "fuchsia" },
  { id: "nid", name: "NID DAT", conductingBody: "NID", level: "UG Entrance", mode: "Offline", examDate: "Jan 2027", registrationDeadline: "Nov 2026", seats: "300+", domains: ["Design", "B.Des"], color: "rose" },
  { id: "nda", name: "NDA", conductingBody: "UPSC", level: "Class 12", mode: "Offline", examDate: "Apr 2027", registrationDeadline: "Feb 2027", seats: "400+", domains: ["Army", "Navy", "Air Force"], color: "slate" },
  { id: "cet-mh", name: "MHT-CET", conductingBody: "State CET Cell", level: "UG Entrance", mode: "Online", examDate: "May 2027", registrationDeadline: "Apr 2027", seats: "4L+", domains: ["Engineering", "Pharmacy"], color: "amber" },
  { id: "tnea", name: "TNEA (Anna Univ)", conductingBody: "Anna University", level: "UG Entrance", mode: "Offline", examDate: "Jun 2027", registrationDeadline: "May 2027", seats: "1.8L+", domains: ["Engineering", "TN Colleges"], color: "cyan" },
  { id: "kcet", name: "KCET", conductingBody: "KEA", level: "UG Entrance", mode: "Offline", examDate: "Apr 2027", registrationDeadline: "Mar 2027", seats: "2L+", domains: ["Engineering", "Medical Allied"], color: "teal" },
  { id: "nta-ugc", name: "NDA / CDS (Defence)", conductingBody: "UPSC", level: "Class 12", mode: "Offline", examDate: "Sep 2026", registrationDeadline: "Jul 2026", seats: "500+", domains: ["Defence Services"], color: "orange" },
  { id: "bitsat", name: "BITSAT", conductingBody: "BITS Pilani", level: "UG Entrance", mode: "Online", examDate: "Jun 2027", registrationDeadline: "Apr 2027", seats: "4,000+", domains: ["Engineering", "Pharmacy"], color: "purple" },
  { id: "viteee", name: "VITEEE", conductingBody: "VIT", level: "UG Entrance", mode: "Online", examDate: "Apr 2027", registrationDeadline: "Mar 2027", seats: "15,000+", domains: ["Engineering", "Design"], color: "blue" },
  { id: "srmjeee", name: "SRMJEEE", conductingBody: "SRM", level: "UG Entrance", mode: "Online", examDate: "Apr 2027", registrationDeadline: "Feb 2027", seats: "12,000+", domains: ["Engineering"], color: "rose" },
];
