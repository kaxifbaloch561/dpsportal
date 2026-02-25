export interface Subject {
  id: string;
  name: string;
  icon: string;
}

export interface ClassData {
  id: number;
  name: string;
  subjects: Subject[];
}

const commonSubjects: Subject[] = [
  { id: "english", name: "English", icon: "BookText" },
  { id: "mathematics", name: "Mathematics", icon: "Calculator" },
  { id: "urdu", name: "Urdu", icon: "PenLine" },
  { id: "islamiat", name: "Islamiat", icon: "Moon" },
];

const scienceSubjects: Subject[] = [
  ...commonSubjects,
  { id: "science", name: "Science", icon: "FlaskConical" },
  { id: "computer", name: "Computer", icon: "Monitor" },
  { id: "social-studies", name: "Social Studies", icon: "Globe" },
];

export const classesData: ClassData[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Class ${i + 1}`,
  subjects: i < 5 ? [...commonSubjects, { id: "general-science", name: "General Science", icon: "Atom" }, { id: "social-studies", name: "Social Studies", icon: "Globe" }] : scienceSubjects,
}));

export interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
}

// Placeholder chapters — will be replaced by database content
export const getChapters = (classId: number, subjectId: string): Chapter[] => {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `ch-${i + 1}`,
    number: i + 1,
    title: `Chapter ${i + 1}`,
    content: `This is placeholder content for Chapter ${i + 1} of ${subjectId} in Class ${classId}. The actual content will be loaded from the school's official course books once connected to the database.`,
  }));
};
