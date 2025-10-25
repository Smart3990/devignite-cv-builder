import type { Cv } from "@shared/schema";

// Dummy CV data for template previews
export const dummyCvData: Cv = {
  id: "dummy-cv-id",
  userId: "dummy-user-id",
  templateId: null,
  fullName: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  phone: "+233 24 123 4567",
  location: "Accra, Ghana",
  website: "www.sarahjohnson.com",
  linkedin: "linkedin.com/in/sarahjohnson",
  summary: "Results-driven Software Engineer with 5+ years of experience in full-stack development. Passionate about building scalable web applications and mentoring junior developers.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Tech Solutions Ltd",
      location: "Accra, Ghana",
      startDate: "2021-03-01",
      current: true,
      description: "• Led development of cloud-based SaaS platform serving 50,000+ users\n• Improved system performance by 40% through optimization\n• Mentored team of 5 junior developers"
    },
    {
      title: "Software Developer",
      company: "Digital Innovations",
      location: "Kumasi, Ghana",
      startDate: "2019-01-01",
      endDate: "2021-02-28",
      current: false,
      description: "• Built and maintained 15+ client web applications\n• Implemented automated testing reducing bugs by 60%\n• Collaborated with design team on UX improvements"
    }
  ],
  education: [
    {
      degree: "B.Sc. Computer Science",
      institution: "University of Ghana",
      location: "Legon, Ghana",
      startDate: "2015-09-01",
      endDate: "2019-06-01",
      current: false,
      description: "First Class Honours, Dean's List all semesters"
    }
  ],
  skills: [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "SQL",
    "AWS",
    "Docker",
    "Git",
    "Agile"
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};
