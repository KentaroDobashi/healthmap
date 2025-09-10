// prisma/seed.ts
import { PrismaClient, VitalKind, Prisma } from '@prisma/client';
import type { PrismaPromise, SleepSession, VitalSample, LabResult } from '@prisma/client';

const prisma = new PrismaClient();
const D = (n: number | string) => new Prisma.Decimal(n);

// ---- helpers ----
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function addMinutes(d: Date, minutes: number) {
  return new Date(d.getTime() + minutes * 60_000);
}

async function main() {
  // ユーザー確保
  const user =
    (await prisma.user.findFirst()) ??
    (await prisma.user.create({
      data: { email: 'demo@example.com', name: 'Demo User' },
    }));

  // ---- Sleep: 直近14日（upsertで冪等）----
  const sleepCreates: PrismaPromise<SleepSession>[] = [];
  for (let i = 0; i < 14; i++) {
    const start = new Date(daysAgo(i).setHours(23, 0, 0, 0));
    const totalMin = 360 + Math.floor(Math.random() * 120);
    const remMin = Math.floor(totalMin * 0.2);
    const deepMin = Math.floor(totalMin * 0.15);
    const hrAvg = 55 + Math.floor(Math.random() * 15);
    const hrvMs = 40 + Math.floor(Math.random() * 30);

    sleepCreates.push(
      prisma.sleepSession.upsert({
        // schema.prisma: @@unique([userId, startedAt], name: "unique_sleep_per_user_started")
        where: {
          unique_sleep_per_user_started: {
            userId: user.id,
            startedAt: start,
          },
        },
        update: {
          endedAt: addMinutes(start, totalMin),
          totalMin,
          remMin,
          deepMin,
          hrAvg,
          hrvMs,
          source: 'Seed',
        },
        create: {
          userId: user.id,
          startedAt: start,
          endedAt: addMinutes(start, totalMin),
          totalMin,
          remMin,
          deepMin,
          hrAvg,
          hrvMs,
          source: 'Seed',
        },
      })
    );
  }

  // ---- Vitals（Decimal & upsert）----
  const now = new Date();
  const weight = (68 + Math.random() * 2 - 1).toFixed(2);
  const temp = (36.5 + Math.random() * 0.5 - 0.25).toFixed(2);
  const rhr = 60 + Math.floor(Math.random() * 10);

  const vitalCreates: PrismaPromise<VitalSample>[] = [
    prisma.vitalSample.upsert({
      // @@unique([userId, kind, recordedAt], name: "unique_vital_per_point")
      where: {
        unique_vital_per_point: {
          userId: user.id,
          kind: VitalKind.WEIGHT,
          recordedAt: now,
        },
      },
      update: { valueNum: D(weight), unit: 'kg', source: 'Seed' },
      create: {
        userId: user.id,
        kind: VitalKind.WEIGHT,
        valueNum: D(weight),
        unit: 'kg',
        recordedAt: now,
        source: 'Seed',
      },
    }),
    prisma.vitalSample.upsert({
      where: {
        unique_vital_per_point: {
          userId: user.id,
          kind: VitalKind.BODY_TEMP,
          recordedAt: now,
        },
      },
      update: { valueNum: D(temp), unit: '°C', source: 'Seed' },
      create: {
        userId: user.id,
        kind: VitalKind.BODY_TEMP,
        valueNum: D(temp),
        unit: '°C',
        recordedAt: now,
        source: 'Seed',
      },
    }),
    prisma.vitalSample.upsert({
      where: {
        unique_vital_per_point: {
          userId: user.id,
          kind: VitalKind.RESTING_HR,
          recordedAt: now,
        },
      },
      update: { valueNum: D(rhr), unit: 'bpm', source: 'Seed' },
      create: {
        userId: user.id,
        kind: VitalKind.RESTING_HR,
        valueNum: D(rhr),
        unit: 'bpm',
        recordedAt: now,
        source: 'Seed',
      },
    }),
  ];

  // ---- Labs（Decimal & upsert）----
  const labs: Array<{
  testName: string;
  valueNum: string;
  unit: string;
  refLow?: string;
  refHigh?: string;
}>  = [
    { testName: 'HbA1c', valueNum: '5.4', unit: '%', refLow: '4.6', refHigh: '6.2' },
    { testName: 'LDL-C', valueNum: '115', unit: 'mg/dL', refLow: '60', refHigh: '139' },
    { testName: 'ALT', valueNum: '22', unit: 'U/L', refLow: '7', refHigh: '45' },
  ];
  const drawAt = daysAgo(7);

  const labCreates: PrismaPromise<LabResult>[] = labs.map((l) =>
    prisma.labResult.upsert({
      // @@unique([userId, testName, collectedAt], name: "unique_lab_marker_per_draw")
      where: {
        unique_lab_marker_per_draw: {
          userId: user.id,
          testName: l.testName,
          collectedAt: drawAt,
        },
      },
      update: {
        valueNum: D(l.valueNum),
        unit: l.unit,
        refLow: l.refLow ? D(l.refLow) : null,
        refHigh: l.refHigh ? D(l.refHigh) : null,
        labSource: 'Seed',
      },
      create: {
        userId: user.id,
        testName: l.testName,
        valueNum: D(l.valueNum),
        unit: l.unit,
        refLow: l.refLow ? D(l.refLow) : null,
        refHigh: l.refHigh ? D(l.refHigh) : null,
        collectedAt: drawAt,
        labSource: 'Seed',
      },
    })
  );

  // ---- 一括実行 ----
  await prisma.$transaction([...sleepCreates, ...vitalCreates, ...labCreates]);
  console.log('✅ Seed completed (Decimal ready)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
