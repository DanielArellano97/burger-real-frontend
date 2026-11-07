/** Horario de atención. Las horas son de la zona `timeZone`, no del dispositivo. */
export interface BusinessHoursConfig {
  /** Zona horaria del local (IANA), ej. `America/Santiago`. */
  timeZone: string;
  /** Hora de apertura `HH:mm` (incluida). */
  opensAt: string;
  /** Hora de cierre `HH:mm` (excluida: a esa hora ya no se reciben pedidos). */
  closesAt: string;
  /** Días que abre: 0 = domingo … 6 = sábado. */
  days: readonly number[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Día de la semana y minutos desde medianoche de `date` en la zona del local. */
function localTime(date: Date, timeZone: string): { weekday: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
  return {
    weekday: WEEKDAYS.indexOf(get('weekday')),
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

/** ¿El local recibe pedidos en este momento? */
export function isOpenAt(date: Date, config: BusinessHoursConfig): boolean {
  const { weekday, minutes } = localTime(date, config.timeZone);
  return (
    config.days.includes(weekday) &&
    minutes >= toMinutes(config.opensAt) &&
    minutes < toMinutes(config.closesAt)
  );
}

/** Texto del horario para la UI: "18:00 a 22:00". */
export function hoursLabel(config: BusinessHoursConfig): string {
  return `${config.opensAt} a ${config.closesAt}`;
}
