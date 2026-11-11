/**
 * Queue health monitoring utilities
 * Detects and reports on blocked/pending PRs and issues in the pipeline
 */

/**
 * Calculate the age of an item in hours from its creation or update date
 * @param {string|Date} timestamp - ISO 8601 timestamp or Date object
 * @param {Date} currentTime - Current time for comparison (defaults to now)
 * @returns {number} Age in hours (rounded to 1 decimal)
 */
function calculateAgeInHours(timestamp, currentTime = new Date()) {
    const itemTime = new Date(timestamp);
    const diffMs = currentTime - itemTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 10) / 10;
}

/**
 * Determine alert level based on age threshold
 * @param {number} ageInHours - Age in hours
 * @returns {string} Alert level: 'green', 'yellow', or 'red'
 */
function getAlertLevel(ageInHours) {
    if (ageInHours > 48) {
        return 'red';
    }
    if (ageInHours >= 24) {
        return 'yellow';
    }
    return 'green';
}

/**
 * Get alert status symbol
 * @param {string} level - Alert level: 'green', 'yellow', or 'red'
 * @returns {string} Symbol representing alert level
 */
function getAlertSymbol(level) {
    const symbols = {
        green: '✅',
        yellow: '⚠️',
        red: '🔴',
    };
    return symbols[level] || '❓';
}

/**
 * Identify PRs awaiting QA (feature label, no QA comment yet)
 * @param {Array} prs - Array of PR objects from GitHub API
 * @param {Date} currentTime - Current time for age calculation
 * @returns {Array} Array of objects: { number, title, age_hours, level, symbol, link }
 */
function identifyQaPendingPrs(prs, currentTime = new Date()) {
    return prs
        .filter((pr) => {
            const labels = pr.labels.map((l) => l.name);
            return labels.includes('feature') && !labels.includes('qa-passed') && !labels.includes('qa-failed');
        })
        .map((pr) => {
            const ageHours = calculateAgeInHours(pr.created_at, currentTime);
            const level = getAlertLevel(ageHours);
            return {
                number: pr.number,
                title: pr.title,
                age_hours: ageHours,
                status: 'Waiting for QA',
                level,
                symbol: getAlertSymbol(level),
                link: pr.html_url,
                created_at: pr.created_at,
                updated_at: pr.updated_at,
            };
        });
}

/**
 * Identify PRs with QA failures
 * @param {Array} prs - Array of PR objects from GitHub API
 * @param {Array} prComments - Object mapping PR number to comments array
 * @param {Date} currentTime - Current time for age calculation
 * @returns {Array} Array of objects with QA failure details
 */
function identifyQaFailedPrs(prs, prComments, currentTime = new Date()) {
    return prs
        .filter((pr) => {
            const labels = pr.labels.map((l) => l.name);
            return labels.includes('qa-failed');
        })
        .map((pr) => {
            const ageHours = calculateAgeInHours(pr.updated_at, currentTime);
            const level = getAlertLevel(ageHours);

            const comments = prComments[pr.number] || [];
            const qaFailedComment = comments
                .filter((c) => c.body && c.body.includes('QA: FAILED'))
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

            return {
                number: pr.number,
                title: pr.title,
                age_hours: ageHours,
                status: 'QA Failed',
                level,
                symbol: getAlertSymbol(level),
                link: pr.html_url,
                created_at: pr.created_at,
                updated_at: pr.updated_at,
                qa_comment: qaFailedComment ? qaFailedComment.body : 'No QA comment found',
                qa_comment_time: qaFailedComment ? qaFailedComment.created_at : null,
            };
        });
}

/**
 * Identify PRs awaiting changes (changes-requested label)
 * @param {Array} prs - Array of PR objects from GitHub API
 * @param {Array} prComments - Object mapping PR number to comments array
 * @param {Date} currentTime - Current time for age calculation
 * @returns {Array} Array of objects with changes-requested details
 */
function identifyChangesRequestedPrs(prs, prComments, currentTime = new Date()) {
    return prs
        .filter((pr) => {
            const labels = pr.labels.map((l) => l.name);
            return labels.includes('changes-requested');
        })
        .map((pr) => {
            const ageHours = calculateAgeInHours(pr.updated_at, currentTime);
            const level = getAlertLevel(ageHours);

            const comments = prComments[pr.number] || [];
            const reviewComment = comments
                .filter((c) => c.body && c.body.includes('REVIEW: CHANGES REQUESTED'))
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

            return {
                number: pr.number,
                title: pr.title,
                age_hours: ageHours,
                status: 'Changes Requested',
                level,
                symbol: getAlertSymbol(level),
                link: pr.html_url,
                created_at: pr.created_at,
                updated_at: pr.updated_at,
                review_comment: reviewComment ? reviewComment.body : 'No review comment found',
                review_comment_time: reviewComment ? reviewComment.created_at : null,
            };
        });
}

/**
 * Identify approved PRs that haven't been merged yet
 * @param {Array} prs - Array of PR objects from GitHub API
 * @param {Date} currentTime - Current time for age calculation
 * @returns {Array} Array of objects with approved-but-not-merged details
 */
function identifyApprovedNotMergedPrs(prs, currentTime = new Date()) {
    return prs
        .filter((pr) => {
            const labels = pr.labels.map((l) => l.name);
            return labels.includes('approved') && !pr.merged_at;
        })
        .map((pr) => {
            const ageHours = calculateAgeInHours(pr.updated_at, currentTime);
            const level = getAlertLevel(ageHours);

            return {
                number: pr.number,
                title: pr.title,
                age_hours: ageHours,
                status: 'Approved (Not Merged)',
                level,
                symbol: getAlertSymbol(level),
                link: pr.html_url,
                created_at: pr.created_at,
                updated_at: pr.updated_at,
            };
        });
}

/**
 * Identify blocked issues
 * @param {Array} issues - Array of issue objects from GitHub API
 * @param {Array} issueComments - Object mapping issue number to comments array
 * @param {Date} currentTime - Current time for age calculation
 * @returns {Array} Array of objects with blocked issue details
 */
function identifyBlockedIssues(issues, issueComments, currentTime = new Date()) {
    return issues
        .filter((issue) => {
            if (issue.pull_request) {
                return false;
            }
            const labels = issue.labels.map((l) => l.name);
            return labels.includes('blocked');
        })
        .map((issue) => {
            const ageHours = calculateAgeInHours(issue.updated_at, currentTime);
            const level = getAlertLevel(ageHours);

            const comments = issueComments[issue.number] || [];
            const blockReason = comments
                .filter((c) => c.body && c.body.includes('Blocked:'))
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

            return {
                number: issue.number,
                title: issue.title,
                age_hours: ageHours,
                status: 'Blocked',
                level,
                symbol: getAlertSymbol(level),
                link: issue.html_url,
                created_at: issue.created_at,
                updated_at: issue.updated_at,
                block_reason: blockReason ? blockReason.body : 'No reason provided',
                block_reason_time: blockReason ? blockReason.created_at : null,
            };
        });
}

/**
 * Compile a queue health summary from PRs and issues
 * @param {Object} params - Object containing prs, issues, prComments, issueComments, currentTime
 * @returns {Object} Queue health summary with counts and items by status
 */
function getQueueHealthSummary({ prs = [], issues = [], prComments = {}, issueComments = {}, currentTime = new Date() } = {}) {
    const qaPending = identifyQaPendingPrs(prs, currentTime);
    const qaFailed = identifyQaFailedPrs(prs, prComments, currentTime);
    const changesRequested = identifyChangesRequestedPrs(prs, prComments, currentTime);
    const approvedNotMerged = identifyApprovedNotMergedPrs(prs, currentTime);
    const blocked = identifyBlockedIssues(issues, issueComments, currentTime);

    const allItems = [...qaPending, ...qaFailed, ...changesRequested, ...approvedNotMerged, ...blocked];
    const alertCounts = {
        red: allItems.filter((i) => i.level === 'red').length,
        yellow: allItems.filter((i) => i.level === 'yellow').length,
        green: allItems.filter((i) => i.level === 'green').length,
    };

    return {
        summary: {
            total_items: allItems.length,
            red_count: alertCounts.red,
            yellow_count: alertCounts.yellow,
            green_count: alertCounts.green,
            timestamp: currentTime.toISOString(),
        },
        details: {
            qa_pending: qaPending,
            qa_failed: qaFailed,
            changes_requested: changesRequested,
            approved_not_merged: approvedNotMerged,
            blocked_issues: blocked,
        },
        all_items: allItems.sort((a, b) => b.age_hours - a.age_hours),
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateAgeInHours,
        getAlertLevel,
        getAlertSymbol,
        identifyQaPendingPrs,
        identifyQaFailedPrs,
        identifyChangesRequestedPrs,
        identifyApprovedNotMergedPrs,
        identifyBlockedIssues,
        getQueueHealthSummary,
    };
}
