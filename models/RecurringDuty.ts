import { Schema, models, model, Model, Types } from "mongoose";
import "@/models/Teacher";
import "@/models/DutyType";

// dayOfWeek: 0 = Sunday, 1 = Monday, ... 6 = Saturday (matches JS Date#getDay())
export interface IRecurringDuty {
  _id: string;
  dayOfWeek: number;
  dutyType: Types.ObjectId;
  teachers: Types.ObjectId[];
  active: boolean;
}

const RecurringDutySchema = new Schema<IRecurringDuty>(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    dutyType: { type: Schema.Types.ObjectId, ref: "DutyType", required: true },
    teachers: [{ type: Schema.Types.ObjectId, ref: "Teacher" }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RecurringDutySchema.index({ dayOfWeek: 1 });

export default (models.RecurringDuty as Model<IRecurringDuty>) ||
  model<IRecurringDuty>("RecurringDuty", RecurringDutySchema);
