import { IStorage } from "./types";
import { User, Message, Friend, InsertUser, InsertMessage, InsertFriend, UpdateUser } from "@shared/schema";
import { db } from "./db";
import { eq, or, and } from "drizzle-orm";
import { users, messages, friends } from "@shared/schema";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: UpdateUser): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages);
  }

  async createMessage(senderId: number, data: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({ ...data, senderId })
      .returning();
    return message;
  }

  async getFriends(userId: number): Promise<Friend[]> {
    return await db
      .select()
      .from(friends)
      .where(or(eq(friends.userId, userId), eq(friends.friendId, userId)));
  }

  async createFriend(userId: number, data: InsertFriend): Promise<Friend> {
    const [friend] = await db
      .insert(friends)
      .values({ ...data, userId })
      .returning();
    return friend;
  }

  async updateFriend(id: number, status: string): Promise<Friend> {
    const [friend] = await db
      .update(friends)
      .set({ status })
      .where(eq(friends.id, id))
      .returning();
    return friend;
  }
}

export const storage = new DatabaseStorage();