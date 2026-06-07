const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const testDataFile = path.join(__dirname, "../data/progress.test.json");
const testProfileFile = path.join(__dirname, "../data/profile.test.json");
process.env.PROGRESS_DATA_FILE = testDataFile;
process.env.PROFILE_DATA_FILE = testProfileFile;

const {
  checkIn,
  completeTask,
  getProgress,
  replaceTasks,
} = require("./progressController");

function createRequest(userId, overrides = {}) {
  return {
    body: {},
    params: {},
    query: {},
    get(name) {
      return name === "x-user-id" && userId != null
        ? String(userId)
        : undefined;
    },
    ...overrides,
  };
}

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

test.beforeEach(() => {
  fs.writeFileSync(testDataFile, JSON.stringify({ users: {} }), "utf-8");
  fs.writeFileSync(
    testProfileFile,
    JSON.stringify([{ id: "1001", name: "User A" }, { id: "1002", name: "User B" }]),
    "utf-8",
  );
});

test.after(() => {
  for (const file of [testDataFile, testProfileFile]) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  }
});

test("new users start with a streak of zero", () => {
  const response = createResponse();
  getProgress(createRequest("1001"), response);

  assert.equal(response.body.data.streak, 0);
  assert.deepEqual(response.body.data.tasks, []);
});

test("tracks completed tasks and persists the result", () => {
  replaceTasks(
    createRequest("1001", {
      body: { tasks: [{ id: "0" }, { id: "1" }] },
    }),
    createResponse(),
  );

  completeTask(
    createRequest("1001", {
      params: { id: "0" },
      body: { isCompleted: true },
    }),
    createResponse(),
  );

  const response = createResponse();
  getProgress(createRequest("1001"), response);

  assert.equal(response.body.data.completedTasks, 1);
  assert.equal(response.body.data.completionRate, 50);
});

test("keeps progress separate for each user", () => {
  replaceTasks(
    createRequest("1001", { body: { tasks: [{ id: "0" }] } }),
    createResponse(),
  );
  completeTask(
    createRequest("1001", {
      params: { id: "0" },
      body: { isCompleted: true },
    }),
    createResponse(),
  );

  const otherUserResponse = createResponse();
  getProgress(createRequest("1002"), otherUserResponse);

  assert.equal(otherUserResponse.body.data.completedTasks, 0);
  assert.equal(otherUserResponse.body.data.streak, 0);
});

test("requires every task before check-in and prevents duplicate check-in", () => {
  replaceTasks(
    createRequest("1001", { body: { tasks: [{ id: "0" }] } }),
    createResponse(),
  );

  const earlyResponse = createResponse();
  checkIn(createRequest("1001"), earlyResponse);
  assert.equal(earlyResponse.statusCode, 400);

  completeTask(
    createRequest("1001", {
      params: { id: "0" },
      body: { isCompleted: true },
    }),
    createResponse(),
  );

  const successResponse = createResponse();
  checkIn(createRequest("1001"), successResponse);
  assert.equal(successResponse.body.data.streak, 1);

  const duplicateResponse = createResponse();
  checkIn(createRequest("1001"), duplicateResponse);
  assert.equal(duplicateResponse.statusCode, 409);
});

test("resets the streak when the previous check-in was not yesterday", () => {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  fs.writeFileSync(
    testDataFile,
    JSON.stringify({
      users: {
        "1001": {
          tasks: [{ id: "0", isCompleted: true }],
          taskDate: getDateKey(),
          streak: 5,
          lastCheckInDate: getDateKey(twoDaysAgo),
          checkInDates: [getDateKey(twoDaysAgo)],
        },
      },
    }),
    "utf-8",
  );

  const response = createResponse();
  checkIn(createRequest("1001"), response);

  assert.equal(response.body.data.streak, 1);
});

test("rejects requests without a user ID", () => {
  const response = createResponse();
  getProgress(createRequest(null), response);

  assert.equal(response.statusCode, 401);
});

test("rejects unknown users", () => {
  const response = createResponse();
  getProgress(createRequest("9999"), response);

  assert.equal(response.statusCode, 403);
});
