import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axios.jsx';

export default function MenusView() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMenu, setEditingMenu] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    menus_name: '',
    menus_url: '',
    sort_order: 0
  });
  const [error, setError] = useState('');

  const escapeHtml = (unsafe) => {
    if (!unsafe) return unsafe;

    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const unescapeHtml = (safe) => {
    if (!safe) return safe;

    return safe
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/getmenus');

      if (Array.isArray(response)) {
        const escapedMenus = response.map(menu => ({
          ...menu,
          menus_name: escapeHtml(menu.menus_name) || '',
          menus_url: escapeHtml(menu.menus_url) || '',
          username: escapeHtml(menu.username) || ''
        }));
        setMenus(escapedMenus);
      } else {
        setMenus([]);
      }
    } catch (error) {
      console.error('获取菜单列表失败:', error);
      setError('获取菜单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenu = () => {
    setEditingMenu(null);
    setFormData({
      menus_name: '',
      menus_url: '',
      sort_order: menus.length
    });
    setShowForm(true);
  };

  const handleEditMenu = (menu) => {
    setEditingMenu(menu);
    setFormData({
      menus_name: unescapeHtml(menu.menus_name) || '',
      menus_url: unescapeHtml(menu.menus_url) || '',
      sort_order: menu.sort_order || 0
    });
    setShowForm(true);
  };

  const handleDeleteMenu = async (menuId) => {
    if (window.confirm('确定要删除这个菜单项吗？')) {
      try {
        await apiClient.post('/deletemenus', null, {
          params: { menus_id: menuId }
        });
        fetchMenus();
      } catch (error) {
        console.error('删除菜单失败:', error);
        setError('删除菜单失败');
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sort_order' ? parseInt(value) : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const escapedData = {
        menus_name: escapeHtml(formData.menus_name),
        menus_url: escapeHtml(formData.menus_url),
        sort_order: formData.sort_order
      };

      if (editingMenu) {
        await apiClient.post('/editmenus', {
          menus_id: editingMenu.menus_id,
          menus_name: escapedData.menus_name,
          menus_url: escapedData.menus_url,
          sort_order: escapedData.sort_order
        });
      } else {
        await apiClient.post('/addmenus', {
          menus_name: escapedData.menus_name,
          menus_url: escapedData.menus_url,
          sort_order: escapedData.sort_order
        });
      }
      setShowForm(false);
      fetchMenus();
    } catch (error) {
      console.error('保存菜单失败:', error);
      setError('保存菜单失败');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMenu(null);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));

    if (sourceIndex !== targetIndex) {
      const newMenus = [...menus];
      const movedItem = newMenus[sourceIndex];

      newMenus.splice(sourceIndex, 1);
      newMenus.splice(targetIndex, 0, movedItem);

      const updatedMenus = newMenus.map((menu, index) => ({
        ...menu,
        sort_order: index
      }));

      setMenus(updatedMenus);

      syncSortOrder(updatedMenus);
    }
  };

  const syncSortOrder = async (sortedMenus) => {
    try {
      await apiClient.post('/updatesortorder', sortedMenus);
    } catch (error) {
      console.error('更新排序失败:', error);
      setError('更新排序失败');
      fetchMenus();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">菜单管理</h2>
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
        <h2 className="text-xl font-semibold text-gray-900">菜单管理</h2>
        <button
          onClick={handleAddMenu}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          添加菜单
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {showForm ? (
        <div className="mb-6 p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingMenu ? '编辑菜单' : '添加菜单'}
          </h3>
          <form onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  菜单名称 *
                </label>
                <input
                  type="text"
                  name="menus_name"
                  value={formData.menus_name}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  菜单URL *
                </label>
                <input
                  type="text"
                  name="menus_url"
                  value={formData.menus_url}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  排序序号 *
                </label>
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                拖拽
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                排序
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                菜单ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                菜单名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                菜单URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建用户
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {menus.map((menu, index) => (
              <tr
                key={menu.menus_id}
                className="hover:bg-gray-50"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <svg
                    className="w-5 h-5 text-gray-400 cursor-move"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8h16M4 16h16"
                    />
                  </svg>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {menu.sort_order !== undefined ? menu.sort_order : index}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {menu.menus_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {unescapeHtml(menu.menus_name)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {unescapeHtml(menu.menus_url)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {unescapeHtml(menu.username) || menu.user_id || '未指定'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditMenu(menu)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteMenu(menu.menus_id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {menus.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无菜单</h3>
            <p className="mt-1 text-sm text-gray-500">开始添加菜单项</p>
          </div>
        )}
      </div>
    </div>
  );
}
