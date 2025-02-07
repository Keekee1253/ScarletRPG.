import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar").default("https://images.unsplash.com/photo-1499557354967-2b2d8910bcca"),
  fileUrl: text("file_url"),
  theme: text("theme").default("dark"),
});

export const friends = pgTable("friends", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  friendId: integer("friend_id").notNull().references(() => users.id),
  status: text("status").notNull(), // "pending", "accepted", "blocked"
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  fileUrl: text("file_url"),
});

// Create Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const updateUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    avatar: true,
    fileUrl: true,
    theme: true,
  })
  .partial();

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  fileUrl: true,
});

export const insertFriendSchema = createInsertSchema(friends).pick({
  friendId: true,
  status: true,
});

// Export types for use in the application
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertFriend = z.infer<typeof insertFriendSchema>;
export type User = typeof users.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Friend = typeof friends.$inferSelect;