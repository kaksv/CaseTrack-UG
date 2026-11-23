import { Notification } from '../models/Notification';
import type { Types } from 'mongoose';

interface NotifyInput {
  userId: string | Types.ObjectId;
  caseId?: string | Types.ObjectId | null;
  title: string;
  body: string;
}

export async function notify(input: NotifyInput): Promise<void> {
  await Notification.create({
    user: input.userId,
    case: input.caseId ?? null,
    title: input.title,
    body: input.body,
    read: false,
  });
}
