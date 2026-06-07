const express = require("express");
const router = express.Router();

const groupController = require("../controllers/groupController");

router.post("/", groupController.createGroup);
router.get("/my", groupController.getMyGroups);
router.get("/search-users", groupController.searchUsers);
router.post("/invitations", groupController.sendInvitation);
router.get("/invitations/sent", groupController.getSentInvitations);
router.get("/invitations/received", groupController.getReceivedInvitations);
router.patch("/invitations/:invitationId/accept", groupController.acceptInvitation);
router.patch("/invitations/:invitationId/reject", groupController.rejectInvitation);
router.patch("/:groupId/leave", groupController.leaveGroup);
router.patch("/:groupId/members/:memberId/remove", groupController.removeGroupMember);
router.get("/:groupId/progress", groupController.getGroupProgress);
router.delete("/:groupId", groupController.deleteGroup);

module.exports = router;