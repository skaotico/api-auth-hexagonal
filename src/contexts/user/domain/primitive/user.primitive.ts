export interface PrimitiveUser {
  id: string;
  userName: string;
  email: string;
  pass: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  deletedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
}

export type PrimitiveUserCreate = Omit<
  PrimitiveUser,
  'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'deletedAt'
>;