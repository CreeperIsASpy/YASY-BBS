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

    static getDerivedStateFromError(error: Error): State {
        // 更新 state，以便下一次渲染可以显示降级后的 UI
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // 你也可以将错误日志上报给某个服务
        console.error("Markdown render error caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // 你可以自定义降级后的 UI
            return (
                <div className="p-4 border border-red-500 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <p className="font-bold text-red-700 dark:text-red-400">内容渲染出错</p>
                    <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                        这篇帖子的 Markdown 内容可能存在格式问题（例如损坏的表格），导致无法正常显示。
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default MarkdownErrorBoundary;