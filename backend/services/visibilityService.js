function canViewProgress(viewerId, targetUser, sharedGroupIds) {
  if (!targetUser) return false;

  const visibility = targetUser.progressVisibility || "group";

  if (visibility === "public") {
    return true;
  }

  if (visibility === "private") {
    return String(viewerId) === String(targetUser.id);
  }

  if (visibility === "group") {
    return Array.isArray(sharedGroupIds) && sharedGroupIds.length > 0;
  }

  return false;
}

module.exports = {
  canViewProgress,
};