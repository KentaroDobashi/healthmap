import { PrismaClient, VitalKind, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const D = (n: number | string) => new Prisma.Decimal(n); // 便利関数

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function addMinutes(d: Date, minutes: number) {
  return new Date(d.getTime() + minutes * 60_000);
}

async function main() {
  const user =
    (await prisma.user.findFirst()) ??
    (await prisma.user.create({
      data: { email: 'demo@example.com', name: 'Demo User' },
    }));

  // ---- Sleep: 直近14日 ----
  const sleepCreates = [];
  for (let i = 0; i < 14; i++) {
    const start = new Date(daysAgo(i).setHours(23, 0, 0, 0));
    const totalMin = 360 + Math.floor(Math.random() * 120);
    const remMin = Math.floor(totalMin * 0.2);
    const deepMin = Math.floor(totalMin * 0.15);
    const hrAvg = 55 + Math.floor(Math.random() * 15);
    const hrvMs = 40 + Math.floor(Math.random() * 30);

    sleepCreates.push(
      prisma.sleepSession.create({
        data: {
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

  // ---- Vitals（Decimal対応） ----
  const now = new Date();
  const weight = (68 + Math.random() * 2 - 1).toFixed(2); // 2桁で保存
  const temp = (36.5 + Math.random() * 0.5 - 0.25).toFixed(2);
  const rhr = 60 + Math.floor(Math.random() * 10);

  const vitalCreates = [
    prisma.vitalSample.create({
      data: {
        userId: user.id,
        kind: VitalKind.WEIGHT,
        valueNum: D(weight),
        unit: 'kg',
        recordedAt: now,
        source: 'Seed',
      },
    }),
    prisma.vitalSample.create({
      data: {
        userId: user.id,
        kind: VitalKind.BODY_TEMP,
        valueNum: D(temp),
        unit: '°C',
        recordedAt: now,
        source: 'Seed',
      },
    }),
    prisma.vitalSample.create({
      data: {
        userId: user.id,
        kind: VitalKind.RESTING_HR,
        valueNum: D(rhr), // 整数でも Decimal に
        unit: 'bpm',
        recordedAt: now,
        source: 'Seed',
      },
    }),
  ];

  // ---- Labs（Decimal対応） ----
  const labs = [
    { testName: 'HbA1c', valueNum: '5.4', unit: '%',    refLow: '4.6', refHigh: '6.2' },
    { testName: 'LDL-C', valueNum: '115', unit: 'mg/dL', refLow: '60', refHigh: '139' },
    { testName: 'ALT',   valueNum: '22',  unit: 'U/L',  refLow: '7',  refHigh: '45' },
  ];

  const labCreates = labs.map((l) =>
    prisma.labResult.create({
      data: {
        userId: user.id,
        testName: l.testName,
        valueNum: D(l.valueNum),
        unit: l.unit,
        refLow: l.refLow ? D(l.refLow) : null,
        refHigh: l.refHigh ? D(l.refHigh) : null,
        collectedAt: daysAgo(7),
        labSource: 'Seed',
      },
    })
  );

  await prisma.$transaction([...sleepCreates, ...vitalCreates, ...labCreates]);
  console.log('✅ Seed completed (Decimal ready)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
