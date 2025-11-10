export function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function sum(a: number, b: number) {
  return a + b;
}
