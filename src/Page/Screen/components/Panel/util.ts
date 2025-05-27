function transformByField<T extends { [key: string]: any }>(
  input: Record<string, any>,
  groupField: keyof T,
  valueField: keyof T,
  monthField?: string
): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  const allMonths = Object.keys(input).sort();

  for (const month of allMonths) {
    const raw = input[month];
    const items: T[] = monthField ? raw?.[monthField] ?? [] : raw ?? [];

    for (const item of items) {
      const key = item[groupField];
      const value = item[valueField] ?? 0;

      if (!result[key]) {
        result[key] = {};
        for (const m of allMonths) {
          result[key][m] = 0;
        }
      }

      result[key][month] = value;
    }
  }

  return result;
}

export { transformByField };
