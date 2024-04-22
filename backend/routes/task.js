const express = require("express");
const router = express.Router();

const {
  newTask,
  myTasks,
  updateTask,
  myWorks,
  newTaskRequest,
  nearbyTasks,
  requestApplication,
  updateTaskRate,
} = require("../controllers/taskController");
const { isAuthenticatedUser } = require("../midllewares/auth");
const { classify, summarize } = require("../midllewares/chatgpt");

router.route("/task/new").post(isAuthenticatedUser, classify, summarize, newTask);
router.route("/task/request").post(isAuthenticatedUser, classify, summarize, newTaskRequest);
router.route("/task/request/apply").put(isAuthenticatedUser, requestApplication);
router.route("/tasks").get(isAuthenticatedUser, myTasks);
router.route("/tasks/nearby")
            .get(isAuthenticatedUser, nearbyTasks)
            .post(isAuthenticatedUser, nearbyTasks);
router.route("/works").get(isAuthenticatedUser, myWorks);
router.route("/task/:id").put(isAuthenticatedUser, updateTask);
router.route("/taskrate").put(isAuthenticatedUser, updateTaskRate);

module.exports = router;
