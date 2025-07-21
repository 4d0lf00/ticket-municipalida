export interface Ticket {
  id: string;
  title: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  department: string;
  category: string;
  priority: string;
  status: string;
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
  responses?: {
    author: string;
    authorEmail: string;
    message: string;
    timestamp: Date;
  }[];
}



export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  urgent: number;
  high: number;
}
