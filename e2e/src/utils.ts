export function tryGetEnviromentVariable(
  name: string,
  defaultValue?: string
): string | undefined {
  if (process.env[name] !== undefined) {
    const value = process.env[name] ?? defaultValue;
    return value;
  }
  return undefined;
}
