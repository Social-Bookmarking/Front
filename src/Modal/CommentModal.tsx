import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../Util/hook';

interface Reply {
  id: number;
  user: string;
  text: string;
  date: string;
}

interface Comment {
  id: number;
  user: string;
  text: string;
  date: string;
  replies: Reply[];
}

const CommentSection = () => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      user: '홍길동',
      text: '첫 번째 댓글!',
      date: '1일 전',
      replies: [
        {
          id: 11,
          user: '김철수',
          text: '@홍길동 맞아요 👍',
          date: '23시간 전',
        },
        {
          id: 12,
          user: '이영희',
          text: '@홍길동 완전 동의!',
          date: '22시간 전',
        },
      ],
    },
    {
      id: 2,
      user: '이영희',
      text: '좋은 북마크네요 😃',
      date: '2일 전',
      replies: [],
    },
  ]);

  const dispatch = useAppDispatch();
  const bookmarkId = useAppSelector(
    (state) => state.modal.commentModalbookmarkId
  );

  const [input, setInput] = useState('');
  const [showReplies, setShowReplies] = useState<{ [key: number]: boolean }>(
    {}
  );

  const handleAddComment = () => {
    if (!input.trim()) return;

    const tokens = input.trim().split(/\s+/);
    const firstToken = tokens[0];

    if (firstToken.startsWith('@')) {
      // 답글 처리
      const targetName = firstToken.slice(1);
      setComments((prev) =>
        prev.map((c) =>
          c.user === targetName
            ? {
                ...c,
                replies: [
                  ...c.replies,
                  {
                    id: Date.now(),
                    user: '나',
                    text: input,
                    date: '방금 전',
                  },
                ],
              }
            : c
        )
      );
    } else {
      // 일반 댓글
      setComments([
        ...comments,
        {
          id: Date.now(),
          user: '나',
          text: input,
          date: '방금 전',
          replies: [],
        },
      ]);
    }

    setInput('');
  };

  return (
    <div className="w-[500px] h-[70vh] flex flex-col">
      <h2 className="text-lg font-semibold mb-3">댓글</h2>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {comments.map((c) => (
          <div key={c.id} className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold">
                {c.user[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{c.user}</span>
                  <span className="text-xs text-gray-400">{c.date}</span>
                </div>
                <p className="text-sm">{c.text}</p>

                <button
                  className="text-xs text-gray-500 hover:underline mt-1"
                  onClick={() => {
                    setInput(`@${c.user} `);
                  }}
                >
                  답글 달기
                </button>

                {c.replies.length > 0 && (
                  <button
                    className="block text-xs text-violet-600 mt-1"
                    onClick={() =>
                      setShowReplies({
                        ...showReplies,
                        [c.id]: !showReplies[c.id],
                      })
                    }
                  >
                    {showReplies[c.id]
                      ? '답글 숨기기'
                      : `답글 보기 ${c.replies.length}개`}
                  </button>
                )}
              </div>
            </div>

            {showReplies[c.id] && (
              <div className="pl-12 space-y-2">
                {c.replies.map((r) => (
                  <div key={r.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-sm">
                      {r.user[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{r.user}</span>
                        <span className="text-xs text-gray-400">{r.date}</span>
                      </div>
                      <p className="text-sm">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t pt-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={'댓글 달기'}
          className="flex-1 rounded-full border border-[#E6E5F2] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          onClick={handleAddComment}
          className="px-4 py-2 bg-violet-500 text-white rounded-full text-sm hover:bg-violet-600"
        >
          등록
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
