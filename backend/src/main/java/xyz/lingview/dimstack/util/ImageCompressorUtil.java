package xyz.lingview.dimstack.util;

import net.coobird.thumbnailator.Thumbnails;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

/**
 * @Author: lingview
 * @Date: 2026/04/17 22:25:12
 * @Description: 图片压缩工具
 * @Version: 1.0
 */
public class ImageCompressorUtil {

    public static void compress(String inputPath, String outputPath) throws IOException {
        File inputFile = new File(inputPath);
        if (!inputFile.exists()) {
            throw new IllegalArgumentException("原图不存在: " + inputPath);
        }

        long originalSize = inputFile.length();
        
        String fileName = inputFile.getName().toLowerCase();
        boolean isJpeg = fileName.endsWith(".jpg") || fileName.endsWith(".jpeg");
        boolean isWebp = fileName.endsWith(".webp");
        
        if (isWebp) {
            Files.copy(inputFile.toPath(), new File(outputPath).toPath());
            return;
        }
        
        if (isJpeg && originalSize <= 1_000_000) {
            Files.copy(inputFile.toPath(), new File(outputPath).toPath());
            return;
        }
        
        float quality;
        if (isJpeg) {
            quality = calculateQualityForJpeg(originalSize);
        } else {
            quality = calculateQualityForOther(originalSize);
        }

        Thumbnails.of(inputFile)
                .scale(1.0)
                .outputQuality(quality)
                .outputFormat("JPEG")
                .toFile(new File(outputPath));
        
        File outputFile = new File(outputPath);
        long compressedSize = outputFile.length();
        
        if (compressedSize >= originalSize) {
            outputFile.delete();
            javax.imageio.ImageIO.read(inputFile);
            Thumbnails.of(inputFile)
                    .scale(0.8)
                    .outputQuality(0.7f)
                    .outputFormat("JPEG")
                    .toFile(new File(outputPath));
            
            compressedSize = new File(outputPath).length();
            if (compressedSize >= originalSize) {
                outputFile.delete();
                java.nio.file.Files.copy(inputFile.toPath(), outputFile.toPath());
            }
        }
    }


    private static float calculateQualityForJpeg(long fileSizeBytes) {
        if (fileSizeBytes <= 2_000_000) {
            return 0.55f;
        } else if (fileSizeBytes <= 5_000_000) {
            return 0.45f;
        } else {
            return 0.35f;
        }
    }
    
    private static float calculateQualityForOther(long fileSizeBytes) {
        if (fileSizeBytes <= 500_000) {
            return 0.7f;
        } else if (fileSizeBytes <= 2_000_000) {
            return 0.6f;
        } else if (fileSizeBytes <= 5_000_000) {
            return 0.5f;
        } else {
            return 0.4f;
        }
    }

}
