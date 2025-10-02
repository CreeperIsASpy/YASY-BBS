// src/components/MarkdownErrorBoundary.tsx
'use client';

import React from 'react';

type State = {
    hasError: boolean;
};

type Props = {
    children: React.ReactNode;
};

class MarkdownErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    // 如果不需要使用 error 参数，可以用下划线标记为有意忽略
    static getDerivedStateFromError(_error: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Markdown render error caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // 自定义错误 UI 展示
            return (
                <div className="p-4 border border-red-500 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <p className="font-bold text-red-700 dark:text-red-400">渲染 Markdown 内容时出错</p>
                    <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                        渲染 Markdown 内容时出错，请检查内容格式是否正确。
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default MarkdownErrorBoundary;