// Hello 插件前端模块: 注册后台页面(与 menu.yaml 的 link 同路径)与前台 /hello 路由; react 由宿主 import map 提供, 不要自带副本。
import React from 'react';

const HelloAdminPage = () => {
    const [state, setState] = React.useState({ loading: true, message: '', table: '', rows: null });

    React.useEffect(() => {
        Promise.all([
            fetch('/api/plugins/hello/hello').then((r) => r.json()),
            fetch('/api/plugins/hello/notes/count').then((r) => r.json()),
        ])
            .then(([hello, notes]) => setState({
                loading: false,
                message: hello.message,
                table: notes.table || '不可用',
                rows: notes.rows == null ? '需登录' : notes.rows,
            }))
            .catch(() => setState({ loading: false, message: '接口调用失败', table: '不可用', rows: '不可用' }));
    }, []);

    return React.createElement(
        'div',
        { className: 'hello-page' },
        React.createElement('h2', { className: 'hello-title' }, 'Hello 示例 后台页面'),
        React.createElement('p', { className: 'hello-desc' }, '本页面由插件前端注册, 路径与 menu.yaml 的 link 相同, 从侧边栏菜单点击进入'),
        state.loading
            ? React.createElement('p', { className: 'hello-desc' }, '加载中...')
            : React.createElement(
                'div',
                { className: 'hello-info' },
                React.createElement('p', null, state.message),
                React.createElement('p', null, '数据表: ' + state.table + ' / 行数: ' + state.rows),
            ),
        React.createElement('a', { className: 'hello-link', href: '/hello' }, '前往前台 /hello 页面 →'),
    );
};

export default {
    setup(context) {
        context.registerRoute({
            path: '/dashboard/plugins/hello/home',
            element: React.createElement(HelloAdminPage),
        });
        context.registerRoute({
            path: '/hello',
            element: React.createElement('div', { className: 'hello' }, 'Hello from hello'),
        });
    },
};
