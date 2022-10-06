export function truncate(str: string | undefined, n: number) {
  return str?.length ? str.substr(0, n - 1) + "..." : str;
}