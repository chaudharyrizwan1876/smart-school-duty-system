import { Schema, models, model, Model, Types } from "mongoose";
import "@/models/Teacher";
import "@/models/DutyType";

export interface IDutyAssignment {
  _id: string;
  date: Date;
  dutyType: Types.ObjectId;
  teachers: Types.ObjectId[];
  notificationSent: boolean;
}

const DutyAssignmentSchema = new Schema<IDutyAssignment>(
  {
    date: { type: Date, required: true },
    dutyType: { type: Schema.Types.ObjectId, ref: "DutyType", required: true },
    teachers: [{ type: Schema.Types.ObjectId, ref: "Teacher" }],
    notificationSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DutyAssignmentSchema.index({ date: 1 });

export default (models.DutyAssignment as Model<IDutyAssignment>) ||
  model<IDutyAssignment>("DutyAssignment", DutyAssignmentSchema);
