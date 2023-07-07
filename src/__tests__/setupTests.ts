import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import matchers from "@testing-library/jest-dom/matchers.js";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
