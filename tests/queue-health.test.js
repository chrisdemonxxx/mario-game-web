const {
    calculateAgeInHours,
    getAlertLevel,
    getAlertSymbol,
    identifyQaPendingPrs,
    identifyQaFailedPrs,
    identifyChangesRequestedPrs,
    identifyApprovedNotMergedPrs,
    identifyBlockedIssues,
    getQueueHealthSummary,
} = require('../src/queue-health');

describe('Queue Health Monitoring', () => {
    const now = new Date('2026-11-11T12:54:00Z');

    describe('calculateAgeInHours', () => {
        it('should calculate age correctly in hours', () => {
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            expect(calculateAgeInHours(oneHourAgo, now)).toBe(1.0);
        });

        it('should calculate 24 hours correctly', () => {
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            expect(calculateAgeInHours(oneDayAgo, now)).toBe(24.0);
        });
    });

    describe('getAlertLevel', () => {
        it('should return green for age < 24h', () => {
            expect(getAlertLevel(23)).toBe('green');
        });

        it('should return yellow for 24h <= age <= 48h', () => {
            expect(getAlertLevel(24)).toBe('yellow');
            expect(getAlertLevel(48)).toBe('yellow');
        });

        it('should return red for age > 48h', () => {
            expect(getAlertLevel(49)).toBe('red');
        });
    });

    describe('getAlertSymbol', () => {
        it('should return correct symbols', () => {
            expect(getAlertSymbol('green')).toBe('✅');
            expect(getAlertSymbol('yellow')).toBe('⚠️');
            expect(getAlertSymbol('red')).toBe('🔴');
        });
    });

    describe('identifyQaPendingPrs', () => {
        it('should identify PRs awaiting QA', () => {
            const prs = [
                {
                    number: 1,
                    title: 'Feature PR',
                    created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
                    html_url: 'https://github.com/test/test/pull/1',
                    labels: [{ name: 'feature' }],
                },
            ];

            const result = identifyQaPendingPrs(prs, now);
            expect(result).toHaveLength(1);
            expect(result[0].number).toBe(1);
            expect(result[0].status).toBe('Waiting for QA');
            expect(result[0].level).toBe('green');
        });

        it('should exclude PRs with qa-passed label', () => {
            const prs = [
                {
                    number: 1,
                    title: 'Feature PR',
                    created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
                    html_url: 'https://github.com/test/test/pull/1',
                    labels: [{ name: 'feature' }, { name: 'qa-passed' }],
                },
            ];

            const result = identifyQaPendingPrs(prs, now);
            expect(result).toHaveLength(0);
        });
    });

    describe('identifyQaFailedPrs', () => {
        it('should identify PRs with qa-failed label', () => {
            const prs = [
                {
                    number: 1,
                    title: 'Failed PR',
                    created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
                    html_url: 'https://github.com/test/test/pull/1',
                    labels: [{ name: 'qa-failed' }],
                },
            ];

            const prComments = {
                1: [
                    {
                        body: 'QA: FAILED sha=abc123\n\nLint errors found',
                        created_at: new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString(),
                    },
                ],
            };

            const result = identifyQaFailedPrs(prs, prComments, now);
            expect(result).toHaveLength(1);
            expect(result[0].number).toBe(1);
            expect(result[0].status).toBe('QA Failed');
        });
    });

    describe('identifyChangesRequestedPrs', () => {
        it('should identify PRs with changes-requested label', () => {
            const prs = [
                {
                    number: 1,
                    title: 'Changes PR',
                    created_at: new Date(now.getTime() - 30 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(now.getTime() - 30 * 60 * 60 * 1000).toISOString(),
                    html_url: 'https://github.com/test/test/pull/1',
                    labels: [{ name: 'changes-requested' }],
                },
            ];

            const prComments = {
                1: [
                    {
                        body: 'REVIEW: CHANGES REQUESTED sha=def456',
                        created_at: new Date(now.getTime() - 29 * 60 * 60 * 1000).toISOString(),
                    },
                ],
            };

            const result = identifyChangesRequestedPrs(prs, prComments, now);
            expect(result).toHaveLength(1);
            expect(result[0].number).toBe(1);
            expect(result[0].status).toBe('Changes Requested');
        });
    });

    describe('identifyApprovedNotMergedPrs', () => {
        it('should identify approved PRs not yet merged', () => {
            const prs = [
                {
                    number: 1,
                    title: 'Approved PR',
                    created_at: new Date(now.getTime() - 50 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(now.getTime() - 50 * 60 * 60 * 1000).toISOString(),
                    html_url: 'https://github.com/test/test/pull/1',
                    merged_at: null,
                    labels: [{ name: 'approved' }],
                },
            ];

            const result = identifyApprovedNotMergedPrs(prs, now);
            expect(result).toHaveLength(1);
            expect(result[0].number).toBe(1);
            expect(result[0].status).toBe('Approved (Not Merged)');
        });
    });

    describe('identifyBlockedIssues', () => {
        it('should identify issues with blocked label', () => {
            const issues = [
                {
                    number: 1,
                    title: 'Blocked Issue',
                    created_at: new Date(now.getTime() - 60 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(now.getTime() - 60 * 60 * 60 * 1000).toISOString(),
                    html_url: 'https://github.com/test/test/issues/1',
                    pull_request: null,
                    labels: [{ name: 'blocked' }],
                },
            ];

            const issueComments = {
                1: [
                    {
                        body: 'Blocked: Waiting for PR #123 to merge',
                        created_at: new Date(now.getTime() - 59 * 60 * 60 * 1000).toISOString(),
                    },
                ],
            };

            const result = identifyBlockedIssues(issues, issueComments, now);
            expect(result).toHaveLength(1);
            expect(result[0].number).toBe(1);
            expect(result[0].status).toBe('Blocked');
        });
    });

    describe('getQueueHealthSummary', () => {
        it('should compile a complete queue health summary', () => {
            const prs = [
                {
                    number: 1,
                    title: 'Feature PR',
                    created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
                    html_url: 'https://github.com/test/test/pull/1',
                    merged_at: null,
                    labels: [{ name: 'feature' }],
                },
            ];

            const result = getQueueHealthSummary({
                prs,
                issues: [],
                currentTime: now,
            });

            expect(result.summary.total_items).toBeGreaterThan(0);
            expect(result.details.qa_pending).toBeDefined();
            expect(result.all_items).toBeDefined();
        });

        it('should return empty summary when no items are found', () => {
            const result = getQueueHealthSummary({
                prs: [],
                issues: [],
                currentTime: now,
            });

            expect(result.summary.total_items).toBe(0);
            expect(result.summary.red_count).toBe(0);
            expect(result.all_items).toHaveLength(0);
        });
    });
});
