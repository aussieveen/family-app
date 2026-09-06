export const SHIFT_TYPES = {
  'Long Day': { start: '06:30', end: '21:00' },
  'Early': { start: '06:30', end: '14:30' },
  'Late': { start: '12:00', end: '21:00' },
  'Night': { start: '18:30', end: '08:30' },
  'Study Day': { start: '09:00', end: '17:00' },
}

export const SHIFT_TITLES = Object.keys(SHIFT_TYPES)

export function isShiftEvent(event) {
  return SHIFT_TITLES.includes(event.title) && event.who?.length === 1 && event.who[0].name === 'Mum'
}
