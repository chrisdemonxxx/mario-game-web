/**
 * Queue Health Monitoring Tests
 */

const {
    calculateAge,
    getSeverity,
    analyzePR,
    analyzeIssue,
    getQueueHealth,
    formatQueueHealthTable,
    generateChiefSummary,
} = require('../src/queue-health');

describe('Queue Health Monitoring', () => {
    const referenceTime = new Date('2026-11-11T17:13:36Z');

    describe('calculateAge', () => {
        test('should calculate age correctly for items created 1 hour ago', () => {
            const oneHourAgo = new Date('2026-11-11T16:13:36Z');
            const age = calculateAge(oneHourAgo, referenceTime);
            expect(age).toBe(1);
        });

        test('should calculate age correctly for items created 24 hours ago', () => {
            const oneDayAgo = new Date('2026-11-10T17:13:36Z');
            const age = calculateAge(oneDayAgo, referenceTime);
            expect(age).toBe(24);
        });

        test('should calculate age correctly for items created 48 hours ago', () => {
            const twoDaysAgo = new Date('2026-11-09T17:13:36Z');
            const age = calculateAge(twoDaysAgo, referenceTime);
            expect(age).toBe(48);
        });
    });

    describe('getSeverity', () => {
        test('should return green for age < 24 hours', () => {
            expect(getSeverity(12)).toBe('green');
            expect(getSeverity(23)).toBe('green');
        });

        test('should return yellow for age 24-48 hours', () => {
            expect(getSeverity(24)).toBe('yellow');
            expect(getSeverity(36)).toBe('yellow');
        });

        test('should return red for age > 48 hours', () => {
            expect(getSeverity(49)).toBe('red');
            expect(getSeverity(72)).toBe('red');
        });
    });

    describe('analyzePR', () => {
        test('should detect qa-failed PRs', () => {
            const pr = {
                number: 1,
                title: 'Test PR',
                html_url: 'https://github.com/test/pull/1',
                created_at: '2026-11-09T17:13:36Z',
                updated_at: '2026-11-10T17:13:36Z',
                labels: [
                    { name: 'feature' },
                    { name: 'qa-failed' },
                ],
            };

            const result = analyzePR(pr, referenceTime);
            expect(result).not.toBeNull();
            expect(result.length).toBe(1);
            expect(result[0].type).toBe('qa-failed');
            expect(result[0].severity).toBe('red');
        });
    });

    describe('analyzeIssue', () => {
        test('should detect blocked issues', () => {
            const issue = {
                number: 27,
                title: 'Blocked issue',
                html_url: 'https://github.com/test/issues/27',
                created_at: '2026-11-09T17:13:36Z',
                updated_at: '2026-11-10T17:13:36Z',
                labels: [{ name: 'blocked' }],
            };

            const result = analyzeIssue(issue, referenceTime);
            expect(result).not.toBeNull();
            expect(result.type).toBe('blocked');
            expect(result.severity).toBe('red');
        });
    });

    describe('getQueueHealth', () => {
        test('should return empty queue health when no issues', () => {
            const result = getQueueHealth([], [], referenceTime);
            expect(result.qa_failed).toEqual([]);
            expect(result.criticalCount).toBe(0);
        });
    });

    describe('formatQueueHealthTable', () => {
        test('should return healthy message when no issues', () => {
            const queueHealth = {
                qa_failed: [],
                changes_requested: [],
                approved_not_merged: [],
                blocked_issues: [],
                criticalCount: 0,
                warningCount: 0,
                allIssues: [],
            };

            const result = formatQueueHealthTable(queueHealth);
            expect(result).toContain('✅ Queue is healthy');
        });
    });

    describe('generateChiefSummary', () => {
        test('should return healthy message when no issues', () => {
            const queueHealth = {
                qa_failed: [],
                changes_requested: [],
                approved_not_merged: [],
                blocked_issues: [],
                criticalCount: 0,
                warningCount: 0,
                allIssues: [],
            };

            const result = generateChiefSummary(queueHealth);
            expect(result).toBe('Queue is healthy — all items on track.');
        });
    });
});
