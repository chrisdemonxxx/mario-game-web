/**
 * Tests for SHA-bound label utilities
 */

const {
    extractShaFromComment,
    compareShas,
    findLatestCommentWithPattern,
    shouldRemoveLabelsForSha,
    formatStatusComment,
} = require('../src/sha-bound-labels');

describe('SHA-bound Labels', () => {
    describe('extractShaFromComment', () => {
        it('should extract 7-char SHA from QA comment', () => {
            const comment = 'QA: PASSED sha=abc1234\n\nAll tests passed.';
            const sha = extractShaFromComment(comment, 'QA: PASSED');
            expect(sha).toBe('abc1234');
        });

        it('should extract 7-char SHA from full-length SHA', () => {
            const comment = 'REVIEW: APPROVED sha=abc12345678901234567890';
            const sha = extractShaFromComment(comment, 'REVIEW: APPROVED');
            expect(sha).toBe('abc1234');
        });

        it('should return null if pattern not found', () => {
            const comment = 'Some random comment';
            const sha = extractShaFromComment(comment, 'QA: PASSED');
            expect(sha).toBeNull();
        });

        it('should return null if comment is null or undefined', () => {
            expect(extractShaFromComment(null, 'QA: PASSED')).toBeNull();
            expect(extractShaFromComment(undefined, 'QA: PASSED')).toBeNull();
        });

        it('should return null if SHA not found in comment', () => {
            const comment = 'QA: PASSED\n\nNo SHA here';
            const sha = extractShaFromComment(comment, 'QA: PASSED');
            expect(sha).toBeNull();
        });
    });

    describe('compareShas', () => {
        it('should return true for matching 7-char SHAs', () => {
            expect(compareShas('abc1234', 'abc1234')).toBe(true);
        });

        it('should return true when comparing 7-char and full-length SHAs', () => {
            expect(compareShas('abc1234', 'abc12345678901234567890')).toBe(true);
        });

        it('should return true when comparing full-length SHAs with matching first 7 chars', () => {
            expect(compareShas('abc12345678901234567890', 'abc1234def5678901234567890')).toBe(true);
        });

        it('should return false for non-matching SHAs', () => {
            expect(compareShas('abc1234', 'def5678')).toBe(false);
        });

        it('should return false for null or undefined', () => {
            expect(compareShas(null, 'abc1234')).toBe(false);
            expect(compareShas('abc1234', null)).toBe(false);
            expect(compareShas(undefined, 'abc1234')).toBe(false);
        });
    });

    describe('findLatestCommentWithPattern', () => {
        it('should find the most recent comment with pattern', () => {
            const comments = [
                { body: 'Initial comment' },
                { body: 'QA: PASSED sha=abc1234' },
                { body: 'Final comment' },
            ];
            const found = findLatestCommentWithPattern(comments, 'QA: PASSED');
            expect(found.body).toBe('QA: PASSED sha=abc1234');
        });

        it('should return the last occurrence of pattern', () => {
            const comments = [
                { body: 'QA: PASSED sha=abc1234' },
                { body: 'Updating: QA: PASSED sha=def5678' },
            ];
            const found = findLatestCommentWithPattern(comments, 'QA: PASSED');
            expect(found.body).toContain('def5678');
        });

        it('should return null if pattern not found', () => {
            const comments = [
                { body: 'Comment 1' },
                { body: 'Comment 2' },
            ];
            const found = findLatestCommentWithPattern(comments, 'QA: PASSED');
            expect(found).toBeNull();
        });

        it('should return null for empty comments array', () => {
            const found = findLatestCommentWithPattern([], 'QA: PASSED');
            expect(found).toBeNull();
        });

        it('should handle comments without body field', () => {
            const comments = [
                { body: 'QA: PASSED sha=abc1234' },
                { id: 123 }, // No body
                { body: 'Another comment' },
            ];
            const found = findLatestCommentWithPattern(comments, 'QA: PASSED');
            expect(found.body).toContain('abc1234');
        });
    });

    describe('shouldRemoveLabelsForSha', () => {
        it('should return true when head SHA differs from approval SHA', () => {
            const comments = [
                { body: 'REVIEW: APPROVED sha=abc1234' },
            ];
            const result = shouldRemoveLabelsForSha('def5678', comments, 'REVIEW: APPROVED');
            expect(result).toBe(true);
        });

        it('should return false when head SHA matches approval SHA', () => {
            const comments = [
                { body: 'REVIEW: APPROVED sha=abc1234' },
            ];
            const result = shouldRemoveLabelsForSha('abc1234', comments, 'REVIEW: APPROVED');
            expect(result).toBe(false);
        });

        it('should return false when no status comment exists', () => {
            const comments = [
                { body: 'Some other comment' },
            ];
            const result = shouldRemoveLabelsForSha('abc1234', comments, 'REVIEW: APPROVED');
            expect(result).toBe(false);
        });

        it('should handle multiple comments and find latest', () => {
            const comments = [
                { body: 'REVIEW: APPROVED sha=abc1234' },
                { body: 'Some update' },
                { body: 'REVIEW: APPROVED sha=def5678' },
            ];
            // New head SHA doesn't match latest approval
            const result = shouldRemoveLabelsForSha('ghi9012', comments, 'REVIEW: APPROVED');
            expect(result).toBe(true);
        });
    });

    describe('formatStatusComment', () => {
        it('should format QA PASSED comment with SHA', () => {
            const comment = formatStatusComment('QA', 'PASSED', 'abc1234567890', 'All tests passed');
            expect(comment).toContain('QA: PASSED sha=abc1234');
            expect(comment).toContain('All tests passed');
        });

        it('should format REVIEW APPROVED comment', () => {
            const comment = formatStatusComment('REVIEW', 'APPROVED', 'def5678901234', '');
            expect(comment).toBe('REVIEW: APPROVED sha=def5678');
        });

        it('should extract 7-char SHA from long hash', () => {
            const longSha = 'abc12345678901234567890abcdef1234567890';
            const comment = formatStatusComment('QA', 'FAILED', longSha, '');
            expect(comment).toBe('QA: FAILED sha=abc1234');
        });

        it('should include details when provided', () => {
            const comment = formatStatusComment(
                'QA',
                'FAILED',
                'abc1234',
                'Lint error in file.js: line 10'
            );
            expect(comment).toContain('Lint error in file.js');
        });
    });

    describe('Integration scenarios', () => {
        it('should handle full QA workflow: first pass, then update with new SHA', () => {
            // Initial QA pass on sha=abc1234
            const comments1 = [{ body: 'QA: PASSED sha=abc1234' }];
            const labels1 = ['feature', 'qa-passed'];

            // PR head updated to new SHA (dev pushes new commit)
            const newHeadSha = 'def5678';
            const shouldRemove = shouldRemoveLabelsForSha(
                newHeadSha,
                comments1,
                'QA: PASSED'
            );
            expect(shouldRemove).toBe(true);

            // QA posts new comment, removing old labels
            // NOTE: We don't test getQaLabelsToRemove here since it's not imported
            // It should be tested separately if needed

            // QA posts new result
            const newComment = formatStatusComment('QA', 'PASSED', newHeadSha, 'Retested after rebase');
            expect(newComment).toContain('def5678');
        });

        it('should handle review workflow with stale approval', () => {
            // Reviewer approves at sha=abc1234
            const comments = [{ body: 'REVIEW: APPROVED sha=abc1234' }];
            const labels = ['feature', 'qa-passed', 'approved'];

            // Developer rebases to new SHA
            const newHeadSha = 'def5678';
            const hasMismatch = shouldRemoveLabelsForSha(
                newHeadSha,
                comments,
                'REVIEW: APPROVED'
            );
            expect(hasMismatch).toBe(true);

            // NOTE: We don't test getReviewerLabelsToRemove here since it's not imported

            // Reviewer re-approves new SHA
            const newApproval = formatStatusComment('REVIEW', 'APPROVED', newHeadSha, '');
            expect(newApproval).toContain('def5678');
        });
    });
});
