import { InsertUser, User, Message, Friend, InsertMessage, InsertFriend, UpdateUser } from "@shared/schema";
import session from "express-session";

export interface IStorage {
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, data: UpdateUser): Promise<User>;
  
  // Message operations
  getMessages(): Promise<Message[]>;
  createMessage(senderId: number, data: InsertMessage): Promise<Message>;
  
  // Friend operations
  getFriends(userId: number): Promise<Friend[]>;
  createFriend(userId: number, data: InsertFriend): Promise<Friend>;
  updateFriend(id: number, status: string): Promise<Friend>;
}
