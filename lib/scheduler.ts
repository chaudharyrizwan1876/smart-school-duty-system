import schedule from "node-schedule";
import connectDB from "./db";
import DutyAssignment from "@/models/DutyAssignment";
import Teacher from "@/models/Teacher";
import DutyType from "@/models/DutyType";
import NotificationLog from "@/models/NotificationLog";
import RecurringDuty from "@/models/RecurringDuty";
import { sendWhatsAppMessage, getWhatsAppStatus } from "./whatsapp";

const g = global as any;
if (!g.__scheduler) {
  g.__scheduler = {
    initialized: false,
    jobs: new Map<string, schedule.Job>(),
    midnightJob: null as schedule.Job | null,
  };
}
const state = g.__scheduler;

function formatTime12h(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function buildMessage(teacherName: string, dutyName: string, location: string, startTime: string) {
  return `Dear ${teacherName}, this is a reminder that you have ${dutyName} today at ${location}, starting at ${formatTime12h(startTime)}. Thank you.`;
}

function parseTimeOnDate(date: Date, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

async function fireNotification(assignmentId: string) {
  await connectDB();
  const assignment = await DutyAssignment.findById(assignmentId)
    .populate("dutyType")
    .populate("teachers");

  if (!assignment || assignment.notificationSent) return;

  const dutyType: any = assignment.dutyType;
  const teachers: any[] = assignment.teachers as any[];

  for (const teacher of teachers) {
    const message = buildMessage(teacher.name, dutyType.name, dutyType.location, dutyType.startTime);
    try {
      const status = getWhatsAppStatus();
      if (status.status !== "connected") {
        throw new Error("WhatsApp not connected");
      }
      await sendWhatsAppMessage(teacher.phone, message);
      await NotificationLog.create({
        date: assignment.date,
        teacher: teacher._id,
        dutyType: dutyType._id,
        assignment: assignment._id,
        status: "sent",
      });
    } catch (err: any) {
      await NotificationLog.create({
        date: assignment.date,
        teacher: teacher._id,
        dutyType: dutyType._id,
        assignment: assignment._id,
        status: "failed",
        error: err?.message || String(err),
      });
    }
  }

  assignment.notificationSent = true;
  await assignment.save();
  state.jobs.delete(String(assignment._id));
}

async function materializeRecurringDuties() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todayDayOfWeek = startOfDay.getDay(); // 0 = Sunday ... 6 = Saturday

  const rules = await RecurringDuty.find({ dayOfWeek: todayDayOfWeek, active: true });

  for (const rule of rules) {
    // Atomic upsert avoids a race where two concurrent calls both pass an
    // exists-check and create duplicate assignments for the same rule/day.
    const result = await DutyAssignment.findOneAndUpdate(
      { date: startOfDay, recurringDuty: rule._id },
      {
        $setOnInsert: {
          date: startOfDay,
          dutyType: rule.dutyType,
          teachers: rule.teachers,
          recurringDuty: rule._id,
        },
      },
      { upsert: true, new: false }
    );
    if (!result) {
      console.log(`Auto-created today's assignment from recurring rule ${rule._id}`);
    }
  }
}

export async function scheduleTodaysDuties() {
  await connectDB();

  await materializeRecurringDuties();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const assignments = await DutyAssignment.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    notificationSent: false,
  }).populate("dutyType");

  const now = new Date();

  for (const assignment of assignments) {
    const id = String(assignment._id);
    if (state.jobs.has(id)) continue;

    const dutyType: any = assignment.dutyType;
    if (!dutyType || !dutyType.startTime) continue;

    const dutyStart = parseTimeOnDate(assignment.date, dutyType.startTime);
    const notifyTime = new Date(dutyStart.getTime() - 30 * 60 * 1000);

    if (notifyTime > now) {
      const job = schedule.scheduleJob(notifyTime, () => {
        fireNotification(id).catch((err) => console.error("Notification job failed:", err));
      });
      state.jobs.set(id, job);
      console.log(`Scheduled notification for assignment ${id} at ${notifyTime.toLocaleString()}`);
    }
  }
}

export function initScheduler() {
  if (state.initialized) return;
  state.initialized = true;

  scheduleTodaysDuties().catch((err) => console.error("Initial scheduling failed:", err));

  state.midnightJob = schedule.scheduleJob("0 0 * * *", () => {
    scheduleTodaysDuties().catch((err) => console.error("Midnight scheduling failed:", err));
  });

  console.log("Duty scheduler initialized.");
}
