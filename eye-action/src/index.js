const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  const url = core.getInput('url', { required: true });
  const apiKey = core.getInput('api_key', { required: true });
  const failOnIssue = core.getInput('fail_on_issue') === 'true';

  core.info(`perceptdot Visual Check: ${url}`);

  // 1. CF Workers API 호출
  let response;
  try {
    response = await fetch('https://api.perceptdot.com/v1/eye/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ url }),
    });
  } catch (err) {
    core.setFailed(`Failed to reach perceptdot API: ${err.message}`);
    return;
  }

  if (!response.ok) {
    const text = await response.text();
    core.setFailed(`perceptdot API error ${response.status}: ${text}`);
    return;
  }

  const result = await response.json();

  core.info(`Analysis complete. has_issues=${result.has_issues}`);
  core.info(`Summary: ${result.summary}`);

  // 2. 출력 설정
  core.setOutput('result', JSON.stringify(result));
  core.setOutput('has_issues', result.has_issues ? 'true' : 'false');
  core.setOutput('summary', result.summary ?? '');

  // 3. PR 코멘트 (PR context일 때만)
  const token = process.env.GITHUB_TOKEN;
  if (token && github.context.payload.pull_request) {
    try {
      const octokit = github.getOctokit(token);
      const icon = result.has_issues ? '🔴' : '✅';
      const issueLines = (result.issues ?? [])
        .map((i) => `- **[${i.severity}]** ${i.description}`)
        .join('\n');
      const body = [
        `## ${icon} perceptdot Visual Check`,
        '',
        `**URL:** ${url}`,
        '',
        result.summary,
        '',
        issueLines ? `### Issues Found\n${issueLines}` : '',
        '',
        `> Checked in ${result.duration_ms ?? result.timing?.total_ms ?? 0}ms · Cost: $${result.cost_usd ?? result.cost?.estimated_usd ?? 0}`,
        '',
        `*Powered by [perceptdot](https://perceptdot.com)*`,
      ]
        .filter((l) => l !== null)
        .join('\n');

      await octokit.rest.issues.createComment({
        ...github.context.repo,
        issue_number: github.context.payload.pull_request.number,
        body,
      });
      core.info('PR comment posted.');
    } catch (err) {
      core.warning(`Failed to post PR comment: ${err.message}`);
    }
  }

  // 4. 이슈 발견 시 실패 처리
  if (failOnIssue && result.has_issues) {
    core.setFailed(`Visual issues detected: ${result.summary}`);
  }
}

run().catch(core.setFailed);
