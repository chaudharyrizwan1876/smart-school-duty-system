import { Schema, models, model, Model } from "mongoose";

export interface IDutyType {
  _id: string;
  name: string;
  location: string;
  startTime: string;
}

const DutyTypeSchema = new Schema<IDutyType>(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    startTime: { type: String, required: true },
  },
  { timestamps: true }
);

export default (models.DutyType as Model<IDutyType>) || model<IDutyType>("DutyType", DutyTypeSchema);
