export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatMinutes(seconds: number): string {
  return `${Math.ceil(seconds / 60)} min`;
}

export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((target.getTime() - today.getTime()) / 86400000));
}

export function formatTime24to12(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function greetingForHour(hour: number = new Date().getHours()): string {
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
}

export function meltPercent(progress: number): string {
  return `${Math.round(progress * 100)}% melted`;
}
