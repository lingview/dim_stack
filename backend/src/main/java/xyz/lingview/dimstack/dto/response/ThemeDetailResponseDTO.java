package xyz.lingview.dimstack.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

@Data
public class ThemeDetailResponseDTO {
    private JsonNode data;
    private String message;
}
