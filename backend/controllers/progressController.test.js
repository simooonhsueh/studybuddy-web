const assert = require("node:assert/strict");
const test = require("node:test");
const {
  checkIn,
  completeTask,
  getProgress,
  replaceTasks,
  resetProgressForTests,
} = require("./progressController");

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

test.beforeEach(() => {
  resetProgressForTests();
});

test("tracks completed tasks and calculates completion rate", () => {
  replaceTasks(
    { body: { tasks: [{ id: "1" }, { id: "2" }] } },
    createResponse(),
  );

  const completeResponse = createResponse();
  completeTask(
    { params: { id: "1" }, body: { isCompleted: true } },
    completeResponse,
  );

  assert.equal(completeResponse.body.data.progress.completedTasks, 1);
  assert.equal(completeResponse.body.data.progress.completionRate, 50);
});

test("requires every task before check-in and prevents duplicate check-in", () => {
  replaceTasks({ body: { tasks: [{ id: "1" }] } }, createResponse());

  const earlyResponse = createResponse();
  checkIn({}, earlyResponse);
  assert.equal(earlyResponse.statusCode, 400);

  completeTask(
    { params: { id: "1" }, body: { isCompleted: true } },
    createResponse(),
  );

  const successResponse = createResponse();
  checkIn({}, successResponse);
  assert.equal(successResponse.statusCode, 200);
  assert.equal(successResponse.body.data.streak, 1);

  const duplicateResponse = createResponse();
  checkIn({}, duplicateResponse);
  assert.equal(duplicateResponse.statusCode, 409);
});

test("returns the current progress payload", () => {
  const response = createResponse();
  getProgress({}, response);

  assert.deepEqual(response.body, {
    status: "success",
    data: {
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      streak: 0,
      hasCheckedIn: false,
      lastCheckInDate: null,
      checkInDates: [],
    },
  });
});

test("rejects a missing task payload without crashing", () => {
  const response = createResponse();
  replaceTasks({ body: undefined }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.status, "error");
});
