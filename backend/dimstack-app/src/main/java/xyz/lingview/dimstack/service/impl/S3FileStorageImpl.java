package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import xyz.lingview.dimstack.service.FileStorage;

import java.io.InputStream;
import java.net.URI;
import java.time.Duration;

/**
 * @Author: lingview
 * @Date: 2026/07/17 20:25:47
 * @Description: S3协议存储实现（兼容 AWS S3、阿里云OSS、腾讯云COS、MinIO 等）
 * @Version: 1.0
 */
@Slf4j
public class S3FileStorageImpl implements FileStorage {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucket;

    public S3FileStorageImpl(String endpoint, String region, String bucket,
                         String accessKey, String secretKey, boolean pathStyleAccess) {
        this.bucket = bucket;

        URI endpointUri = URI.create(endpoint);
        Region awsRegion = parseRegion(region);
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);

        this.s3Client = S3Client.builder()
                .endpointOverride(endpointUri)
                .region(awsRegion)
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .forcePathStyle(pathStyleAccess)
                .build();

        this.s3Presigner = S3Presigner.builder()
                .endpointOverride(endpointUri)
                .region(awsRegion)
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();

        ensureBucketExists();
    }


    private static Region parseRegion(String region) {
        return Region.US_EAST_1;
    }

    private void ensureBucketExists() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (NoSuchBucketException e) {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
            log.info("S3桶已创建: {}", bucket);
        } catch (S3Exception e) {
            if (e.statusCode() == 404) {
                s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
                log.info("S3桶已创建: {}", bucket);
            } else {
                log.warn("检查S3桶时发生异常（可能无权限，不影响后续操作）: {}", e.getMessage());
            }
        }
    }

    @Override
    public void store(String objectKey, InputStream data, long contentLength, String contentType) {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .contentType(contentType)
                .contentLength(contentLength)
                .build();

        s3Client.putObject(request, RequestBody.fromInputStream(data, contentLength));
        log.debug("S3存储写入成功: {}/{}", bucket, objectKey);
    }

    @Override
    public InputStream retrieve(String objectKey) {
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .build();

        return s3Client.getObject(request);
    }

    @Override
    public void delete(String objectKey) {
        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .build();

        s3Client.deleteObject(request);
        log.debug("S3存储删除成功: {}/{}", bucket, objectKey);
    }

    @Override
    public boolean exists(String objectKey) {
        try {
            HeadObjectRequest request = HeadObjectRequest.builder()
                    .bucket(bucket)
                    .key(objectKey)
                    .build();
            s3Client.headObject(request);
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        }
    }

    @Override
    public void copy(String sourceKey, String destKey) {
        CopyObjectRequest request = CopyObjectRequest.builder()
                .sourceBucket(bucket)
                .sourceKey(sourceKey)
                .destinationBucket(bucket)
                .destinationKey(destKey)
                .build();

        s3Client.copyObject(request);
        log.debug("S3存储拷贝成功: {}/{} -> {}/{}", bucket, sourceKey, bucket, destKey);
    }

    @Override
    public String getType() {
        return "s3";
    }

    @Override
    public boolean supportsPresignedUrl() {
        return true;
    }

    /**
     * 生成预签名URL（用于文件访问）
     */
    public String generatePresignedUrl(String objectKey, Duration expiration) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(expiration)
                .getObjectRequest(getObjectRequest)
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
        return presignedRequest.url().toString();
    }

    public void shutdown() {
        s3Client.close();
        s3Presigner.close();
    }

    @Override
    public void close() {
        shutdown();
    }
}