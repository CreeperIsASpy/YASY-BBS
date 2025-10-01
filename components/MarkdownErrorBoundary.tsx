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
        // ���� state���Ա���һ����Ⱦ������ʾ������� UI
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // ��Ҳ���Խ�������־�ϱ���ĳ������
        console.error("Markdown render error caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // ������Զ��彵����� UI
            return (
                <div className="p-4 border border-red-500 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <p className="font-bold text-red-700 dark:text-red-400">������Ⱦ����</p>
                    <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                        ��ƪ���ӵ� Markdown ���ݿ��ܴ��ڸ�ʽ���⣨�����𻵵ı�񣩣������޷�������ʾ��
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default MarkdownErrorBoundary;