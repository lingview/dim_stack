package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.Login;

@Mapper
@Repository
public interface LoginMapper {
    Login loginUser(Login login);
}
