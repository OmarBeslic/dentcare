import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^"|"$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Mon–Fri active 08:00–16:00, Sat–Sun off
const DEFAULT_HOURS = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
  dayOfWeek: day,
  isActive: day >= 1 && day <= 5,
  startTime: "08:00",
  endTime: "16:00",
}));

async function seedWorkingHours(userId: string) {
  for (const h of DEFAULT_HOURS) {
    await prisma.workingHours.upsert({
      where: { userId_dayOfWeek: { userId, dayOfWeek: h.dayOfWeek } },
      update: {},
      create: { userId, ...h },
    });
  }
}

async function main() {
  console.log("🌱  Seeding database...");

  const clinic = await prisma.clinic.upsert({
    where: { id: "main-clinic" },
    update: {},
    create: {
      id: "main-clinic",
      name: "Main Clinic",
      assistantRestrictions: { financials: true },
    },
  });
  console.log("✅  Clinic ready: " + clinic.name);

  const admin = await prisma.user.upsert({
    where: { clinicId_email: { clinicId: clinic.id, email: "admin@dentcare.me" } },
    update: {},
    create: {
      clinicId: clinic.id,
      name: "Dr. Marko Markovic",
      email: "admin@dentcare.me",
      password: await bcrypt.hash("test123", 10),
      role: Role.ADMIN,
    },
  });
  console.log("✅  Admin user ready: admin@dentcare.me / test123");
  await seedWorkingHours(admin.id);

  // let dentist = await prisma.user.findUnique({
  //   where: { email: "dr.marko@dentcare.me" },
  // });
  // if (!dentist) {
  //   dentist = await prisma.user.create({
  //     data: {
  //       name: "Dr. Marko Nikolić",
  //       email: "dr.marko@dentcare.me",
  //       password: await bcrypt.hash("test123", 10),
  //       role: Role.DENTIST,
  //     },
  //   });
  //   console.log("✅  Dentist created: dr.marko@dentcare.me / test123");
  // }
  // await seedWorkingHours(dentist.id);

  // let assistant = await prisma.user.findUnique({
  //   where: { email: "assistant.marko@dentcare.me" },
  // });
  
  // if (!assistant) {
  //   dentist = await prisma.user.create({
  //     data: {
  //       name: "Assistant Marko Nikolić",
  //       email: "assistant.marko@dentcare.me",
  //       password: await bcrypt.hash("test123", 10),
  //       role: Role.ASSISTANT,
  //     },
  //   });
  //   console.log("✅  Assistant created: assistant.marko@dentcare.me / test123");
  // }
  console.log("🎉  Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
