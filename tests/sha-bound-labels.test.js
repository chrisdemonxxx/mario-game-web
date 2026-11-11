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
      const comment = 'REVIEW: APPROVED sha=abc123456789012345678901';
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
      expect(compareShas('abc1234', 'abc123456789012345678901')).toBe(true);
    });

    it('should return true when comparing full-length SHAs with matching first 7 chars', () => {
      expect(compareShas('abc123456789012345678901', 'abc1234def567890123456789')).toBe(true);
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
  });

  describe('shouldRemoveLabelsForSha', () => {
    it('should return true when head SHA differs from approval SHA', () => {
      const comments = [{ body: 'REVIEW: APPROVED sha=abc1234' }];
      const result = shouldRemoveLabelsForSha('def5678', comments, 'REVIEW: APPROVED');
      expect(result).toBe(true);
    });
  });

  describe('formatStatusComment', () => {
    it('should format QA PASSED comment with SHA', () => {
      const comment = formatStatusComment('QA', 'PASSED', 'abc123456789', 'All tests passed');
      expect(comment).toContain('QA: PASSED sha=abc1234');
      expect(comment).toContain('All tests passed');
    });
  });
});
