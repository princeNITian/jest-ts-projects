import { getUser } from "../src/userService";

global.fetch = jest.fn();

describe("getUser", () => {
  test("returns user data", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ name: "Raj" }),
    });

    const data = await getUser("123");
    expect(data.name).toBe("Raj");
  });
  test("throws on failure", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false });

    await expect(getUser("123")).rejects.toThrow("Failed request");
  });
});
