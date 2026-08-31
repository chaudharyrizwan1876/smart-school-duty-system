import { Schema, models, model, Model, Types } from "mongoose";
import "@/models/Teacher";
import "@/models/DutyType";
import "@/models/DutyAssignment";

export interface INotificationLog {
  _id: string;
  date: Date;
  teacher: Types.ObjectId;
  dutyType: Types.ObjectId;
  assignment: Types.ObjectId;
  sentAt: Date;
  status: "sent" | "failed";
  error?: string;
}

const NotificationLogSchema = new Schema<INotificationLog>(
  {
    date: { type: Date, required: true },
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    dutyType: { type: Schema.Types.ObjectId, ref: "DutyType", required: true },
    assignment: { type: Schema.Types.ObjectId, ref: "DutyAssignment" },
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["sent", "failed"], default: "sent" },
    error: { type: String },
  },
  { timestamps: true }
);

export default (models.NotificationLog as Model<INotificationLog>) ||
  model<INotificationLog>("NotificationLog", NotificationLogSchema);
