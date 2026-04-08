package xyz.lingview.dimstack.domain;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LlmPromptConfig {
    private Integer id;
    private String prompt_name;
    private String prompt_content;
    private LocalDateTime create_time;
    private Integer status;
}
