import { useState } from 'react';
import apiClient from '../../utils/axios.jsx';

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
              alert('应用正在重启，请稍候...页面将在5秒后刷新');
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">系统更新（Windows系统请手动替换jar包进行更新）</h2>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          错误: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">当前版本</h3>
          <p className="text-lg font-mono">{currentVersion || '未知'}</p>
        </div>
        <div className={`p-4 rounded-lg border ${hasUpdate ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className="font-semibold mb-2">最新版本</h3>
          <p className={`text-lg font-mono ${hasUpdate ? 'text-green-800' : 'text-gray-600'}`}>
            {newVersion || '尚未检查'}
          </p>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <button
          onClick={handleCheckForUpdates}
          disabled={checking}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checking ? '检查中...' : '检查更新'}
        </button>

        {hasUpdate && (
          <>
            {!isCompatible && (
              <p className="text-orange-600 font-medium">
                当前版本与新版本不兼容，请联系技术支持
              </p>
            )}
            {isCompatible && (
              <>
                {!downloaded ? (
                  <button
                    onClick={handleDownloadUpdate}
                    disabled={downloading}
                    className="ml-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloading ? '下载中...' : '下载更新'}
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 font-medium">✓ 更新包已下载</span>
                    <button
                      onClick={resetDownloadState}
                      className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                    >
                      重新下载
                    </button>
                  </div>
                )}

                {downloaded && (
                  <button
                    onClick={handlePerformUpdate}
                    disabled={updating}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? '更新中...' : '执行更新'}
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>

      {updateInfo && hasUpdate && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-2">更新详情</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">版本:</span> v{updateInfo.version}</p>
            <p><span className="font-medium">发布日期:</span> {updateInfo.releaseDate}</p>
            <p><span className="font-medium">更新日志:</span></p>
            <p className="whitespace-pre-line ml-2">{updateInfo.changelog}</p>
            {updateInfo.requiredDatabaseMigration && (
              <p className="text-orange-600 font-medium">注：此更新包含数据库迁移，请注意备份数据</p>
            )}
            {updateInfo.backupRecommended && (
              <p className="text-orange-600 font-medium">注：强烈建议在更新前备份数据</p>
            )}
          </div>
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg border border-green-200">
          {message}
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">注意事项</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-700">
          <li>更新前请务必备份重要数据</li>
          <li>更新过程中请勿关闭应用</li>
          <li>更新完成后需要重启应用才能生效</li>
          <li>如遇到问题，请联系技术支持</li>
        </ul>
      </div>
    </div>
  );
}
