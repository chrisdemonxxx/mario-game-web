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
 * Find the most recent comment with a specific pattern
 * @param {Array} comments - Array of comment objects from GitHub API
 * @param {string} pattern - Pattern to search for (e.g., "QA: PASSED")
 * @returns {Object|null} - The comment object or null if not found
 */
function findLatestCommentWithPattern(comments, pattern) {
    if (!Array.isArray(comments)) {
        return null;
    }

    // Search from end to start to find most recent
    for (let i = comments.length - 1; i >= 0; i--) {
        if (comments[i].body && comments[i].body.includes(pattern)) {
            return comments[i];
        }
    }
    return null;
}

/**
 * Determine if labels should be removed based on SHA mismatch
 * @param {string} currentHeadSha - The current PR head SHA
 * @param {Array} comments - PR comments
 * @param {string} statusPattern - Pattern like "QA: PASSED" or "REVIEW: APPROVED"
 * @returns {boolean} - True if labels should be removed (SHA mismatch or no previous comment)
 */
function shouldRemoveLabelsForSha(currentHeadSha, comments, statusPattern) {
    const latestComment = findLatestCommentWithPattern(comments, statusPattern);
    if (!latestComment) {
        return true; // No previous status comment, labels are stale
    }

    const approvedSha = extractShaFromComment(latestComment.body, statusPattern);
    if (!approvedSha) {
        return true; // Couldn't extract SHA from old comment, labels are stale
    }

    return !compareShas(currentHeadSha, approvedSha);
}

/**
 * Get labels that should be removed for QA stage
 * When QA posts a new comment, remove stale qa-passed and qa-failed labels
 * @param {Array} currentLabels - Current PR labels
 * @returns {Array<string>} - Labels to remove
 */
function getQaLabelsToRemove(currentLabels) {
    const labelNames = currentLabels.map(l => typeof l === 'string' ? l : l.name);
    const toRemove = [];

    if (labelNames.includes('qa-passed')) toRemove.push('qa-passed');
    if (labelNames.includes('qa-failed')) toRemove.push('qa-failed');

    return toRemove;
}

/**
 * Get labels that should be removed for Reviewer stage
 * When head SHA differs from last approval, remove approval-related labels
 * @param {Array} currentLabels - Current PR labels
 * @returns {Array<string>} - Labels to remove
 */
function getReviewerLabelsToRemove(currentLabels) {
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