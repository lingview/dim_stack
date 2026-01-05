import { useState, useRef } from 'react';

const SUPPORTED_FILE_TYPES = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/mkv'],
    audio: ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/flac'],
    archive: [
        'application/zip', 'application/x-rar-compressed',
        'application/x-tar', 'application/gzip',
        'application/x-xz', 'application/x-7z-compressed',
        'application/x-zip-compressed',
        'application/x-compressed',
        'application/x-gzip'
    ]
};

const getMediaType = (fileType) => {
    for (const [type, mimes] of Object.entries(SUPPORTED_FILE_TYPES)) {
        if (mimes.includes(fileType)) return type;
    }
    return null;
};

const isFileSupported = (fileType) =>
    Object.values(SUPPORTED_FILE_TYPES).flat().includes(fileType);

export function useFileUpload(apiClient, getConfig) {
    const [uploading, setUploading] = useState(false);
    const uploadingFiles = useRef(new Set());
    const uploadPositionsRef = useRef(new Map());

    const normalUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post('/uploadattachment', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data?.fileUrl || response.fileUrl;
        } catch (error) {
            throw new Error('普通上传失败: ' + (error.response?.data?.error || error.message));
        }
    };

    const multipartUpload = async (file) => {
        const CHUNK_SIZE = 5 * 1024 * 1024;
        const chunks = Math.ceil(file.size / CHUNK_SIZE);

        try {
            const initResponse = await apiClient.post('/uploadattachment/init', {
                filename: file.name
            });
            const uploadId = initResponse.data?.uploadId || initResponse.uploadId;

            for (let i = 0; i < chunks; i++) {
                const start = i * CHUNK_SIZE;
                const chunk = file.slice(start, Math.min(start + CHUNK_SIZE, file.size));

                await apiClient.post('/uploadattachment/part', chunk, {
                    headers: {
                        'Upload-Id': uploadId,
                        'Chunk-Index': i,
                        'Content-Type': 'application/octet-stream'
                    }
                });
            }

            const completeResponse = await apiClient.post('/uploadattachment/complete', {
                uploadId,
                filename: file.name
            });
            return completeResponse.data?.fileUrl || completeResponse.fileUrl;
        } catch (error) {
            throw new Error('分片上传失败: ' + (error.response?.data?.error || error.message));
        }
    };

    const processFile = async (file, insertPosition) => {
        if (!file || !isFileSupported(file.type)) {
            if (file && !isFileSupported(file.type)) {
                const errorMessage = `不支持的文件类型: ${file.type}\n\n仅支持: ${Object.values(SUPPORTED_FILE_TYPES).flat().join(', ')}`;
                alert(errorMessage);
            }
            return null;
        }

        const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
        if (uploadingFiles.current.has(fileKey)) return null;

        uploadingFiles.current.add(fileKey);
        uploadPositionsRef.current.set(fileKey, insertPosition);
        setUploading(true);

        try {
            const fileUrl = file.size > 10 * 1024 * 1024
                ? await multipartUpload(file)
                : await normalUpload(file);

            if (fileUrl) {
                const fullUrl = getConfig().getFullUrl(fileUrl);
                const mediaType = getMediaType(file.type);

                const snippets = {
                    image: `\n![${file.name}](${fullUrl})\n`,
                    video: `\n<video src="${fullUrl}" controls style="width: 400px;"></video>\n`,
                    audio: `\n<audio src="${fullUrl}?filename=${encodeURIComponent(file.name)}" controls preload="metadata" data-filename="${file.name}"></audio>\n`,
                    archive: `\n<archive src="${fullUrl}?filename=${encodeURIComponent(file.name)}" data-filename="${file.name}"></archive>\n`
                };

                return {
                    content: snippets[mediaType] || null,
                    position: uploadPositionsRef.current.get(fileKey)
                };
            }
            return null;
        } catch (error) {
            alert('文件上传失败: ' + error.message);
            return null;
        } finally {
            uploadingFiles.current.delete(fileKey);
            uploadPositionsRef.current.delete(fileKey);

            if (uploadingFiles.current.size === 0) {
                setUploading(false);
            }
        }
    };

    return {
        uploading,
        processFile,
        SUPPORTED_FILE_TYPES
    };
}