import test from "node:test";
import assert from "node:assert/strict";

const BASE_URL = "http://localhost:5000";

test(
  "EventSphere API should be running",
  async () => {
    const response = await fetch(BASE_URL);

    assert.equal(response.status, 200);

    const text = await response.text();

    assert.equal(
      text,
      "EventSphere API is running..."
    );
  }
);

test(
  "Public expos API should respond",
  async () => {
    const response = await fetch(
      `${BASE_URL}/api/expos`
    );

    assert.equal(response.status, 200);

    const data = await response.json();

    assert.ok(Array.isArray(data));
  }
);

test(
  "Protected profile API should reject request without token",
  async () => {
    const response = await fetch(
      `${BASE_URL}/api/auth/profile`
    );

    assert.equal(response.status, 401);
  }
);

test(
  "Protected profile API should reject invalid token",
  async () => {
    const response = await fetch(
      `${BASE_URL}/api/auth/profile`,
      {
        headers: {
          Authorization:
            "Bearer invalid-token",
        },
      }
    );

    assert.equal(response.status, 401);
  }
);

test(
  "Public registration should reject admin role",
  async () => {
    const response = await fetch(
      `${BASE_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          name: "Security Test",
          companyName: "",
          email:
            "securitytest@example.com",
          phone: "03000000000",
          password: "test123",
          role: "admin",
          consentAccepted: true,
        }),
      }
    );

    assert.equal(response.status, 400);

    const data = await response.json();

    assert.equal(
      data.message,
      "Invalid role"
    );
  }
);