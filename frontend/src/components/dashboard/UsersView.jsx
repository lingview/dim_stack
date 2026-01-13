import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios.jsx';
import {getConfig} from "../../utils/config.jsx";

const getFullImageUrl = (url) => {
  if (!url) return null;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  try {
    const config = getConfig();
    return config.getFullUrl(url);
  } catch (error) {
    if (url.startsWith('/')) {
      return url;
    }

    return `/upload/${url}`;
  }
};

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRoleId, setNewRoleId] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/user/list');
      setUsers(response || []);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      setError('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiClient.get('/user/roles');
      setRoles(response || []);
    } catch (error) {
      console.error('获取角色列表失败:', error);
    }
  };

  const handleUpdateRole = async (userId, roleId) => {
    try {
      await apiClient.post('/user/updateRole', null, {
        params: { userId, roleId }
      });
      fetchUsers();
      setShowRoleModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('更新用户角色失败:', error);
      setError('更新用户角色失败');
    }
  };

  const handleUpdateStatus = async (userId, status) => {
    try {
      await apiClient.post('/user/updateStatus', null, {
        params: { userId, status }
      });
      fetchUsers();
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error) {
      console.error('更新用户状态失败:', error);
      setError('更新用户状态失败');
    }
  };

  const openRoleModal = (user) => {
    setEditingUser(user);
    setNewRoleId(user.role_id);
    setShowRoleModal(true);
  };

  const openConfirmModal = (action, title, message) => {
    setConfirmAction({
      action,
      title,
      message
    });
    setShowConfirmModal(true);
  };

  const executeConfirmAction = () => {
    if (confirmAction && confirmAction.action) {
      confirmAction.action();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return '已删除';
      case 1: return '正常';
      case 2: return '已封禁';
      default: return '未知';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 0: return 'bg-red-100 text-red-800';
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">用户管理</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">用户管理</h2>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                角色
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                注册时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={getFullImageUrl(user.avatar)}
                        alt={user.username}
                        onError={(e) => {
                          e.target.src = '/image_error.svg';
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email || user.phone || '未提供联系方式'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.role_name || '未分配'}</div>
                  <div className="text-sm text-gray-500">{user.role_code || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.create_time ? new Date(user.create_time).toLocaleDateString() : '未知'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(user.status)}`}>
                    {getStatusText(user.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openRoleModal(user)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    更改角色
                  </button>
                  {user.status === 1 && (
                    <button
                      onClick={() => openConfirmModal(
                        () => handleUpdateStatus(user.id, 2),
                        "确认封禁",
                        `确定要封禁用户 "${user.username}" 吗？此操作将限制其账户访问权限。`
                      )}
                      className="text-yellow-600 hover:text-yellow-900 mr-4"
                    >
                      封禁
                    </button>
                  )}
                  {user.status === 2 && (
                    <button
                      onClick={() => handleUpdateStatus(user.id, 1)}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      解封
                    </button>
                  )}
                  {user.status !== 0 && (
                    <button
                      onClick={() => openConfirmModal(
                        () => handleUpdateStatus(user.id, 0),
                        "确认删除",
                        `确定要删除用户 "${user.username}" 吗？此操作将永久删除用户数据，无法恢复！`
                      )}
                      className="text-red-600 hover:text-red-900"
                    >
                      删除
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无用户</h3>
            <p className="mt-1 text-sm text-gray-500">还没有用户注册</p>
          </div>
        )}
      </div>

      {showRoleModal && editingUser && (
        <>
          <div
              className="fixed inset-0 backdrop-blur-sm bg-transparent z-40"
              onClick={() => setShowRoleModal(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">更改用户角色</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户: {editingUser.username}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  当前角色: {editingUser.role_name}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择新角色:
                </label>
                <select
                  value={newRoleId}
                  onChange={(e) => setNewRoleId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} ({role.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={() => handleUpdateRole(editingUser.id, newRoleId)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  确认更改
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showConfirmModal && confirmAction && (
        <>
          <div
            className="fixed inset-0 backdrop-blur-sm bg-transparent z-40"
            onClick={() => {
              setShowConfirmModal(false);
              setConfirmAction(null);
            }}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">{confirmAction.title}</h3>
              <p className="text-sm text-gray-600 mb-6">{confirmAction.message}</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmAction(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={executeConfirmAction}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
