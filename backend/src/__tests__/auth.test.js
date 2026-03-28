import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";

vi.mock("../models/user.model.js");
vi.mock("../config/db.js", () => ({
  connectDB: vi.fn(),
}));

describe("Auth Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if fields are missing on signup", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "test@example.com" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("should return 400 for invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ fullName: "Test User", email: "invalid-email", password: "password123" });

    expect(res.status).toBe(400);
  });
});
