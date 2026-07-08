import React, { useRef, useEffect } from 'react';

export default function ScriptAwareHtml({ html }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !html) return;

        containerRef.current.innerHTML = html;

        const srcRegex = /<script\s+[^>]*src\s*=\s*["']([^"']+)["'][^>]*><\/script>/gi;
        let match;
        while ((match = srcRegex.exec(html)) !== null) {
            const script = document.createElement('script');
            script.src = match[1];
            document.head.appendChild(script);
        }

        const inlineRegex = /<script>([\s\S]*?)<\/script>/gi;
        while ((match = inlineRegex.exec(html)) !== null) {
            const script = document.createElement('script');
            script.textContent = match[1];
            document.head.appendChild(script);
            script.remove();
        }
    }, [html]);

    if (!html) return null;

    return <div ref={containerRef} />;
}
