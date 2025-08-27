-- 查看作者（READER）权限
SELECT r.name AS role_name, p.code, p.name AS permission_name
FROM role_permission rp
         JOIN role r ON rp.role_id = r.id
         JOIN permission p ON rp.permission_id = p.id
WHERE r.code = 'READER';

-- 查看作者（AUTHOR）权限
SELECT r.name AS role_name, p.code, p.name AS permission_name
FROM role_permission rp
         JOIN role r ON rp.role_id = r.id
         JOIN permission p ON rp.permission_id = p.id
WHERE r.code = 'AUTHOR';


-- 查看作者（POST_MANAGER）权限
SELECT r.name AS role_name, p.code, p.name AS permission_name
FROM role_permission rp
         JOIN role r ON rp.role_id = r.id
         JOIN permission p ON rp.permission_id = p.id
WHERE r.code = 'POST_MANAGER';

-- 查看作者（ADMIN）权限
SELECT r.name AS role_name, p.code, p.name AS permission_name
FROM role_permission rp
         JOIN role r ON rp.role_id = r.id
         JOIN permission p ON rp.permission_id = p.id
WHERE r.code = 'ADMIN';