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

        test('should use current time when referenceTime is not provided', () => {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const age = calculateAge(oneHourAgo);
            expect(Math.abs(age - 1)).toBeLessThan(0.1); // Allow small margin for execution time
        });
    });

    describe('getSeverity', () => {
        test('should return green for age < 24 hours', () => {
            expect(getSeverity(12)).toBe('green');
            expect(getSeverity(23)).toBe('green');
            expect(getSeverity(0.5)).toBe('green');
        });

        test('should return yellow for age 24-48 hours', () => {
            expect(getSeverity(24)).toBe('yellow');
            expect(getSeverity(36)).toBe('yellow');
            expect(getSeverity(48)).toBe('red'); // Exactly 48 is red
        });

        test('should return red for age > 48 hours', () => {
            expect(getSeverity(49)).toBe('red');
            expect(getSeverity(72)).toBe('red');
            expect(getSeverity(100)).toBe('red');
        });
    });

    describe('analyzePR', () => {
        test('should detect qa-failed PRs', () => {
            const pr = {
                number: 1,
                title: 'Test PR',
                html_url: 'https://github.com/test/pull/1',
                created_at: '2026-11-09T17:13:36Z', // 48h ago
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
            expect(result[0].number).toBe(1);
        });

        test('should detect changes-requested PRs', () => {
            const pr = {
                number: 2,
                title: 'Test PR 2',
                html_url: 'https://github.com/test/pull/2',
                created_at: '2026-11-10T12:13:36Z', // 29h ago
                updated_at: '2026-11-11T12:13:36Z',
                labels: [
                    { name: 'feature' },
                    { name: 'changes-requested' },
                ],
            };

            const result = analyzePR(pr, referenceTime);
            expect(result).not.toBeNull();
            expect(result[0].type).toBe('changes-requested');
            expect(result[0].severity).toBe('yellow');
        });

        test('should detect approved but not merged PRs', () => {
            const pr = {
                number: 3,
                title: 'Test PR 3',
                html_url: 'https://github.com/test/pull/3',
                created_at: '2026-11-10T14:13:36Z', // 27h ago
                updated_at: '2026-11-11T14:13:36Z',
                merged_at: null,
                labels: [
                    { name: 'feature' },
                    { name: 'approved' },
                    { name: 'qa-passed' },
                ],
            };

            const result = analyzePR(pr, referenceTime);
            expect(result).not.toBeNull();
            expect(result[0].type).toBe('approved-not-merged');
            expect(result[0].severity).toBe('yellow');
        });

        test('should NOT flag merged PRs', () => {
            const pr = {
                number: 4,
                title: 'Merged PR',
                html_url: 'https://github.com/test/pull/4',
                created_at: '2026-11-09T14:13:36Z',
                updated_at: '2026-11-11T14:13:36Z',
                merged_at: '2026-11-11T15:00:00Z',
                labels: [
                    { name: 'feature' },
                    { name: 'approved' },
                ],
            };

            const result = analyzePR(pr, referenceTime);
            expect(result).toBeNull();
        });

        test('should detect qa-pending PRs waiting over 2 hours', () => {
            const pr = {
                number: 5,
                title: 'New feature PR',
                html_url: 'https://github.com/test/pull/5',
                created_at: '2026-11-11T14:13:36Z', // 3h ago
                updated_at: '2026-11-11T16:13:36Z',
                labels: [
                    { name: 'feature' },
                ],
            };

            const result = analyzePR(pr, referenceTime);
            expect(result).not.toBeNull();
            expect(result[0].type).toBe('qa-pending');
            expect(result[0].severity).toBe('green');
        });

        test('should NOT flag qa-pending PRs waiting less than 2 hours', () => {
            const pr = {
                number: 6,
                title: 'Just created PR',
                html_url: 'https://github.com/test/pull/6',
                created_at: '2026-11-11T16:13:36Z', // Just now
                updated_at: '2026-11-11T16:13:36Z',
                labels: [
                    { name: 'feature' },
                ],
            };

            const result = analyzePR(pr, referenceTime);
            expect(result).toBeNull();
        });

        test('should handle empty labels array', () => {
            const pr = {
                number: 7,
                title: 'PR with no labels',
                html_url: 'https://github.com/test/pull/7',
                created_at: '2026-11-11T16:13:36Z',
                updated_at: '2026-11-11T16:13:36Z',
                labels: [],
            };

            const result = analyzePR(pr, referenceTime);
            expect(result).toBeNull();
        });

        test('should handle undefined labels', () => {
            const pr = {
                number: 8,
                title: 'PR with undefined labels',
                html_url: 'https://github.com/test/pull/8',
                created_at: '2026-11-11T16:13:36Z',
                updated_at: '2026-11-11T16:13:36Z',
                labels: undefined,
            };

            const result = analyzePR(pr, referenceTime);
            expect(result).toBeNull();
        });
    });

    describe('analyzeIssue', () => {
        test('should detect blocked issues', () => {
            const issue = {
                number: 27,
                title: 'Blocked issue',
                html_url: 'https://github.com/test/issues/27',
                created_at: '2026-11-09T17:13:36Z', // 48h ago
                updated_at: '2026-11-10T17:13:36Z',
                labels: [
                    { name: 'blocked' },
                    { name: 'feature' },
                ],
            };

            const result = analyzeIssue(issue, referenceTime);
            expect(result).not.toBeNull();
            expect(result.type).toBe('blocked');
            expect(result.severity).toBe('red');
            expect(result.number).toBe(27);
        });

        test('should return null for issues without blocked label', () => {
            const issue = {
                number: 28,
                title: 'Normal issue',
                html_url: 'https://github.com/test/issues/28',
                created_at: '2026-11-11T16:13:36Z',
                updated_at: '2026-11-11T16:13:36Z',
                labels: [
                    { name: 'feature' },
                ],
            };

            const result = analyzeIssue(issue, referenceTime);
            expect(result).toBeNull();
        });
    });

    describe('getQueueHealth', () => {
        test('should return empty queue health when no issues', () => {
            const result = getQueueHealth([], [], referenceTime);

            expect(result.qa_failed).toEqual([]);
            expect(result.changes_requested).toEqual([]);
            expect(result.approved_not_merged).toEqual([]);
            expect(result.blocked_issues).toEqual([]);
            expect(result.criticalCount).toBe(0);
            expect(result.warningCount).toBe(0);
            expect(result.allIssues).toEqual([]);
        });

        test('should aggregate multiple queue health issues', () => {
            const prs = [
                {
                    number: 1,
                    title: 'PR with qa-failed',
                    html_url: 'https://github.com/test/pull/1',
                    created_at: '2026-11-09T17:13:36Z',
                    updated_at: '2026-11-10T17:13:36Z',
                    labels: [{ name: 'qa-failed' }],
                },
                {
                    number: 2,
                    title: 'PR with changes-requested',
                    html_url: 'https://github.com/test/pull/2',
                    created_at: '2026-11-10T14:13:36Z',
                    updated_at: '2026-11-11T14:13:36Z',
                    merged_at: null,
                    labels: [{ name: 'changes-requested' }],
                },
            ];

            const issues = [
                {
                    number: 27,
                    title: 'Blocked issue',
                    html_url: 'https://github.com/test/issues/27',
                    created_at: '2026-11-09T17:13:36Z',
                    updated_at: '2026-11-10T17:13:36Z',
                    labels: [{ name: 'blocked' }],
                },
            ];

            const result = getQueueHealth(prs, issues, referenceTime);

            expect(result.qa_failed.length).toBe(1);
            expect(result.changes_requested.length).toBe(1);
            expect(result.blocked_issues.length).toBe(1);
            expect(result.criticalCount).toBe(2); // qa-failed and blocked
            expect(result.warningCount).toBe(3); // qa-failed, changes-requested, blocked
            expect(result.allIssues.length).toBe(3);
        });

        test('should sort issues by age descending', () => {
            const prs = [
                {
                    number: 1,
                    title: 'Old PR',
                    html_url: 'https://github.com/test/pull/1',
                    created_at: '2026-11-09T17:13:36Z', // 48h
                    updated_at: '2026-11-10T17:13:36Z',
                    labels: [{ name: 'qa-failed' }],
                },
                {
                    number: 2,
                    title: 'Newer PR',
                    html_url: 'https://github.com/test/pull/2',
                    created_at: '2026-11-10T14:13:36Z', // 27h
                    updated_at: '2026-11-11T14:13:36Z',
                    labels: [{ name: 'qa-failed' }],
                },
            ];

            const result = getQueueHealth(prs, [], referenceTime);

            expect(result.allIssues[0].number).toBe(1); // Oldest first
            expect(result.allIssues[1].number).toBe(2);
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
            expect(result).toContain('No issues or PRs waiting over 24 hours');
        });

        test('should format issues into markdown table', () => {
            const queueHealth = {
                qa_failed: [
                    {
                        type: 'qa-failed',
                        age: 48,
                        severity: 'red',
                        number: 1,
                        link: 'https://github.com/test/pull/1',
                        title: 'Failed PR',
                        created_at: '2026-11-09T17:13:36Z',
                        updated_at: '2026-11-10T17:13:36Z',
                        labels: ['qa-failed'],
                    },
                ],
                changes_requested: [
                    {
                        type: 'changes-requested',
                        age: 30,
                        severity: 'yellow',
                        number: 2,
                        link: 'https://github.com/test/pull/2',
                        title: 'Changes requested PR',
                        created_at: '2026-11-10T12:13:36Z',
                        updated_at: '2026-11-11T12:13:36Z',
                        labels: ['changes-requested'],
                    },
                ],
                approved_not_merged: [],
                blocked_issues: [],
                criticalCount: 1,
                warningCount: 2,
                allIssues: [
                    {
                        type: 'qa-failed',
                        age: 48,
                        severity: 'red',
                        number: 1,
                        link: 'https://github.com/test/pull/1',
                        title: 'Failed PR',
                        created_at: '2026-11-09T17:13:36Z',
                        updated_at: '2026-11-10T17:13:36Z',
                        labels: ['qa-failed'],
                    },
                    {
                        type: 'changes-requested',
                        age: 30,
                        severity: 'yellow',
                        number: 2,
                        link: 'https://github.com/test/pull/2',
                        title: 'Changes requested PR',
                        created_at: '2026-11-10T12:13:36Z',
                        updated_at: '2026-11-11T12:13:36Z',
                        labels: ['changes-requested'],
                    },
                ],
            };

            const result = formatQueueHealthTable(queueHealth);
            expect(result).toContain('| Item | Type | Age | Status | Link |');
            expect(result).toContain('#1');
            expect(result).toContain('#2');
            expect(result).toContain('🔴'); // Red severity
            expect(result).toContain('🟡'); // Yellow severity
            expect(result).toContain('Qa Failed');
            expect(result).toContain('Changes Requested');
        });

        test('should format age in hours for recent items', () => {
            const queueHealth = {
                qa_failed: [],
                changes_requested: [
                    {
                        type: 'changes-requested',
                        age: 12,
                        severity: 'green',
                        number: 5,
                        link: 'https://github.com/test/pull/5',
                        title: 'Recent PR',
                        created_at: '2026-11-11T05:13:36Z',
                        updated_at: '2026-11-11T15:13:36Z',
                        labels: [],
                    },
                ],
                approved_not_merged: [],
                blocked_issues: [],
                criticalCount: 0,
                warningCount: 0,
                allIssues: [
                    {
                        type: 'changes-requested',
                        age: 12,
                        severity: 'green',
                        number: 5,
                        link: 'https://github.com/test/pull/5',
                        title: 'Recent PR',
                        created_at: '2026-11-11T05:13:36Z',
                        updated_at: '2026-11-11T15:13:36Z',
                        labels: [],
                    },
                ],
            };

            const result = formatQueueHealthTable(queueHealth);
            expect(result).toContain('12h');
        });

        test('should format age in days for older items', () => {
            const queueHealth = {
                qa_failed: [
                    {
                        type: 'qa-failed',
                        age: 72,
                        severity: 'red',
                        number: 3,
                        link: 'https://github.com/test/pull/3',
                        title: 'Old PR',
                        created_at: '2026-11-08T17:13:36Z',
                        updated_at: '2026-11-09T17:13:36Z',
                        labels: [],
                    },
                ],
                changes_requested: [],
                approved_not_merged: [],
                blocked_issues: [],
                criticalCount: 1,
                warningCount: 1,
                allIssues: [
                    {
                        type: 'qa-failed',
                        age: 72,
                        severity: 'red',
                        number: 3,
                        link: 'https://github.com/test/pull/3',
                        title: 'Old PR',
                        created_at: '2026-11-08T17:13:36Z',
                        updated_at: '2026-11-09T17:13:36Z',
                        labels: [],
                    },
                ],
            };

            const result = formatQueueHealthTable(queueHealth);
            expect(result).toContain('3d'); // 72 hours = 3 days
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

        test('should report critical items (> 48h)', () => {
            const queueHealth = {
                qa_failed: [
                    {
                        type: 'qa-failed',
                        age: 60,
                        severity: 'red',
                        number: 1,
                        link: 'https://github.com/test/pull/1',
                        title: 'Failed PR',
                        created_at: '2026-11-08T17:13:36Z',
                        updated_at: '2026-11-09T17:13:36Z',
                        labels: [],
                    },
                ],
                changes_requested: [
                    {
                        type: 'changes-requested',
                        age: 50,
                        severity: 'red',
                        number: 2,
                        link: 'https://github.com/test/pull/2',
                        title: 'Changes requested PR',
                        created_at: '2026-11-08T19:13:36Z',
                        updated_at: '2026-11-09T19:13:36Z',
                        labels: [],
                    },
                ],
                approved_not_merged: [],
                blocked_issues: [],
                criticalCount: 2,
                warningCount: 2,
                allIssues: [
                    {
                        type: 'qa-failed',
                        age: 60,
                        severity: 'red',
                        number: 1,
                        link: 'https://github.com/test/pull/1',
                        title: 'Failed PR',
                        created_at: '2026-11-08T17:13:36Z',
                        updated_at: '2026-11-09T17:13:36Z',
                        labels: [],
                    },
                    {
                        type: 'changes-requested',
                        age: 50,
                        severity: 'red',
                        number: 2,
                        link: 'https://github.com/test/pull/2',
                        title: 'Changes requested PR',
                        created_at: '2026-11-08T19:13:36Z',
                        updated_at: '2026-11-09T19:13:36Z',
                        labels: [],
                    },
                ],
            };

            const result = generateChiefSummary(queueHealth);
            expect(result).toContain('⚠️ 2 item(s) blocked 48h+');
            expect(result).toContain('#1');
            expect(result).toContain('#2');
        });

        test('should report warning items (24-48h) when no critical', () => {
            const queueHealth = {
                qa_failed: [],
                changes_requested: [
                    {
                        type: 'changes-requested',
                        age: 30,
                        severity: 'yellow',
                        number: 3,
                        link: 'https://github.com/test/pull/3',
                        title: 'Changes requested PR',
                        created_at: '2026-11-10T12:13:36Z',
                        updated_at: '2026-11-11T12:13:36Z',
                        labels: [],
                    },
                ],
                approved_not_merged: [
                    {
                        type: 'approved-not-merged',
                        age: 26,
                        severity: 'yellow',
                        number: 4,
                        link: 'https://github.com/test/pull/4',
                        title: 'Approved PR',
                        created_at: '2026-11-10T16:13:36Z',
                        updated_at: '2026-11-11T16:13:36Z',
                        labels: [],
                    },
                ],
                blocked_issues: [],
                criticalCount: 0,
                warningCount: 2,
                allIssues: [
                    {
                        type: 'changes-requested',
                        age: 30,
                        severity: 'yellow',
                        number: 3,
                        link: 'https://github.com/test/pull/3',
                        title: 'Changes requested PR',
                        created_at: '2026-11-10T12:13:36Z',
                        updated_at: '2026-11-11T12:13:36Z',
                        labels: [],
                    },
                    {
                        type: 'approved-not-merged',
                        age: 26,
                        severity: 'yellow',
                        number: 4,
                        link: 'https://github.com/test/pull/4',
                        title: 'Approved PR',
                        created_at: '2026-11-10T16:13:36Z',
                        updated_at: '2026-11-11T16:13:36Z',
                        labels: [],
                    },
                ],
            };

            const result = generateChiefSummary(queueHealth);
            expect(result).toContain('⚠️ 2 item(s) blocked 24h+');
            expect(result).toContain('#3');
            expect(result).toContain('#4');
        });

        test('should include all item numbers in summary', () => {
            const queueHealth = {
                qa_failed: [
                    {
                        type: 'qa-failed',
                        age: 50,
                        severity: 'red',
                        number: 10,
                        link: 'https://github.com/test/pull/10',
                        title: 'PR',
                        created_at: '2026-11-08T19:13:36Z',
                        updated_at: '2026-11-09T19:13:36Z',
                        labels: [],
                    },
                ],
                changes_requested: [],
                approved_not_merged: [],
                blocked_issues: [
                    {
                        type: 'blocked',
                        age: 25,
                        severity: 'yellow',
                        number: 20,
                        link: 'https://github.com/test/issues/20',
                        title: 'Issue',
                        created_at: '2026-11-10T16:13:36Z',
                        updated_at: '2026-11-11T16:13:36Z',
                        labels: [],
                    },
                ],
                criticalCount: 1,
                warningCount: 2,
                allIssues: [
                    {
                        type: 'qa-failed',
                        age: 50,
                        severity: 'red',
                        number: 10,
                        link: 'https://github.com/test/pull/10',
                        title: 'PR',
                        created_at: '2026-11-08T19:13:36Z',
                        updated_at: '2026-11-09T19:13:36Z',
                        labels: [],
                    },
                    {
                        type: 'blocked',
                        age: 25,
                        severity: 'yellow',
                        number: 20,
                        link: 'https://github.com/test/issues/20',
                        title: 'Issue',
                        created_at: '2026-11-10T16:13:36Z',
                        updated_at: '2026-11-11T16:13:36Z',
                        labels: [],
                    },
                ],
            };

            const result = generateChiefSummary(queueHealth);
            expect(result).toContain('#10');
            expect(result).toContain('#20');
        });
    });
});
