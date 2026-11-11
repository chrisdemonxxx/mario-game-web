/**
 * Utility module for managing SHA-bound labels in the pipeline.
 * Ensures labels (qa-passed, qa-failed, approved, changes-requested) are tied to specific commit SHAs
 * and automatically removed when the PR head changes.
 */

/**
 * Extract SHA from a bot comment (e.g., "QA: PASSED sha=abc1234")
 * @param {string} commentBody - The comment text
 * @param {string} pattern - Pattern to match, e.g., "QA: PASSED" or "REVIEW: APPROVED"
 * @returns {string|null} - The 7-char SHA if found, null otherwise
 */
function extractShaFromComment(commentBody, pattern) {
  if (!commentBody || !commentBody.includes(pattern)) {
    return null;
  }
  const match = commentBody.match(/sha=([a-f0-9]{7,40})/);
  return match ? match[1].substring(0, 7) : null;
}

/**
 * Compare two SHAs (handles both short and long form)
 * @param {string} sha1 - First SHA (can be 7-char or full)
 * @param {string} sha2 - Second SHA (can be 7-char or full)
 * @returns {boolean} - True if they match (comparing first 7 chars)
 */
function compareShas(sha1, sha2) {
  if (!sha1 || !sha2) {
    return false;
  }
  return sha1.substring(0, 7) === sha2.substring(0, 7);
}

/**
 * Lists comments in descending order and finds the latest that matches pattern
 * @param {array} comments - Comment array from GitHub Comments API
 * @param {string} pattern - Pattern to match, e.g., "QA: PASSED" or "REVIEW: APPROVED"
 * @returns {object|null} - The comment object if found, null otherwise
 */
function findLatestCommentWithPattern(comments, pattern) {
  if (!comments || comments.length === 0) {
    return null;
  }
  for (let i = comments.length - 1; i >= 0; i--) {
    if (comments[i].body && comments[i].body.includes(pattern)) {
      return comments[i];
    }
  }
  return null;
}

/**
 * Determines if labels should be removed for a given PR by checking if the PR head SHA differs from the commented SHA
 * @param {string} currentHeadSha - The current PR head SHA
 * @param {array} comments - Prior comments on the PR
 * @param {string} pattern - The status pattern to match, e.g., "QA: PASSED"
 * @returns {boolean} - True if labels should be removed
 */
function shouldRemoveLabelsForSha(currentHeadSha, comments, pattern) {
  const latestComment = findLatestCommentWithPattern(comments, pattern);
  if (!latestComment) {
    return false;
  }
  const commentedSha = extractShaFromComment(latestComment.body, pattern);
  return !compareShas(currentHeadSha, commentedSha);
}

/**
 * Determines which QA labels should be removed for a given PR
 * @param {string} currentHeadSha - The current PR head SHA
 * @param {array} comments - Prior comments on the PR
 * @param {array} currentLabels - Current labels on the PR
 * @returns {array} - Label names to remove
 */
function getQaLabelsToRemove(currentHeadSha, comments, currentLabels) {
  if (!shouldRemoveLabelsForSha(currentHeadSha, comments, 'QA: PASSED')) {
    return [];
  }
  const labelNames = currentLabels.map(l => typeof l === 'string' ? l : l.name);
  const toRemove = [];

  if (labelNames.includes('qa-passed')) toRemove.push('qa-passed');
  if (labelNames.includes('qa-failed')) toRemove.push('qa-failed');

  return toRemove;
}

/**
 * Determines which Reviewer labels should be removed for a given PR
 * @param {string} currentHeadSha - The current PR head SHA
 * @param {array} comments - Prior comments on the PR
 * @param {array} currentLabels - Current labels on the PR
 * @returns {array} - Label names to remove
 */
function getReviewerLabelsToRemove(currentHeadSha, comments, currentLabels) {
  if (!shouldRemoveLabelsForSha(currentHeadSha, comments, 'REVIEW: APPROVED')) {
    return [];
  }
  const labelNames = currentLabels.map(l => typeof l === 'string' ? l : l.name);
  const toRemove = [];

  if (labelNames.includes('approved')) toRemove.push('approved');
  if (labelNames.includes('changes-requested')) toRemove.push('changes-requested');

  return toRemove;
}

/**
 * Format a status comment with SHA
 * @param {string} statusType - "QA" or "REVIEW"
 * @param {string} result - "PASSED"/"FAILED" or "APPROVED"/"CHANGES REQUESTED"
 * @param {string} sha - Commit SHA
 * @param {string} details - Additional details (optional)
 * @returns {string} - Formatted comment body
 */
function formatStatusComment(statusType, result, sha, details = '') {
  const shortSha = sha.substring(0, 7);
  let body = `${statusType}: ${result} sha=${shortSha}`;
  if (details) {
    body += `\n\n${details}`;
  }
  return body;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractShaFromComment,
    compareShas,
    findLatestCommentWithPattern,
    shouldRemoveLabelsForSha,
    getQaLabelsToRemove,
    getReviewerLabelsToRemove,
    formatStatusComment,
  };
}
