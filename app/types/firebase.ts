import { z } from 'zod'

import { CREATED_AT, OWNER_ID, MEMBER_IDS } from '~/firebase/constants'

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
})

export type User = z.infer<typeof UserSchema>

export const TimestampSchema = z.object({
  seconds: z.number(),
  nanoseconds: z.number(),
})

export type Timestamp = z.infer<typeof TimestampSchema>

export const ChatSchema = z.object({
  id: z.string(),
  name: z.string(),
  [OWNER_ID]: z.string(),
  [CREATED_AT]: TimestampSchema,
  imageUrl: z.string(),
  [MEMBER_IDS]: z.array(z.string()),
})

export type Chat = z.infer<typeof ChatSchema>

export const MessageSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: TimestampSchema,
  owner: z.object({
    id: z.string(),
    username: z.string(),
  }),
})

export type Message = z.infer<typeof MessageSchema>

export const MemberSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  addedAt: TimestampSchema,
})

export type Member = z.infer<typeof MemberSchema>

export const FirebaseOptionsSchema = z.object({
  apiKey: z.string().optional(),
  authDomain: z.string().optional(),
  databaseURL: z.string().optional(),
  projectId: z.string().optional(),
  storageBucket: z.string().optional(),
  messagingSenderId: z.string().optional(),
  appId: z.string().optional(),
  measurementId: z.string().optional(),
})

export type Status = 'idle' | 'loading' | 'success' | 'error'
