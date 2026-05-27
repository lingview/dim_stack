import { useState, useEffect } from 'react';
import apiClient from '../../utils/axios.jsx';
import {showToast} from "../../utils/toastManager.jsx";

export default function UpdateManager({ initialCheckResult = null } = {}) {
  const [currentVersion, setCurrentVersion] = useState(initialCheckResult?.currentVersion || '');
  const [newVersion, setNewVersion] = useState(initialCheckResult?.newVersion || '');
  const [hasUpdate, setHasUpdate] = useState(initialCheckResult?.hasUpdate || false);
  const [updateInfo, setUpdateInfo] = useState(initialCheckResult?.updateInfo || null);
  const [isCompatible, setIsCompatible] = useState(initialCheckResult?.isCompatible ?? true);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [changelogData, setChangelogData] = useState(null);
  const [changelogLoading, setChangelogLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (initialCheckResult && !newVersion) {
      setCurrentVersion(initialCheckResult.currentVersion || '');
      setNewVersion(initialCheckResult.newVersion || '');
      setHasUpdate(initialCheckResult.hasUpdate || false);
      setUpdateInfo(initialCheckResult.updateInfo || null);
      setIsCompatible(initialCheckResult.isCompatible ?? true);
    }
  }, [initialCheckResult]);

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
      apiClient.get('/update/updatelog')
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
              showToast(`发现新版本 v${newVer}`, 'info');
            } else {
              showToast(`发现新版本 v${newVer}，但当前版本不兼容`, 'warning');
            }
          } else {
            showToast('当前已是最新版本', 'info');
          }
        } else {
          showToast(response.data.message || '检查更新失败', 'error');
        }
      } else {
        showToast('服务器响应异常', 'error');
      }
    } catch (err) {
      showToast('网络错误或服务器不可达', 'error');
      console.error('检查更新错误:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleDownloadUpdate = async () => {
    setDownloading(true);

    try {
      const response = await apiClient.post('/update/download');

      if (response.code === 200 && response.data) {
        const { success, message: msg } = response.data;

        if (success) {
          showToast(msg || '更新包已下载', 'info');
          setDownloaded(true);
        } else {
          showToast(response.data.message || '下载失败', 'error');
          setDownloaded(false);
        }
      } else {
        showToast('下载失败', 'error');
        setDownloaded(false);
      }
    } catch (err) {
      showToast('下载过程中出现错误', 'error');
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

    try {
      const response = await apiClient.post('/update/perform', {
        expectedChecksum: updateInfo?.checksum,
        restartAfterUpdate: restartAfterUpdate
      });

      if (response.code === 200 && response.data) {
        const { success, message: msg } = response.data;

        if (success) {
          setHasUpdate(false);
          setDownloaded(false);

          if (restartAfterUpdate) {
            showToast(msg || '更新完成', 'info');
            setTimeout(() => {
              showToast('应用正在重启，请稍候...页面将在 5 秒后刷新', 'info', 5000);
              setTimeout(() => {
                window.location.reload();
              }, 5000);
            }, 1000);
          } else {
            showToast('更新完成，但未重启应用。您可以在合适的时间手动重启服务。', 'info', 5000);
          }
        } else {
          showToast(response.data.message || '更新失败', 'error');
        }
      } else {
        showToast('更新失败', 'error');
      }
    } catch (err) {
      showToast('执行更新时出现错误', 'error');
      console.error('执行更新错误:', err);
    } finally {
      setUpdating(false);
    }
  };


  const resetDownloadState = () => {
    setDownloaded(false);
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
    const base = 'update-badge inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium';
    if (checking) {
      return (
          <span className={`${base} update-badge-default bg-gray-100 text-gray-500`}>
          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          检查中
        </span>
      );
    }
    if (!newVersion) {
      return <span className={`${base} update-badge-default bg-gray-100 text-gray-500`}>尚未检查</span>;
    }
    if (!hasUpdate) {
      return (
          <span className={`${base} update-badge-success bg-green-50 text-green-700 border border-green-100`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          已是最新
        </span>
      );
    }
    if (!isCompatible) {
      return (
          <span className={`${base} update-badge-warn bg-orange-50 text-orange-700 border border-orange-100`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 19h14.14a2 2 0 001.74-3l-7.07-12a2 2 0 00-3.48 0l-7.07 12a2 2 0 001.74 3z" />
          </svg>
          不兼容
        </span>
      );
    }
    return (
        <span className={`${base} update-badge-info bg-blue-50 text-blue-700 border border-blue-100`}>
        <span className="relative flex w-2 h-2">
          <span className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping"></span>
          <span className="relative inline-flex w-2 h-2 rounded-full bg-blue-500"></span>
        </span>
        可更新
      </span>
    );
  };

  return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="update-header flex justify-between items-start mb-6 pb-5 border-b border-gray-100 gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 leading-tight">系统更新</h2>
              <p className="text-sm text-gray-500 mt-1">Windows 系统请手动替换 jar 包进行更新</p>
            </div>
          </div>
          <button
              onClick={handleCheckForUpdates}
              disabled={checking}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow flex-shrink-0"
          >
            {checking ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  检查中...
                </>
            ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  检查更新
                </>
            )}
          </button>
        </div>

        <div className="update-status-bar flex divide-x divide-gray-200 border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div className="update-status-cell flex-1 px-5 py-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              <span className="update-status-label text-[11px] uppercase tracking-wider text-gray-500">当前版本</span>
            </div>
            <div className="flex items-baseline gap-2">
            <span className="update-status-value text-lg font-mono font-semibold text-gray-900">
              {currentVersion ? `v${currentVersion}` : '未知'}
            </span>
            </div>
          </div>
          <div className="update-status-cell flex-1 px-5 py-4">
            <div className="flex items-center justify-between mb-2 gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span className="update-status-label text-[11px] uppercase tracking-wider text-gray-500">最新版本</span>
              </div>
              {renderStatusBadge()}
            </div>
            <div className="flex items-baseline gap-2">
            <span className="update-status-value-highlight text-lg font-mono font-semibold text-blue-700">
              {newVersion ? `v${newVersion}` : '—'}
            </span>
            </div>
          </div>
        </div>

        {hasUpdate && updateInfo && (
            <div className="update-available-card mb-6 rounded-lg border border-blue-200 bg-blue-50/40 overflow-hidden">
              <div className="update-available-card-header px-5 py-4 flex flex-wrap items-start justify-between gap-3 border-b border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="update-available-icon mt-0.5 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 ring-4 ring-blue-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div>
                    <div className="update-available-title text-sm font-semibold text-gray-900">
                      新版本 v{updateInfo.version} 可用
                    </div>
                    <div className="update-available-meta text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
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
                              className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                          >
                            {downloading ? (
                                <>
                                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                  </svg>
                                  下载中...
                                </>
                            ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  下载更新
                                </>
                            )}
                          </button>
                      ) : (
                          <>
                            <button
                                onClick={resetDownloadState}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              重新下载
                            </button>
                            <button
                                onClick={handlePerformUpdate}
                                disabled={updating}
                                className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                            >
                              {updating ? (
                                  <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                    更新中...
                                  </>
                              ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    执行更新
                                  </>
                              )}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      更新包已下载，可执行更新
                    </div>
                )}

                {updateInfo.changelog && (
                    <div>
                      <div className="update-available-section-label text-[11px] uppercase tracking-wider text-gray-500 mb-2">更新内容</div>
                      <p className="update-available-changelog whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                        {updateInfo.changelog}
                      </p>
                    </div>
                )}

                {(updateInfo.requiredDatabaseMigration || updateInfo.backupRecommended) && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {updateInfo.requiredDatabaseMigration && (
                          <span className="update-warn-tag-danger inline-flex items-center text-xs text-red-700 bg-red-50 border border-red-100 rounded-full px-2.5 py-1">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 19h14.14a2 2 0 001.74-3l-7.07-12a2 2 0 00-3.48 0l-7.07 12a2 2 0 001.74 3z" />
                    </svg>
                    包含数据库迁移
                  </span>
                      )}
                      {updateInfo.backupRecommended && (
                          <span className="update-warn-tag-warn inline-flex items-center text-xs text-yellow-800 bg-yellow-50 border border-yellow-100 rounded-full px-2.5 py-1">
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
                  <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                {changelogData.versions.length} 个版本
              </span>
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
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-500"></div>
                      <span className="ml-3 text-sm text-gray-600">加载中...</span>
                    </div>
                ) : changelogData && changelogData.versions.length > 0 ? (
                    <div className="flex flex-col md:flex-row" style={{ height: '560px' }}>
                      <div className="md:hidden flex-shrink-0 border-b border-gray-200 bg-gray-50/50">
                        <button
                            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700 truncate">
                        {mobileSidebarOpen
                            ? '选择版本'
                            : (selectedVersion ? `当前查看 v${selectedVersion.version}` : '选择版本')}
                      </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                        {changelogData.versions.length} 个版本
                      </span>
                            <svg
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${mobileSidebarOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                      </div>

                      <div className={`update-changelog-sidebar overflow-y-auto hide-scrollbar bg-gray-50/50 md:w-56 md:flex-none md:border-r border-gray-200 md:block ${mobileSidebarOpen ? 'flex-1' : 'hidden'}`}>
                        {changelogData.versions.map((v, idx) => {
                          const active = selectedVersion?.version_hash === v.version_hash;
                          const isCurrent = currentVersion && v.version === currentVersion;
                          return (
                              <button
                                  key={idx}
                                  onClick={() => {
                                    setSelectedVersion(v);
                                    setMobileSidebarOpen(false);
                                  }}
                                  className={`update-changelog-version-item ${active ? 'is-active' : ''} w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
                                      active
                                          ? 'bg-white border-l-2 border-l-blue-600'
                                          : 'hover:bg-white border-l-2 border-l-transparent'
                                  }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className={`update-changelog-version-name text-sm font-medium ${active ? 'text-blue-700' : 'text-gray-900'}`}>v{v.version}</div>
                                  {isCurrent && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 font-medium leading-none">当前</span>
                                  )}
                                </div>
                                <div className="update-changelog-version-date text-xs text-gray-500 mt-1">{v.date}</div>
                              </button>
                          );
                        })}
                      </div>

                      <div className={`update-changelog-detail overflow-y-auto hide-scrollbar bg-white p-6 md:flex-1 md:block ${mobileSidebarOpen ? 'hidden' : 'flex-1'}`}>
                        {selectedVersion ? (
                            <div>
                              <div className="update-changelog-detail-header mb-5 pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-semibold text-gray-900">版本 v{selectedVersion.version}</h3>
                                  {currentVersion && selectedVersion.version === currentVersion && (
                                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 font-medium">当前版本</span>
                                  )}
                                </div>
                                <div className="update-changelog-detail-meta flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {selectedVersion.date}
                          </span>
                                  <span className="font-mono inline-flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            #{selectedVersion.version_hash}
                          </span>
                                </div>
                              </div>

                              {Object.entries(selectedVersion.changes).map(([category, items]) => (
                                  <div key={category} className="mb-5">
                                    <h4 className="update-changelog-category-title text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                      <span className={`w-2 h-2 rounded-full mr-2 ${categoryColor(category)}`}></span>
                                      {category}
                                      <span className="ml-2 text-[11px] text-gray-500 bg-gray-100 rounded-full px-1.5 py-0.5 font-normal leading-none">{items.length}</span>
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
                            <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400">
                              <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              请选择一个版本查看详情
                            </div>
                        )}
                      </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-sm text-gray-500">
                      <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      暂无更新日志数据
                    </div>
                )}
              </div>
          )}
        </div>

        <div className="update-notice pt-5 border-t border-gray-100">
          <h3 className="update-notice-title text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">注意事项</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
            {[
              '更新前请务必备份重要数据',
              '更新过程中请勿关闭应用',
              '更新完成后需要重启应用才能生效',
              '如遇到问题，请联系技术支持',
            ].map((text) => (
                <li key={text} className="update-notice-item flex items-start">
                  <span className="update-notice-dot w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 mr-2.5 flex-shrink-0"></span>
                  <span className="leading-relaxed">{text}</span>
                </li>
            ))}
          </ul>
        </div>
      </div>
  );
}
