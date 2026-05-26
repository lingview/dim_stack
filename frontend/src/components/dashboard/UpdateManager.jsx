import { useState, useEffect } from 'react';
import apiClient from '../../utils/axios.jsx';
import {showToast} from "../../utils/toastManager.jsx";

export default function UpdateManager() {
  const [currentVersion, setCurrentVersion] = useState('');
  const [newVersion, setNewVersion] = useState('');
  const [hasUpdate, setHasUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isCompatible, setIsCompatible] = useState(true);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showChangelog, setShowChangelog] = useState(false);
  const [changelogData, setChangelogData] = useState(null);
  const [changelogLoading, setChangelogLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  const parseYAML = (text) => {
    const result = { metadata: {}, versions: [] };
    const lines = text.replace(/\r/g, '').split('\n');
    let currentSection = null;
    let currentVersion = null;
    let currentCategory = null;
    let inChanges = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!line.trim() || line.trim().startsWith('#')) continue;

      if (line.startsWith('metadata:')) {
        currentSection = 'metadata';
        continue;
      }

      if (line.startsWith('versions:')) {
        currentSection = 'versions';
        continue;
      }

      if (currentSection === 'metadata') {
        const match = line.match(/^\s+(\w+):\s*(.+)$/);
        if (match) {
          result.metadata[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
        }
      }

      if (currentSection === 'versions') {
        if (line.match(/^-\s+version:/)) {
          const versionMatch = line.match(/version:\s*['"]?([^'"\s]+)['"]?/);
          const hashLine = (i + 1 < lines.length) ? lines[i + 1] : '';
          const dateLine = (i + 2 < lines.length) ? lines[i + 2] : '';
          const hashMatch = hashLine.match(/version_hash:\s*['"]?([^'"\s]+)['"]?/);
          const dateMatch = dateLine.match(/date:\s*['"]?([^'"\s]+)['"]?/);
          
          currentVersion = {
            version: versionMatch ? versionMatch[1] : '',
            version_hash: hashMatch ? hashMatch[1] : '',
            date: dateMatch ? dateMatch[1] : '',
            changes: {}
          };
          result.versions.push(currentVersion);
          currentCategory = null;
          inChanges = false;
          continue;
        }

        if (line.match(/^\s+changes:\s*$/)) {
          inChanges = true;
          continue;
        }

        if (inChanges && line.match(/^\s{4}[\w\u4e00-\u9fa5]+:\s*$/)) {
          const catMatch = line.match(/^\s{4}([\w\u4e00-\u9fa5]+):\s*$/);
          if (catMatch) {
            currentCategory = catMatch[1];
            currentVersion.changes[currentCategory] = [];
          }
          continue;
        }

        if (inChanges && currentCategory && line.match(/^\s{4}-\s/)) {
          const itemMatch = line.match(/^\s{4}-\s+(.+)$/);
          if (itemMatch) {
            const item = itemMatch[1].replace(/^['"]|['"]$/g, '');
            currentVersion.changes[currentCategory].push(item);
          }
        }
      }
    }

    return result;
  };

  useEffect(() => {
    if (showChangelog && !changelogData) {
      setChangelogLoading(true);
      apiClient.get('/update/changelog')
        .then(data => {
          const responseData = data?.data || data;
          if (responseData?.success && responseData.content) {
            const parsed = parseYAML(responseData.content);
            setChangelogData(parsed);
            if (parsed.versions.length > 0) {
              setSelectedVersion(parsed.versions[0]);
            }
          } else {
            showToast('获取更新日志失败');
          }
        })
        .catch(() => {
          showToast('获取更新日志失败');
        })
        .finally(() => {
          setChangelogLoading(false);
        });
    }
  }, [showChangelog]);

  useEffect(() => {
    if (changelogData && !selectedVersion && changelogData.versions.length > 0) {
      setSelectedVersion(changelogData.versions[0]);
    }
  }, [changelogData]);

  const handleCheckForUpdates = async () => {
    setChecking(true);
    setError('');
    setMessage('');

    try {
      const response = await apiClient.get('/update/check');

      if (response.code === 200 && response.data) {
        const {
          success,
          hasUpdate: hasNewUpdate,
          isCompatible: compatible,
          currentVersion: curVer,
          newVersion: newVer,
          updateInfo: info
        } = response.data;

        if (success) {
          setCurrentVersion(curVer);
          setNewVersion(newVer);
          setHasUpdate(hasNewUpdate);
          setIsCompatible(compatible);
          setUpdateInfo(info);
          setDownloaded(false);

          if (hasNewUpdate) {
            if (compatible) {
              setMessage(`发现新版本v${newVer}`);
            } else {
              setMessage(`发现新版本v${newVer}，但当前版本不兼容`);
            }
          } else {
            setMessage('当前已是最新版本');
          }
        } else {
          setError(response.data.message || '检查更新失败');
        }
      } else {
        setError('服务器响应异常');
      }
    } catch (err) {
      setError('网络错误或服务器不可达');
      console.error('检查更新错误:', err);
    } finally {
      setChecking(false);
    }
  };

  // 下载更新包
  const handleDownloadUpdate = async () => {
    setDownloading(true);
    setError('');

    try {
      const response = await apiClient.post('/update/download');

      if (response.code === 200 && response.data) {
        const { success, message: msg} = response.data;

        if (success) {
          setMessage(msg);
          setDownloaded(true);
        } else {
          setError(response.data.message || '下载失败');
          setDownloaded(false);
        }
      } else {
        setError('下载失败');
        setDownloaded(false);
      }
    } catch (err) {
      setError('下载过程中出现错误');
      setDownloaded(false);
      console.error('下载更新错误:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePerformUpdate = async () => {
    if (window.confirm(
        '确认执行更新吗？\n\n' +
        '注意：选择"确定"将自动重启应用\n' +
        '如果不想现在重启，可以选择"取消"将会只执行jar包替换'
    )) {
      await executeUpdate(true);
    } else {
      await executeUpdate(false);
    }
  };

  const executeUpdate = async (restartAfterUpdate) => {
    setUpdating(true);
    setError('');

    try {
      const response = await apiClient.post('/update/perform', {
        expectedChecksum: updateInfo?.checksum,
        restartAfterUpdate: restartAfterUpdate
      });

      if (response.code === 200 && response.data) {
        const { success, message: msg } = response.data;

        if (success) {
          setMessage(msg);
          setHasUpdate(false);
          setDownloaded(false);

          if (restartAfterUpdate) {
            setTimeout(() => {
              showToast('应用正在重启，请稍候...页面将在5秒后刷新');
              setTimeout(() => {
                window.location.reload();
              }, 5000);
            }, 1000);
          } else {
            setMessage('更新完成，但未重启应用。您可以在合适的时间手动重启服务。');
          }
        } else {
          setError(response.data.message || '更新失败');
        }
      } else {
        setError('更新失败');
      }
    } catch (err) {
      setError('执行更新时出现错误');
      console.error('执行更新错误:', err);
    } finally {
      setUpdating(false);
    }
  };


  const resetDownloadState = () => {
    setDownloaded(false);
    setMessage('');
  };

  const categoryColor = (category) => {
    switch (category) {
      case '新功能': return 'bg-green-500';
      case '问题修复': return 'bg-red-500';
      case '安全修复': return 'bg-orange-500';
      case '体验优化': return 'bg-blue-500';
      case '样式调整': return 'bg-pink-500';
      case '代码重构': return 'bg-indigo-500';
      case '文档更新': return 'bg-yellow-500';
      case '日常维护': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const renderStatusBadge = () => {
    const base = 'update-badge text-xs px-2 py-0.5 rounded-full';
    if (checking) {
      return <span className={`${base} update-badge-default bg-gray-100 text-gray-500`}>检查中...</span>;
    }
    if (!newVersion) {
      return <span className={`${base} update-badge-default bg-gray-100 text-gray-500`}>尚未检查</span>;
    }
    if (!hasUpdate) {
      return <span className={`${base} update-badge-success bg-green-50 text-green-700 border border-green-100`}>已是最新</span>;
    }
    if (!isCompatible) {
      return <span className={`${base} update-badge-warn bg-orange-50 text-orange-700 border border-orange-100`}>不兼容</span>;
    }
    return <span className={`${base} update-badge-info bg-blue-50 text-blue-700 border border-blue-100`}>可更新</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="update-header flex justify-between items-start mb-6 pb-5 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">系统更新</h2>
          <p className="text-sm text-gray-500 mt-1">Windows 系统请手动替换 jar 包进行更新</p>
        </div>
        <button
          onClick={handleCheckForUpdates}
          disabled={checking}
          className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {checking ? '检查中...' : '检查更新'}
        </button>
      </div>

      {error && (
        <div className="update-alert mb-4 p-3 rounded-md bg-red-50 text-red-800 border border-red-100 text-sm">
          {error}
        </div>
      )}
      {message && !hasUpdate && (
        <div className="update-message mb-4 p-3 rounded-md bg-green-50 text-green-800 border border-green-100 text-sm">
          {message}
        </div>
      )}

      <div className="update-status-bar flex divide-x divide-gray-200 border border-gray-200 rounded-lg overflow-hidden mb-6">
        <div className="update-status-cell flex-1 px-5 py-4">
          <div className="update-status-label text-xs text-gray-500 mb-1.5">当前版本</div>
          <div className="flex items-baseline gap-2">
            <span className="update-status-value text-base font-mono font-medium text-gray-900">
              {currentVersion ? `v${currentVersion}` : '未知'}
            </span>
          </div>
        </div>
        <div className="update-status-cell flex-1 px-5 py-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="update-status-label text-xs text-gray-500">最新版本</span>
            {renderStatusBadge()}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-base font-mono font-medium ${hasUpdate ? 'update-status-value-highlight text-blue-700' : 'update-status-value text-gray-900'}`}>
              {newVersion ? `v${newVersion}` : '—'}
            </span>
          </div>
        </div>
      </div>

      {hasUpdate && updateInfo && (
        <div className="update-available-card mb-6 rounded-lg border border-blue-200 bg-blue-50/40 overflow-hidden">
          <div className="update-available-card-header px-5 py-4 flex flex-wrap items-start justify-between gap-3 border-b border-blue-100">
            <div className="flex items-start gap-3">
              <div className="update-available-icon mt-0.5 w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <div className="update-available-title text-sm font-semibold text-gray-900">
                  新版本 v{updateInfo.version} 可用
                </div>
                <div className="update-available-meta text-xs text-gray-500 mt-0.5">
                  发布日期 {updateInfo.releaseDate}
                </div>
              </div>
            </div>

            {isCompatible && (
              <div className="flex flex-wrap items-center gap-2">
                {!downloaded ? (
                  <button
                    onClick={handleDownloadUpdate}
                    disabled={downloading}
                    className="px-4 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {downloading ? '下载中...' : '下载更新'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={resetDownloadState}
                      className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      重新下载
                    </button>
                    <button
                      onClick={handlePerformUpdate}
                      disabled={updating}
                      className="px-4 py-1.5 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {updating ? '更新中...' : '执行更新'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="px-5 py-4 space-y-3">
            {!isCompatible && (
              <div className="update-incompat-banner flex items-start text-sm text-orange-800 bg-orange-50 border border-orange-100 rounded-md px-3 py-2">
                <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 19h14.14a2 2 0 001.74-3l-7.07-12a2 2 0 00-3.48 0l-7.07 12a2 2 0 001.74 3z" />
                </svg>
                当前版本与新版本不兼容，请联系技术支持
              </div>
            )}

            {downloaded && (
              <div className="update-success-text flex items-center text-sm text-green-700">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                更新包已下载，可执行更新
              </div>
            )}

            {updateInfo.changelog && (
              <div>
                <div className="update-available-section-label text-xs text-gray-500 mb-1.5">更新内容</div>
                <p className="update-available-changelog whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                  {updateInfo.changelog}
                </p>
              </div>
            )}

            {(updateInfo.requiredDatabaseMigration || updateInfo.backupRecommended) && (
              <div className="flex flex-wrap gap-2 pt-1">
                {updateInfo.requiredDatabaseMigration && (
                  <span className="update-warn-tag-danger inline-flex items-center text-xs text-red-700 bg-red-50 border border-red-100 rounded px-2 py-1">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 19h14.14a2 2 0 001.74-3l-7.07-12a2 2 0 00-3.48 0l-7.07 12a2 2 0 001.74 3z" />
                    </svg>
                    包含数据库迁移
                  </span>
                )}
                {updateInfo.backupRecommended && (
                  <span className="update-warn-tag-warn inline-flex items-center text-xs text-yellow-800 bg-yellow-50 border border-yellow-100 rounded px-2 py-1">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    建议更新前备份
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 完整更新日志 */}
      <div className="mb-6">
        <button
          onClick={() => setShowChangelog(!showChangelog)}
          className="update-changelog-toggle w-full flex justify-between items-center px-4 py-2.5 hover:bg-gray-50 rounded-md border border-gray-200 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showChangelog ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm font-medium text-gray-700">完整更新日志</span>
            {changelogData && (
              <span className="text-xs text-gray-400">共 {changelogData.versions.length} 个版本</span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {showChangelog ? '收起' : '展开'}
          </span>
        </button>

        {showChangelog && (
          <div className="update-changelog-panel mt-3 rounded-lg border border-gray-200 overflow-hidden">
            {changelogLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-sm text-gray-600">加载中...</span>
              </div>
            ) : changelogData && changelogData.versions.length > 0 ? (
              <div className="flex" style={{ height: '560px' }}>
                <div className="update-changelog-sidebar w-56 border-r border-gray-200 overflow-y-auto hide-scrollbar bg-gray-50/50">
                  {changelogData.versions.map((v, idx) => {
                    const active = selectedVersion?.version_hash === v.version_hash;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedVersion(v)}
                        className={`update-changelog-version-item ${active ? 'is-active' : ''} w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
                          active
                            ? 'bg-white border-l-2 border-l-blue-600'
                            : 'hover:bg-white border-l-2 border-l-transparent'
                        }`}
                      >
                        <div className={`update-changelog-version-name text-sm font-medium ${active ? 'text-blue-700' : 'text-gray-900'}`}>v{v.version}</div>
                        <div className="update-changelog-version-date text-xs text-gray-500 mt-1">{v.date}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="update-changelog-detail flex-1 overflow-y-auto hide-scrollbar bg-white p-6">
                  {selectedVersion ? (
                    <div>
                      <div className="update-changelog-detail-header mb-5 pb-4 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">版本 v{selectedVersion.version}</h3>
                        <div className="update-changelog-detail-meta flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                          <span>发布日期：{selectedVersion.date}</span>
                          <span className="font-mono">#{selectedVersion.version_hash}</span>
                        </div>
                      </div>

                      {Object.entries(selectedVersion.changes).map(([category, items]) => (
                        <div key={category} className="mb-5">
                          <h4 className="update-changelog-category-title text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${categoryColor(category)}`}></span>
                            {category}
                            <span className="ml-2 text-xs text-gray-400 font-normal">{items.length}</span>
                          </h4>
                          <ul className="space-y-1">
                            {items.map((item, i) => (
                              <li key={i} className="update-changelog-item flex items-start text-sm text-gray-700 pl-4 py-1">
                                <span className="update-changelog-item-dot w-1 h-1 rounded-full bg-gray-400 mt-2 mr-3 flex-shrink-0"></span>
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-gray-400">
                      请选择一个版本查看详情
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20 text-sm text-gray-500">
                暂无更新日志数据
              </div>
            )}
          </div>
        )}
      </div>

      <div className="update-notice pt-5 border-t border-gray-100">
        <h3 className="update-notice-title text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">注意事项</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-gray-600">
          <li className="update-notice-item flex items-start">
            <span className="update-notice-dot w-1 h-1 rounded-full bg-gray-400 mt-2 mr-2.5 flex-shrink-0"></span>
            更新前请务必备份重要数据
          </li>
          <li className="update-notice-item flex items-start">
            <span className="update-notice-dot w-1 h-1 rounded-full bg-gray-400 mt-2 mr-2.5 flex-shrink-0"></span>
            更新过程中请勿关闭应用
          </li>
          <li className="update-notice-item flex items-start">
            <span className="update-notice-dot w-1 h-1 rounded-full bg-gray-400 mt-2 mr-2.5 flex-shrink-0"></span>
            更新完成后需要重启应用才能生效
          </li>
          <li className="update-notice-item flex items-start">
            <span className="update-notice-dot w-1 h-1 rounded-full bg-gray-400 mt-2 mr-2.5 flex-shrink-0"></span>
            如遇到问题，请联系技术支持
          </li>
        </ul>
      </div>
    </div>
  );
}
