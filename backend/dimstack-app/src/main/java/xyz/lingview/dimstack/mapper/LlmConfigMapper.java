package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.LlmConfig;

@Mapper
@Repository
public interface LlmConfigMapper {
    LlmConfig getLlmConfig();

    int updateLlmConfig(LlmConfig llmConfig);

    int insertLlmConfig(LlmConfig llmConfig);
}
