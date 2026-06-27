import { parseNonNegativeInt, parsePositiveInt } from "../validateNumber";

describe("validateNumber", () => {
  describe("parseNonNegativeInt", () => {
    it("accepts 0 and positive integers", () => {
      expect(parseNonNegativeInt("0")).toEqual({ ok: true, value: 0 });
      expect(parseNonNegativeInt("1")).toEqual({ ok: true, value: 1 });
      expect(parseNonNegativeInt("42")).toEqual({ ok: true, value: 42 });
    });

    it("accepts leading zeros", () => {
      expect(parseNonNegativeInt("001")).toEqual({ ok: true, value: 1 });
      expect(parseNonNegativeInt("000")).toEqual({ ok: true, value: 0 });
    });

    it("rejects empty", () => {
      expect(parseNonNegativeInt("")).toEqual({
        ok: false,
        message: "Price must be a non-negative integer.",
      });
    });

    it("rejects negative integers and -0", () => {
      expect(parseNonNegativeInt("-1")).toEqual({
        ok: false,
        message: "Price must be a non-negative integer.",
      });
      expect(parseNonNegativeInt("-0")).toEqual({
        ok: false,
        message: "Price must be a non-negative integer.",
      });
    });

    it("rejects floats", () => {
      expect(parseNonNegativeInt("1.5")).toEqual({
        ok: false,
        message: "Price must be a non-negative integer.",
      });
      expect(parseNonNegativeInt("-0.1")).toEqual({
        ok: false,
        message: "Price must be a non-negative integer.",
      });
    });

    it("accepts scientific notation only when it becomes an integer", () => {
      // Number("1e2") === 100
      expect(parseNonNegativeInt("1e2")).toEqual({ ok: true, value: 100 });
    });

    it("rejects scientific notation that is not an integer", () => {
      // Number("1e-2") === 0.01
      expect(parseNonNegativeInt("1e-2")).toEqual({
        ok: false,
        message: "Price must be a non-negative integer.",
      });
    });
  });

  describe("parsePositiveInt", () => {
    it("accepts positive integers >= 1", () => {
      expect(parsePositiveInt("1")).toEqual({ ok: true, value: 1 });
      expect(parsePositiveInt("42")).toEqual({ ok: true, value: 42 });
    });

    it("accepts leading zeros for non-zero values", () => {
      expect(parsePositiveInt("001")).toEqual({ ok: true, value: 1 });
      expect(parsePositiveInt("00042")).toEqual({ ok: true, value: 42 });
    });

    it("rejects empty, 0, negative, and floats", () => {
      expect(parsePositiveInt("")).toEqual({
        ok: false,
        message: "requests must be a positive integer",
      });
      expect(parsePositiveInt("0")).toEqual({
        ok: false,
        message: "requests must be a positive integer",
      });
      expect(parsePositiveInt("-1")).toEqual({
        ok: false,
        message: "requests must be a positive integer",
      });
      expect(parsePositiveInt("1.5")).toEqual({
        ok: false,
        message: "requests must be a positive integer",
      });
      expect(parsePositiveInt("-0.1")).toEqual({
        ok: false,
        message: "requests must be a positive integer",
      });
    });

    it("rejects scientific notation that is not an integer", () => {
      expect(parsePositiveInt("1e-1")).toEqual({
        ok: false,
        message: "requests must be a positive integer",
      });
    });

    it("accepts scientific notation only when it becomes a positive integer", () => {
      expect(parsePositiveInt("1e1")).toEqual({ ok: true, value: 10 });
    });
  });
});

