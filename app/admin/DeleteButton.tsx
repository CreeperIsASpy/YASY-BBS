'use client';

import { deleteThread } from './actions';

export function DeleteButton({ threadId }: { threadId: number }) {
    return (
        <form action={deleteThread}>
            <input type="hidden" name="threadId" value={threadId} />
            <button
                type="submit"
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={(e) => {
                    if (!confirm('确定要删除这个帖子吗？')) {
                        e.preventDefault();
                    }
                }}
            >
                删除
            </button>
        </form>
    );
}