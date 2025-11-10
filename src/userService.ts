export async function getUser(id: string) {
  const res = await fetch(`https://dummyapi.com/user/${id}`);
  if (!res.ok) throw new Error("Failed request");
  return res.json();
}
