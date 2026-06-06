import assert from "node:assert/strict";
import test from "node:test";
import {
  checkIn,
  completeTask,
  getProgress,
  replaceTasks,
  resetProgressForTests,
} from "./progressController.js";

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
    { params: { id: "1" }, body: { completed: true } },
    completeResponse,
  );

  assert.equal(completeResponse.body.progress.completedTasks, 1);
  assert.equal(completeResponse.body.progress.completionRate, 50);
});

test("requires every task before check-in and prevents duplicate check-in", () => {
  replaceTasks({ body: { tasks: [{ id: "1" }] } }, createResponse());

  const earlyResponse = createResponse();
  checkIn({}, earlyResponse);
  assert.equal(earlyResponse.statusCode, 400);

  completeTask(
    { params: { id: "1" }, body: { completed: true } },
    createResponse(),
  );

  const successResponse = createResponse();
  checkIn({}, successResponse);
  assert.equal(successResponse.statusCode, 200);
  assert.equal(successResponse.body.progress.streak, 1);

  const duplicateResponse = createResponse();
  checkIn({}, duplicateResponse);
  assert.equal(duplicateResponse.statusCode, 409);
});

test("returns the current progress payload", () => {
  const response = createResponse();
  getProgress({}, response);

  assert.deepEqual(response.body, {
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    streak: 0,
    hasCheckedIn: false,
    lastCheckInDate: null,
    checkInDates: [],
  });
});
