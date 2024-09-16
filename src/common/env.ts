/**
 *
 * @param param string
 * @throws Error
 * @returns string
 */
export function env(param: string) {
  const value = process.env[param];
  if (!value) {
    throw new Error(`Missing environment variable: ${param}`);
  }

  return value;
}
