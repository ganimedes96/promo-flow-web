import { User } from "../users/types";
export interface Auth {
  token: string;
  user: Pick<
    User,
    "role" | "id" | "name" | "email" | "phone" | "createdAt" | "updatedAt"
  >;
}
export interface Credentials {
  email: string;
  password: string;
}
