package xyz.lingview.dimstack.enums;

public enum AiReviewResult {
    // 审核通过
    PASS,
    
    // 审核不通过（明确违规）
    REJECT,
    
    // 审核异常（需要人工审核）
    ERROR
}
