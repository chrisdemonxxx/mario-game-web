/**
 * Utility module for managing SHA-bound labels in the pipeline.
 */

/**
 * Extract SHA from a bot comment (e.g., "QA: PASSED sha=abc1234")
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
 */
function compareShas(sha1, sha2) {
    if (!sha1 || !sha2) {
        return false;
    }
    return sha1.substring(0, 7) === sha2.substring(0, 7);
}

/**
 * Find the most recent comment with a specific pattern
 */
function findLatestCommentWithPattern(comments, pattern) {
    if (!Array.isArray(comments)) {
        return null;
    }
    for (let i = comments.length - 1; i >= 0; i--) {
        if (comments[i].body && comments[i].body.includes(pattern)) {
            return comments[i];
        }
    }
    return null;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extractShaFromComment,
        compareShas,
        findLatestCommentWithPattern,
    };
}
