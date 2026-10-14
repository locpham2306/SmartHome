export const sensorKeys = ['temperature', 'humidity', 'light'];

export function isSensorSnapshot(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    sensorKeys.every((key) => {
      if (!Object.hasOwn(value, key)) return false;
      const reading = value[key];
      return (
        reading === null ||
        (typeof reading === 'object' &&
          typeof reading.value === 'number' &&
          Number.isFinite(reading.value) &&
          typeof reading.time === 'string')
      );
    })
  );
}

// REST có thể trả về sau một bản tin realtime mới hơn. Không để nó ghi đè số đo mới.
export function mergeSensorReadings(current, incoming) {
  const next = { ...current };
  for (const key of sensorKeys) {
    const previous = current?.[key];
    const reading = incoming[key];
    if (previous && !reading) continue;
    if (previous && reading) {
      const previousId = Number(previous.id);
      const incomingId = Number(reading.id);
      if (
        previous.id != null &&
        reading.id != null &&
        Number.isFinite(previousId) &&
        Number.isFinite(incomingId)
      ) {
        if (incomingId < previousId) continue;
      } else if (reading.time < previous.time) {
        continue;
      }
    }
    next[key] = reading;
    next[`${key}AlertStatus`] = incoming[`${key}AlertStatus`] || 'UNKNOWN';
  }
  return next;
}
