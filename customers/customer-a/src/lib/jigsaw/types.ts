export type Role = "employee" | "manager" | "hr";
export type Status = "active" | "leave" | "inactive";
export type Visibility = "private" | "team" | "company";

export type Actor = {
  id: string;
  userId: string | null;
  email: string;
  fullName: string;
  title: string;
  departmentId: string;
  departmentName: string;
  managerId: string | null;
  managerName: string | null;
  role: Role;
  phone: string;
  location: string;
  bio: string;
  startDate: string;
  status: Status;
};

export type Department = {
  id: string;
  name: string;
  code: string;
  description: string;
  headcount: number;
};

export type DocMeta = {
  id: string;
  title: string;
  filename: string;
  mime: string;
  sizeBytes: number;
  visibility: Visibility;
  ownerEmployeeId: string;
  ownerName: string;
  departmentName: string | null;
  createdAt: string;
};

export type AuditRow = {
  id: number;
  action: string;
  entity: string;
  detail: string;
  createdAt: string;
  actorName: string;
};

export type JobPost = {
  id: string;
  title: string;
  departmentName: string;
  location: string;
  employmentType: string;
  summary: string;
  postedAt: string;
};

export type ContactNote = {
  id: number;
  name: string;
  email: string;
  company: string;
  message: string;
  createdAt: string;
};

export type Dashboard = {
  headcount: number;
  active: number;
  onLeave: number;
  byDepartment: { name: string; count: number }[];
  openRoles: number;
  documentCount: number;
  recent: Actor[];
  messages: ContactNote[];
};
