package xyz.lingview.dimstack.domain;

import lombok.Data;

@Data
public class LlmConfig {
    private String api_key;
    private String api_url;
    private String model;
}
