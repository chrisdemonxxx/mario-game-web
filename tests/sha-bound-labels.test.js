/**
 * Tests for SHA-bound label utilities
 */

const {
    extractShaFromComment,
    compareShas,
    findLatestCommentWithPattern,
    shouldRemoveLabelsForSha,
    getQaLabelsToRemove,
    getReviewerLabelsToRemove,
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
        it('should find the latest comment with matching pattern', () => {
            const comments = [
                { body: 'QA: PASSED sha=abc1234' },
                { body: 'Code review done' },
                { body: 'QA: FAILED sha=def5678' }
            ];
            const latest = findLatestCommentWithPattern(comments, 'QA:');
            expect(latest.body).toBe('QA: FAILED sha=def5678');
        });

        it('should return null if no match found', () => {
            const comments = [
                { body: 'Just a comment' },
                { body: 'Another comment' }
            ];
            const result = findLatestCommentWithPattern(comments, 'QA:');
            expect(result).toBeNull();
        });

        it('should return null for empty comments array', () => {
            expect(findLatestCommentWithPattern([], 'QA:')).toBeNull();
        });
    });

    describe('shouldRemoveLabelsForSha', () => {
        it('should return false when SHA matches latest comment', () => {
            const comments = [{ body: 'QA: PASSED sha=abc1234' }];
            const result = shouldRemoveLabelsForSha('abc1234', comments, 'QA: PASSED');
            expect(result).toBe(false);
        });

        it('should return true when SHA differs from latest comment', () => {
            const comments = [{ body: 'QA: PASSED sha=abc1234' }];
            const result = shouldRemoveLabelsForSha('def5678', comments, 'QA: PASSED');
            expect(result).toBe(true);
        });

        it('should return true when no matching comment found', () => {
            const comments = [{ body: 'Just a comment' }];
            const result = shouldRemoveLabelsForSha('abc1234', comments, 'QA: PASSED');
            expect(result).toBe(true);
        });

        it('should handle empty comments array', () => {
            const result = shouldRemoveLabelsForSha('abc1234', [], 'QA: PASSED');
            expect(result).toBe(true);
        });

        it('should work with REVIEW: APPROVED pattern', () => {
            const comments = [{ body: 'REVIEW: APPROVED sha=abc1234' }];
            expect(shouldRemoveLabelsForSha('abc1234', comments, 'REVIEW: APPROVED')).toBe(false);
            expect(shouldRemoveLabelsForSha('def5678', comments, 'REVIEW: APPROVED')).toBe(true);
        });
    });

    describe('getQaLabelsToRemove', () => {
        it('should return empty array when no QA labels present', () => {
            const labels = ['feature', 'bug'];
            expect(getQaLabelsToRemove(labels)).toEqual([]);
        });

        it('should return qa-passed when present', () => {
            const labels = ['feature', 'qa-passed'];
            expect(getQaLabelsToRemove(labels)).toEqual(['qa-passed']);
        });

        it('should return qa-failed when present', () => {
            const labels = ['feature', 'qa-failed'];
            expect(getQaLabelsToRemove(labels)).toEqual(['qa-failed']);
        });

        it('should return both qa-passed and qa-failed when both present', () => {
            const labels = ['qa-passed', 'qa-failed'];
            const result = getQaLabelsToRemove(labels);
            expect(result).toContain('qa-passed');
            expect(result).toContain('qa-failed');
        });

        it('should handle label objects with name property', () => {
            const labels = [
                { name: 'feature', color: 'blue' },
                { name: 'qa-passed', color: 'green' }
            ];
            expect(getQaLabelsToRemove(labels)).toEqual(['qa-passed']);
        });

        it('should handle mixed string and object labels', () => {
            const labels = ['feature', { name: 'qa-failed', color: 'red' }];
            expect(getQaLabelsToRemove(labels)).toEqual(['qa-failed']);
        });
    });

    describe('getReviewerLabelsToRemove', () => {
        it('should return empty array when no review labels present', () => {
            const labels = ['feature', 'qa-passed'];
            expect(getReviewerLabelsToRemove(labels)).toEqual([]);
        });

        it('should return approved when present', () => {
            const labels = ['feature', 'approved'];
            expect(getReviewerLabelsToRemove(labels)).toEqual(['approved']);
        });

        it('should return changes-requested when present', () => {
            const labels = ['feature', 'changes-requested'];
            expect(getReviewerLabelsToRemove(labels)).toEqual(['changes-requested']);
        });

        it('should return both approved and changes-requested when both present', () => {
            const labels = ['approved', 'changes-requested'];
            const result = getReviewerLabelsToRemove(labels);
            expect(result).toContain('approved');
            expect(result).toContain('changes-requested');
        });

        it('should handle label objects with name property', () => {
            const labels = [
                { name: 'feature', color: 'blue' },
                { name: 'approved', color: 'green' }
            ];
            expect(getReviewerLabelsToRemove(labels)).toEqual(['approved']);
        });

        it('should handle mixed string and object labels', () => {
            const labels = ['feature', { name: 'changes-requested', color: 'red' }];
            expect(getReviewerLabelsToRemove(labels)).toEqual(['changes-requested']);
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
            // PR head updated to new SHA (dev pushes new commit)
            const newHeadSha = 'def5678';
            const shouldRemove = shouldRemoveLabelsForSha(
                newHeadSha,
                comments1,
                'QA: PASSED'
            );
            expect(shouldRemove).toBe(true);

            // QA posts new comment, removing old labels
            // NOTE: getQaLabelsToRemove is tested in its own describe block above

            // QA posts new result
            const newComment = formatStatusComment('QA', 'PASSED', newHeadSha, 'Retested after rebase');
            expect(newComment).toContain('def5678');
        });

        it('should handle review workflow with stale approval', () => {
            // Reviewer approves at sha=abc1234
            const comments = [{ body: 'REVIEW: APPROVED sha=abc1234' }];
            // Developer rebases to new SHA
            const newHeadSha = 'def5678';
            const hasMismatch = shouldRemoveLabelsForSha(
                newHeadSha,
                comments,
                'REVIEW: APPROVED'
            );
            expect(hasMismatch).toBe(true);

            // NOTE: getReviewerLabelsToRemove is tested in its own describe block above

            // Reviewer re-approves new SHA
            const newApproval = formatStatusComment('REVIEW', 'APPROVED', newHeadSha, '');
            expect(newApproval).toContain('def5678');
        });
    });
});
