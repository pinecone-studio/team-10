export type Role =
  | 'EMPLOYEE'
  | 'INVENTORY_HEAD'
  | 'FINANCE'
  | 'IT_ADMIN'
  | 'HR_MANAGER'
  | 'SYSTEM_ADMIN';
export type OrderStatus =
  | 'SUBMITTED'
  | 'FINANCE_APPROVED'
  | 'FINANCE_REJECTED'
  | 'IT_RECEIVED';

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  itemName: string;
  category: string | null;
  quantity: number;
  unitCost: number;
  fromWhere: string;
  additionalNotes: string | null;
  eta: string | null;
  qrCode: string | null;
  manufacturedAt: string | null;
  serialNumber: string | null;
  powerSpec: string | null;
  conditionNote: string | null;
  receiveStatus: 'PENDING' | 'RECEIVED';
  receivedAt: string | null;
  receivedBy: User | null;
  assignedTo: User | null;
  assignedAt: string | null;
  assignmentNote: string | null;
};

export type Order = {
  id: string;
  requester: User;
  whyOrdered: string;
  orderProcess: string;
  whichOffice: string;
  status: OrderStatus;
  financeApprover: User | null;
  financeComment: string | null;
  financeActionAt: string | null;
  whenToArrive: string | null;
  totalCost: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderItemInput = {
  itemName: string;
  category?: string;
  quantity: number;
  unitCost: number;
  fromWhere: string;
  additionalNotes?: string;
  eta?: string;
};

export type CreateOrderInput = {
  whyOrdered: string;
  orderProcess: string;
  whichOffice: string;
  whenToArrive?: string;
  items: CreateOrderItemInput[];
};

export type CreateUserInput = {
  email: string;
  fullName: string;
  role: Role;
};

export type ReceiveOrderItemInput = {
  itemId: string;
  serialNumber: string;
  manufacturedAt: string;
  powerSpec: string;
  conditionNote?: string;
};

export type AssignOrderItemInput = {
  itemId: string;
  assignedToUserId: string;
  assignmentNote?: string;
};

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType: string;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};
