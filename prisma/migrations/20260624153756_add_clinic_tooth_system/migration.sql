-- DropForeignKey
ALTER TABLE "PatientRecord" DROP CONSTRAINT "PatientRecord_createdById_fkey";

-- DropForeignKey
ALTER TABLE "PatientRecord" DROP CONSTRAINT "PatientRecord_patientId_fkey";

-- DropIndex
DROP INDEX "Patient_jmbg_key";

-- DropIndex
DROP INDEX "User_email_key";

-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assistantRestrictions" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- Seed default clinic so existing rows can be backfilled before FKs are added
INSERT INTO "Clinic" ("id", "name", "isActive", "assistantRestrictions", "updatedAt")
VALUES ('main-clinic', 'Main Clinic', true, '{"financials": true}', CURRENT_TIMESTAMP);

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "clinicId" TEXT NOT NULL DEFAULT 'main-clinic';
ALTER TABLE "Appointment" ALTER COLUMN "clinicId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "clinicId" TEXT NOT NULL DEFAULT 'main-clinic';
ALTER TABLE "Patient" ALTER COLUMN "clinicId" DROP DEFAULT;

-- AlterTable (backfill existing rows before enforcing NOT NULL)
ALTER TABLE "User" ADD COLUMN     "clinicId" TEXT;
UPDATE "User" SET "clinicId" = 'main-clinic' WHERE "clinicId" IS NULL;
ALTER TABLE "User" ALTER COLUMN "clinicId" SET NOT NULL;

-- DropTable
DROP TABLE "PatientRecord";

-- CreateTable
CREATE TABLE "ToothRecord" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "dentistId" TEXT NOT NULL,
    "treatedTeeth" INTEGER[],
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnosis" TEXT,
    "serviceType" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "doctorSignature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToothRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientToothChart" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "chartData" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientToothChart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientToothChart_patientId_key" ON "PatientToothChart"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_clinicId_jmbg_key" ON "Patient"("clinicId", "jmbg");

-- CreateIndex
CREATE UNIQUE INDEX "User_clinicId_email_key" ON "User"("clinicId", "email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToothRecord" ADD CONSTRAINT "ToothRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToothRecord" ADD CONSTRAINT "ToothRecord_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToothRecord" ADD CONSTRAINT "ToothRecord_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientToothChart" ADD CONSTRAINT "PatientToothChart_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
