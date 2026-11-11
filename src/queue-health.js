/**
 * Queue Health Monitoring Utilities
 * Analyzes pipeline state and identifies blocked/delayed PRs and issues
 * Used by Sentinel routine for alerting
 */

/**
 * Calculates the age of an item in hours
 * @param {Date|string} createdAt - Creation timestamp (ISO 8601)
 * @param {Date|string} referenceTime - Reference time for calculation (default: now)
 * @returns {number} Age in hours
 */
function calculateAge(createdAt, referenceTime = new Date()) {
    const created = new Date(createdAt);
    const reference = new Date(referenceTime);
    const diffMs = reference - created;
    return diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
}

/**
 * Gets the severity level based on age
 * @param {number} ageHours - Age in hours
 * @returns {string} Severity level: 'green' (< 24h), 'yellow' (24-48h), or 'red' (> 48h)
 */
function getSeverity(ageHours) {
    if (ageHours < 24) return 'green';
    if (ageHours < 48) return 'yellow';
    return 'red';
}

/**
 * Analyzes a PR for queue health issues
 * @param {Object} pr - Pull request object from GitHub API
 * @param {Date|string} referenceTime - Reference time for age calculation
 * @returns {Object|null} Queue health issue or null if no issues found
 */
function analyzePR(pr, referenceTime = new Date()) {
    const issues = [];
    
    // Check for qa-failed
    if (pr.labels && pr.labels.some(l => l.name === 'qa-failed')) {
        const age = calculateAge(pr.created_at, referenceTime);
        issues.push({
            type: 'qa-failed',
            age,
            severity: getSeverity(age),
            number: pr.number,
            link: pr.html_url,
            title: pr.title,
            created_at: pr.created_at,
            updated_at: pr.updated_at,
            labels: pr.labels.map(l => l.name),
        });
    }

    // Check for changes-requested
    if (pr.labels && pr.labels.some(l => l.name === 'changes-requested')) {
        const age = calculateAge(pr.created_at, referenceTime);
        issues.push({
            type: 'changes-requested',
            age,
            severity: getSeverity(age),
            number: pr.number,
            link: pr.html_url,
            title: pr.title,
            created_at: pr.created_at,
            updated_at: pr.updated_at,
            labels: pr.labels.map(l => l.name),
        });
    }

    // Check for approved but not merged
    if (
        pr.labels && 
        pr.labels.some(l => l.name === 'approved') &&
        !pr.merged_at
    ) {
        const age = calculateAge(pr.created_at, referenceTime);
        issues.push({
            type: 'approved-not-merged',
            age,
            severity: getSeverity(age),
            number: pr.number,
            link: pr.html_url,
            title: pr.title,
            created_at: pr.created_at,
            updated_at: pr.updated_at,
            labels: pr.labels.map(l => l.name),
        });
    }

    // Check for feature label with no qa comment yet (skip if merged)
    if (
        pr.labels && 
        pr.labels.some(l => l.name === 'feature') &&
        !pr.labels.some(l => l.name === 'qa-passed') &&
        !pr.labels.some(l => l.name === 'qa-failed') &&
        !pr.merged_at
    ) {
        const age = calculateAge(pr.created_at, referenceTime);
        if (age > 2) { // Only flag if waiting > 2 hours
            issues.push({
                type: 'qa-pending',
                age,
                severity: getSeverity(age),
                number: pr.number,
                link: pr.html_url,
                title: pr.title,
                created_at: pr.created_at,
                updated_at: pr.updated_at,
                labels: pr.labels.map(l => l.name),
            });
        }
    }

    return issues.length > 0 ? issues : null;
}

/**
 * Analyzes an issue for queue health issues
 * @param {Object} issue - Issue object from GitHub API
 * @param {Date|string} referenceTime - Reference time for age calculation
 * @returns {Object|null} Queue health issue or null if no issues found
 */
function analyzeIssue(issue, referenceTime = new Date()) {
    // Check for blocked label
    if (issue.labels && issue.labels.some(l => l.name === 'blocked')) {
        const age = calculateAge(issue.created_at, referenceTime);
        return {
            type: 'blocked',
            age,
            severity: getSeverity(age),
            number: issue.number,
            link: issue.html_url,
            title: issue.title,
            created_at: issue.created_at,
            updated_at: issue.updated_at,
            labels: issue.labels.map(l => l.name),
        };
    }

    return null;
}

/**
 * Aggregates queue health issues and calculates summary
 * @param {Array} prs - Array of PR objects
 * @param {Array} issues - Array of issue objects
 * @param {Date|string} referenceTime - Reference time for calculations
 * @returns {Object} Queue health summary with detailed issues
 */
function getQueueHealth(prs = [], issues = [], referenceTime = new Date()) {
    const allIssues = [];
    const summary = {
        qa_failed: [],
        changes_requested: [],
        approved_not_merged: [],
        qa_pending: [],
        blocked_issues: [],
        criticalCount: 0, // Items over 48h
        warningCount: 0, // Items over 24h
        timestamp: referenceTime,
    };

    // Analyze PRs
    prs.forEach(pr => {
        const prIssues = analyzePR(pr, referenceTime);
        if (prIssues) {
            prIssues.forEach(issue => {
                allIssues.push(issue);
                if (issue.type === 'qa-failed') summary.qa_failed.push(issue);
                if (issue.type === 'changes-requested') summary.changes_requested.push(issue);
                if (issue.type === 'approved-not-merged') summary.approved_not_merged.push(issue);
                if (issue.type === 'qa-pending') summary.qa_pending.push(issue);
                
                if (issue.severity === 'red') summary.criticalCount++;
                if (issue.severity === 'yellow' || issue.severity === 'red') summary.warningCount++;
            });
        }
    });

    // Analyze issues
    issues.forEach(issue => {
        const issueProblems = analyzeIssue(issue, referenceTime);
        if (issueProblems) {
            allIssues.push(issueProblems);
            summary.blocked_issues.push(issueProblems);
            
            if (issueProblems.severity === 'red') summary.criticalCount++;
            if (issueProblems.severity === 'yellow' || issueProblems.severity === 'red') summary.warningCount++;
        }
    });

    return {
        ...summary,
        allIssues: allIssues.sort((a, b) => b.age - a.age), // Sort by age descending
    };
}

/**
 * Formats queue health data into a markdown table for GitHub alerts
 * @param {Object} queueHealth - Result from getQueueHealth()
 * @returns {string} Markdown table of queue health
 */
function formatQueueHealthTable(queueHealth) {
    if (queueHealth.allIssues.length === 0) {
        return '✅ Queue is healthy\n\nNo issues or PRs waiting over 24 hours.';
    }

    let table = '| Item | Type | Age | Status | Link |\n';
    table += '|---|---|---|---|---|\n';

    queueHealth.allIssues.forEach(item => {
        const severity = item.severity === 'red' ? '🔴' : item.severity === 'yellow' ? '🟡' : '🟢';
        const ageStr = item.age < 1 ? '< 1h' : item.age < 24 ? Math.round(item.age) + 'h' : Math.round(item.age / 24) + 'd';
        const typeLabel = item.type
            .replace(/-/g, ' ')
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
        
        table += '| #' + item.number + ' | ' + typeLabel + ' | ' + ageStr + ' | ' + severity + ' | [Link](' + item.link + ') |\n';
    });

    return table;
}

/**
 * Generates a summary line for Chief notification
 * @param {Object} queueHealth - Result from getQueueHealth()
 * @returns {string} Summary line for Chief notification
 */
function generateChiefSummary(queueHealth) {
    if (queueHealth.allIssues.length === 0) {
        return 'Queue is healthy — all items on track.';
    }

    const critical = queueHealth.criticalCount;
    const warning = queueHealth.warningCount;
    const items = queueHealth.allIssues.map(i => '#' + i.number).join(' ');

    if (critical > 0) {
        return '⚠️ ' + critical + ' item(s) blocked 48h+, ' + (warning - critical) + ' item(s) 24-48h: ' + items;
    }

    return '⚠️ ' + warning + ' item(s) blocked 24h+: ' + items;
}

// Export for Jest testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateAge,
        getSeverity,
        analyzePR,
        analyzeIssue,
        getQueueHealth,
        formatQueueHealthTable,
        generateChiefSummary,
    };
}
