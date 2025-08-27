package xyz.lingview.dimstack.mapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class PermissionMapperIntegrationTest {

    @Autowired
    private UserPermissionMapper permissionMapper;

    @Test
    public void testFindPermissionCodesByUserName() {
        List<String> permissionCodes = permissionMapper.findPermissionCodesByUserName("test");

        assertNotNull(permissionCodes);
        System.out.println("Permissions: " + permissionCodes);
        System.out.println("Permission count: " + permissionCodes.size());
    }
}
