import re
import subprocess
import yaml
from datetime import datetime

# 该脚本请复制至项目根目录执行
def run_git_command(cmd):
    result = subprocess.run(
        cmd,
        shell=True,
        capture_output=True,
        text=True,
        encoding='utf-8',
        errors='ignore'
    )
    return result.stdout.strip()

def get_version_commits():
    cmd = 'git log --all --reverse --format="%h|%ai|%s" -- backend/src/main/resources/system_version.txt'
    output = run_git_command(cmd)

    commits = []
    for line in output.split('\n'):
        if line.strip():
            parts = line.split('|', 2)
            if len(parts) == 3:
                commits.append({
                    'hash': parts[0],
                    'date': parts[1].split(' ')[0],
                    'message': parts[2].strip()
                })
    commits.reverse()
    return commits

def get_version_number_at_commit(commit_hash):
    cmd = f'git show {commit_hash}:backend/src/main/resources/system_version.txt'
    version = run_git_command(cmd)
    return version.strip() if version else ''

def get_commits_between(old_commit, new_commit):
    if old_commit:
        cmd = f'git log --format="%h|%ai|%s" {old_commit}..{new_commit}'
    else:
        cmd = f'git log --format="%h|%ai|%s" {new_commit}'

    output = run_git_command(cmd)
    commits = []

    for line in output.split('\n'):
        if line.strip():
            parts = line.split('|', 2)
            if len(parts) == 3:
                msg = parts[2].strip()
                if 'chore(version)' not in msg and 'chore(system)' not in msg:
                    commits.append({
                        'hash': parts[0],
                        'date': parts[1].split(' ')[0],
                        'message': msg
                    })

    return commits

def categorize_commit(message):
    msg_lower = message.lower()

    if any(kw in msg_lower for kw in ['cve', '漏洞', '越权', 'xss', 'csrf', 'security']):
        return '安全修复'
    elif any(kw in msg_lower for kw in ['feat', '添加', '新增', '实现', '支持', '加入']):
        return '新功能'
    elif any(kw in msg_lower for kw in ['fix', '修复', '解决']):
        return '问题修复'
    elif any(kw in msg_lower for kw in ['优化', '改进', '调整', '提升']):
        return '体验优化'
    elif any(kw in msg_lower for kw in ['style', '样式', 'ui']):
        return '样式调整'
    elif any(kw in msg_lower for kw in ['refactor', '重构']):
        return '代码重构'
    elif any(kw in msg_lower for kw in ['docs', '文档', 'readme']):
        return '文档更新'
    elif any(kw in msg_lower for kw in ['chore', '清理', '移除', '升级依赖']):
        return '日常维护'
    else:
        return '其他'

def extract_feature(message):
    message = re.sub(r'^(feat|fix|chore|docs|style|refactor|build|revert|perf)\s*[\(\[：:][^\)\]]*[\)\)]\s*[:：]?\s*', '', message)
    message = re.sub(r'^(feat|fix|chore|docs|style|refactor|build|revert|perf)[:：]\s*', '', message)
    return message.strip()

def generate_yaml_changelog():
    print("正在获取版本提交记录...")
    version_commits = get_version_commits()

    if not version_commits:
        print("未找到版本提交记录")
        return

    print(f"找到 {len(version_commits)} 个版本")

    versions_data = []

    for i, commit in enumerate(version_commits):
        version_hash = commit['hash']
        version_date = commit['date']

        print(f"正在处理版本 {version_hash} ({version_date})...")

        system_version = get_version_number_at_commit(version_hash)

        prev_commit = version_commits[i + 1] if i + 1 < len(version_commits) else None

        commits = get_commits_between(prev_commit['hash'] if prev_commit else None, version_hash)

        if not commits:
            continue

        changes = {}
        for c in commits:
            category = categorize_commit(c['message'])
            if category not in changes:
                changes[category] = []
            feature = extract_feature(c['message'])
            if feature:
                changes[category].append(feature)

        version_entry = {
            'version': system_version,
            'version_hash': version_hash,
            'date': version_date,
        }

        if changes:
            version_entry['changes'] = changes

        versions_data.append(version_entry)

    data = {
        'metadata': {
            'project_name': '次元栈 · Dim Stack',
            'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'total_versions': len(versions_data)
        },
        'versions': versions_data
    }

    output_file = 'update_log.yaml'
    with open(output_file, 'w', encoding='utf-8') as f:
        yaml.dump(
            data,
            f,
            allow_unicode=True,
            default_flow_style=False,
            sort_keys=False,
            width=120
        )

    print(f"\nYAML 文件已生成: {output_file}")
    print(f"共 {len(versions_data)} 个版本")


if __name__ == '__main__':
    generate_yaml_changelog()
