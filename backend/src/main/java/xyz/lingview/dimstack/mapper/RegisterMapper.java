package xyz.lingview.dimstack.mapper;


import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.Login;
import xyz.lingview.dimstack.domain.Register;

@Mapper
@Repository
public interface RegisterMapper {
    int selectUser(String username);
    int insertUser(Register register);

}
