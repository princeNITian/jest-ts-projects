import { capitalize, sum } from "../src/utils";

describe("Utilities", () => {
  test("capitalize", () => {
    expect(capitalize("hello")).toBe("Hello");
    expect(capitalize("")).toBe("");
  });

  test("sum", () => {
    expect(sum(2, 3)).toBe(5);
  });
});
