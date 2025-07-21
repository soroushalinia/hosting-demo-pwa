export function generateIPv4(): string {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
}

export function generateIPv6(): string {
  return Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 0x10000)
      .toString(16)
      .padStart(4, '0'),
  ).join(':');
}
