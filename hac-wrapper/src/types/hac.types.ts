// HAC API Types

export interface HACCredentials {
  hacUrl: string;
  username: string;
  password: string;
}

export interface EncryptedCredentials {
  encryptedUsername: string;
  encryptedPassword: string;
  salt: string;
  iv: string;
}

export interface StudentInfo {
  name: string;
}

export interface ClassInfo {
  className: string;
  teacher: string;
  period: string;
  grade: string;
  average: number;
}

export interface Assignment {
  name: string;
  category: string;
  dateAssigned: string;
  dateDue: string;
  score: string;
  totalPoints: string;
  weight: string;
}

export interface Transcript {
  year: string;
  courses: TranscriptCourse[];
}

export interface TranscriptCourse {
  courseName: string;
  grade: string;
  credit: string;
  level: string;
}

export interface IPR {
  reportingPeriod: string;
  classes: IPRClass[];
}

export interface IPRClass {
  className: string;
  teacher: string;
  grade: string;
  absences: number;
  tardies: number;
}

export interface ReportCard {
  reportingPeriod: string;
  classes: ReportCardClass[];
}

export interface ReportCardClass {
  className: string;
  teacher: string;
  grade: string;
  average: number;
  absences: number;
  tardies: number;
}

export interface Schedule {
  classes: ScheduleClass[];
}

export interface ScheduleClass {
  period: string;
  courseName: string;
  teacher: string;
  room: string;
  days: string;
  startTime: string;
  endTime: string;
}

export interface ClassGrades {
  className: string;
  teacher: string;
  period: string;
  categories: GradeCategory[];
  assignments: Assignment[];
}

export interface GradeCategory {
  name: string;
  weight: string;
  average: string;
}

export interface HACApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
