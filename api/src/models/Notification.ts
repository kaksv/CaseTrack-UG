import { Schema, model, type Types } from 'mongoose';

export interface INotification {
  user: Types.ObjectId;
  case?: Types.ObjectId | null;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    case: { type: Schema.Types.ObjectId, ref: 'Case', default: null },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 600 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

export const Notification = model<INotification>('Notification', notificationSchema);
