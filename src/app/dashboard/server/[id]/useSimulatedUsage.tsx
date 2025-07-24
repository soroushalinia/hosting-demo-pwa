'use client';

import { useEffect, useState } from 'react';

type UsageEntry = {
  timestamp: string;
  cpu: number;
  ram: number;
  upload: number;
  download: number;
};

const MAX_HISTORY = 20;

export function useSimulatedUsage(status: string, ramGB: number, cpuCores: number) {
  const ramTotalMB = ramGB * 1024;
  const [usageData, setUsageData] = useState<UsageEntry[]>([]);

  useEffect(() => {
    if (status !== 'on') return;

    const initialData: UsageEntry[] = [];

    let last = generateNext(
      {
        timestamp: `${Date.now()}`,
        cpu: 15 + Math.random() * 10,
        ram: 0.5 * ramTotalMB,
        upload: 5 + Math.random() * 10,
        download: 30 + Math.random() * 20,
      },
      ramTotalMB,
    );

    for (let i = 0; i < MAX_HISTORY; i++) {
      initialData.push(last);
      last = generateNext(last, ramTotalMB);
    }

    setUsageData(initialData);

    const interval = setInterval(() => {
      setUsageData((prev) => {
        const lastEntry = prev[prev.length - 1];
        const newEntry = generateNext(lastEntry, ramTotalMB);
        return [...prev.slice(1), newEntry];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [status, ramTotalMB, cpuCores]);

  return usageData;
}

function generateNext(prev: UsageEntry, ramTotalMB: number): UsageEntry {
  return {
    timestamp: `${Date.now()}`,
    cpu: roundTo2(clamp(prev.cpu + randFluct(-8, 8) + occasionalSpike(20, 0.1), 5, 95)),
    ram: roundTo2(
      clamp(
        prev.ram + randFluct(-0.2, 0.2) * ramTotalMB + occasionalSpike(0.4 * ramTotalMB, 0.2),
        0.2 * ramTotalMB,
        ramTotalMB,
      ),
    ),
    upload: roundTo2(clamp(prev.upload + randFluct(-3, 3), 2, 40)),
    download: roundTo2(clamp(prev.download + randFluct(-10, 10), 20, 100)),
  };
}

function randFluct(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function occasionalSpike(magnitude: number, probability: number) {
  return Math.random() < probability ? magnitude * (Math.random() < 0.5 ? 1 : -1) : 0;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}
