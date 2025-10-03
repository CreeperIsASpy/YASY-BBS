'use client';

import MDEditor from '@uiw/react-md-editor';
import { useState } from 'react';

export default function CreatePost() {
    const [content, setContent] = useState('');
    
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">发布新帖子</h1>
            <form action="/api/posts" method="POST">
                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        标题
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        内容
                    </label>
                    <MDEditor
                        value={content}
                        onChange={(val) => setContent(val || '')}
                        preview="edit"
                    />
                    <input type="hidden" name="content" value={content} />
                </div>
                
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    发布
                </button>
            </form>
        </div>
    );
}