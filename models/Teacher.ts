import { Schema, models, model, Model } from "mongoose";

export interface ITeacher {
  _id: string;
  name: string;
  phone: string;
  subject: string;
  active: boolean;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    subject: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default (models.Teacher as Model<ITeacher>) || model<ITeacher>("Teacher", TeacherSchema);
