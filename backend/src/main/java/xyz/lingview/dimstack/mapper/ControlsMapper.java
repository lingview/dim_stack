package xyz.lingview.dimstack.mapper;


import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.Login;
import xyz.lingview.dimstack.domain.Register;

import java.util.List;

@Mapper
@Repository
public interface ControlsMapper {
    int selectUser(String username);
    int insertUser(Register register);
    Login loginUser(Login login);

}
