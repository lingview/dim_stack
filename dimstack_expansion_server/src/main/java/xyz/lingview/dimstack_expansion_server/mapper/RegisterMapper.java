package xyz.lingview.dimstack_expansion_server.mapper;


import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack_expansion_server.domain.Register;

@Mapper
@Repository
public interface RegisterMapper {
    int selectUser(String username);
    int insertUser(Register register);

}
