export type User = {
  ip: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  location: string;
  job_area: string;
  company: string;
  job_title: string;
};

export type LogEntry = User & {
  id: string;
  timestamp: string;
};
