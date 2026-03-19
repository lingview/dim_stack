import { useState, useEffect } from 'react'
import apiClient from "../../utils/axios.jsx";

const RoleManager = () => {
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [modalMode, setModalMode] = useState('create')
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        status: 1
    })
    const [message, setMessage] = useState({ type: '', text: '' })
    const [permissions, setPermissions] = useState([])
    const [rolePermissionIds, setRolePermissionIds] = useState([])
    const [showPermissionModal, setShowPermissionModal] = useState(false)
    const [editingRoleId, setEditingRoleId] = useState(null)

    const fetchRoles = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get('/role/list')
            if (response.code === 200) {
                setRoles(response.data || [])
            } else {
                showMessage('error', '获取角色列表失败：' + response.message)
            }
        } catch (error) {
            console.error('获取角色列表失败:', error)
            showMessage('error', '获取角色列表失败：' + (error.response?.data?.message || error.message))
        } finally {
            setLoading(false)
        }
    }

    const fetchPermissions = async () => {
        try {
            const response = await apiClient.get('/permission/list')
            if (response.code === 200) {
                return response.data || []
            }
            return []
        } catch (error) {
            console.error('获取权限列表失败:', error)
            showMessage('error', '获取权限列表失败')
            return []
        }
    }

    const fetchRolePermissions = async (roleId) => {
        try {
            const response = await apiClient.get(`/role/${roleId}/permissions`)
            if (response.code === 200) {
                return response.data || []
            }
            return []
        } catch (error) {
            console.error('获取角色权限失败:', error)
            return []
        }
    }

    const handleOpenPermissionEdit = async (role) => {
        setEditingRoleId(role.id)
        const allPerms = await fetchPermissions()
        const rolePermCodes = await fetchRolePermissions(role.id)
        const rolePermIds = allPerms
            .filter(perm => rolePermCodes.includes(perm.code))
            .map(perm => perm.id)
        setPermissions(allPerms)
        setRolePermissionIds(rolePermIds)
        setShowPermissionModal(true)
    }

    const handleClosePermissionModal = () => {
        setShowPermissionModal(false)
        setPermissions([])
        setRolePermissionIds([])
        setEditingRoleId(null)
    }

    const handlePermissionChange = (permissionId) => {
        setRolePermissionIds(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId)
            } else {
                return [...prev, permissionId]
            }
        })
    }

    const handleSavePermissions = async () => {
        try {
            const promises = permissions.map(perm => {
                const isSelected = rolePermissionIds.includes(perm.id);
                if (isSelected) {
                    return apiClient.post(`/role/${editingRoleId}/permission/add?permissionCode=${perm.code}`);
                } else {
                    return apiClient.delete(`/role/${editingRoleId}/permission/remove?permissionCode=${perm.code}`);
                }
            });
            
            await Promise.all(promises);
            
            showMessage('success', '权限分配成功');
            handleClosePermissionModal();
        } catch (error) {
            console.error('保存权限失败:', error);
            showMessage('error', '保存权限失败');
        }
    }

    const showMessage = (type, text) => {
        setMessage({ type, text })
        setTimeout(() => {
            setMessage({ type: '', text: '' })
        }, 3000)
    }

    const handleOpenCreate = () => {
        setModalMode('create')
        setFormData({ code: '', name: '', description: '', status: 1 })
        setShowModal(true)
    }

    const handleOpenEdit = (role) => {
        setModalMode('edit')
        setFormData({
            code: role.code || '',
            name: role.name || '',
            description: role.description || '',
            status: role.status !== undefined ? role.status : 1
        })
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (modalMode === 'create') {
                const response = await apiClient.post('/role/create', formData)
                if (response.code === 200) {
                    showMessage('success', '创建成功')
                    fetchRoles()
                    handleCloseModal()
                } else {
                    showMessage('error', '创建失败：' + response.message)
                }
            } else {
                const response = await apiClient.put('/role/update', formData)
                if (response.code === 200) {
                    showMessage('success', '更新成功')
                    fetchRoles()
                    handleCloseModal()
                } else {
                    showMessage('error', '更新失败：' + response.message)
                }
            }
        } catch (error) {
            console.error('操作失败:', error)
            showMessage('error', modalMode === 'create' ? '创建失败' : '更新失败')
        }
    }

    const handleDelete = async (roleId, roleName) => {
        if (!confirm(`确定要删除角色"${roleName}"吗？此操作不可恢复！`)) {
            return
        }
        try {
            const response = await apiClient.delete(`/role/delete/${roleId}`)
            if (response.code === 200) {
                showMessage('success', '删除成功')
                fetchRoles()
            } else {
                showMessage('error', '删除失败：' + response.message)
            }
        } catch (error) {
            console.error('删除失败:', error)
            showMessage('error', '删除失败：' + (error.response?.data?.message || error.message))
        }
    }

    useEffect(() => {
        fetchRoles()
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'status' ? parseInt(value) : value
        }))
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-900">角色管理</h1>
                <button
                    onClick={handleOpenCreate}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    + 创建角色
                </button>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-700'
                }`}>
                    {message.text}
                </div>
            )}

            <div className="overflow-x-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : roles.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">暂无角色</h3>
                        <p className="mt-1 text-sm text-gray-500">还没有创建任何角色</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">编码</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {roles.map((role) => (
                            <tr key={role.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{role.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{role.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.description || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        role.status === 1
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {role.status === 1 ? '正常' : '已封禁'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleOpenEdit(role)} className="text-blue-600 hover:text-blue-900 mr-4">编辑</button>
                                    <button onClick={() => handleOpenPermissionEdit(role)} className="text-green-600 hover:text-green-900 mr-4">权限</button>
                                    <button
                                        onClick={() => handleDelete(role.id, role.name)}
                                        className="text-red-600 hover:text-red-900"
                                        disabled={role.id === 1}
                                    >
                                        删除
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

                {roles.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">暂无角色</h3>
                        <p className="mt-1 text-sm text-gray-500">还没有创建任何角色</p>
                    </div>
                )}
            </div>

            {showModal && (
                <>
                    <div
                        className="fixed inset-0 backdrop-blur-sm bg-transparent z-40"
                        onClick={handleCloseModal}
                    ></div>
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div
                            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                {modalMode === 'create' ? '创建角色' : '编辑角色'}
                            </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">角色编码 *</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="例如：ADMIN, USER"
                                    required
                                    disabled={modalMode === 'edit'}
                                />
                                {modalMode === 'edit' && (
                                    <p className="mt-1 text-xs text-gray-500">角色编码不可修改</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">角色名称 *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="例如：管理员，普通用户"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="请输入角色描述"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={1}>启用</option>
                                    <option value={0}>禁用</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    {modalMode === 'create' ? '创建' : '保存'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </>
            )}

            {showPermissionModal && (
                <>
                    <div
                        className="fixed inset-0 backdrop-blur-sm bg-transparent z-40"
                        onClick={handleClosePermissionModal}
                    ></div>
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div
                            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                        <h2 className="text-lg font-medium text-gray-900 mb-4">编辑权限</h2>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-4">勾选该角色拥有的所有权限：</p>
                            <div className="flex flex-wrap gap-2">
                                {permissions.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 w-full">暂无权限数据</div>
                                ) : (
                                    permissions.map((permission) => (
                                        <label
                                            key={permission.id}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer transition-all select-none ${
                                                rolePermissionIds.includes(permission.id)
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'bg-white/60 border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={rolePermissionIds.includes(permission.id)}
                                                onChange={() => handlePermissionChange(permission.id)}
                                                className="hidden"
                                            />
                                            <span className="text-sm font-medium">{permission.name}</span>
                                            {permission.module && (
                                                <span className={`text-xs ${rolePermissionIds.includes(permission.id) ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {permission.module}
                                    </span>
                                            )}
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={handleClosePermissionModal}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                取消
                            </button>
                            <button
                                type="button"
                                onClick={handleSavePermissions}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            </>
        )}
        </div>
    )
}

export default RoleManager