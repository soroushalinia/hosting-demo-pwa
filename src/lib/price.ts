type PriceInput = {
  cpu: number;
  ram: number;
  storage: number;
  ipv4: number;
};

export function calculatePrice({ cpu, ram, storage, ipv4 }: PriceInput): {
  cpuCost: number;
  ramCost: number;
  storageCost: number;
  ipv4Cost: number;
  totalMonthly: number;
} {
  const cpuCost = cpu * 2;
  const ramCost = ram * 1;
  const storageCost = storage * 0.1;
  const ipv4Cost = ipv4 * 0.5;

  const totalMonthly = cpuCost + ramCost + storageCost + ipv4Cost;

  return {
    cpuCost,
    ramCost,
    storageCost,
    ipv4Cost,
    totalMonthly,
  };
}
