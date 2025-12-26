import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../Util/hook';
import {
  addComment,
  fetchComments,
  fetchReplies,
  deleteComment,
} from '../Util/commentSlice';
import Avatar from '../Components/Avatar';
import toast from 'react-hot-toast';

const CommentModal = () => {
  const dispatch = useAppDispatch();
  const bookmarkId = useAppSelector(
    (state) => state.modal.commentModalbookmarkId
  );

  const commentsState = useAppSelector(
    (state) => state.comments.commentsByBookmark[bookmarkId ?? -1]
  ) ?? { data: [], pageInfo: null, loading: false, error: null };

  const repliesState = useAppSelector(
    (state) => state.comments.repliesByComment
  );

  const userPermission = useAppSelector((state) => state.user.permission);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showReplies, setShowReplies] = useState<Record<number, boolean>>({});
  const [replyTarget, setReplyTarget] = useState<number | null>(null);
  const [rootTarget, setRootTarget] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (bookmarkId) {
      dispatch(fetchComments({ bookmarkId }));
    }
  }, [dispatch, bookmarkId]);

  // 답글 보기/숨기기 토글
  const handleToggleReplies = (commentId: number) => {
    if (!showReplies[commentId]) {
      dispatch(fetchReplies({ commentId }));
    }
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // 댓글/답글 추가
  const handleAddComment = async () => {
    if (!input.trim() || bookmarkId === null) return;
    if (sending) return;

    setSending(true);

    const contentWithoutMention = replyTarget
      ? input.replace(/^@\S+\s*/, '')
      : input;

    if (!contentWithoutMention.trim()) {
      // mention만 있고 실제 내용 없으면 취소
      setSending(false);
      return;
    }

    try {
      if (replyTarget) {
        const replyBaseId = rootTarget ?? replyTarget;
        const replyState = repliesState[replyBaseId];
        const isLastPage = replyState ? !replyState.hasNext : true;

        await dispatch(
          addComment({
            bookmarkId,
            content: contentWithoutMention,
            parentId: replyTarget,
            rootCommentId: rootTarget,
            isLastPage,
          })
        );
        setShowReplies((prev) => ({ ...prev, [replyTarget]: true }));
        setReplyTarget(null); // 초기화
      } else {
        const isLastPage = !commentsState.hasNext;
        await dispatch(
          addComment({
            bookmarkId,
            content: input,
            parentId: null,
            rootCommentId: undefined,
            isLastPage,
          })
        );
      }

      setInput('');
    } catch (error) {
      console.error(error);
      toast.error('댓글 등록 실패');
    } finally {
      setSending(false);
    }
  };

  // 댓글 더보기
  const handleLoadMoreComments = () => {
    if (!bookmarkId || commentsState.loading || !commentsState.hasNext) return;
    dispatch(
      fetchComments({
        bookmarkId,
        cursor: commentsState.nextCursor ?? undefined,
      })
    );
  };

  // 답글 더보기
  const handleLoadMoreReplies = (commentId: number) => {
    const replyState = repliesState[commentId];
    if (!replyState || replyState.loading || !replyState.hasNext) return;

    dispatch(
      fetchReplies({
        commentId,
        cursor: replyState.nextCursor ?? undefined,
      })
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const MAX_COMMENT_LENGTH = 100;

    if (replyTarget && input.startsWith('@')) {
      const mention = input.split(' ')[0]; // 닉네임
      if (!value.startsWith(mention)) {
        setReplyTarget(null);
        setRootTarget(undefined);
        setInput(value.replace(/^@\S+\s?/, ''));
        return;
      }
    }

    if (value.length > MAX_COMMENT_LENGTH) {
      toast.error(`${MAX_COMMENT_LENGTH}자까지만 입력할 수 있습니다.`, {
        id: 'comment-length-error',
      });
      setInput(value.slice(0, MAX_COMMENT_LENGTH));
      return;
    }

    setInput(value);
  };

  return (
    <div className="w-[500px] h-[70vh] flex flex-col">
      <h2 className="text-lg font-semibold mb-3">댓글</h2>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {commentsState.data.map((c) => (
          <div key={c.commentId} className="space-y-2">
            <div className="flex items-start gap-3">
              {/* <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold">
                {c.author.nickname[0]}
              </div> */}
              <Avatar
                name={c.author.nickname}
                src={c.author.profileImageUrl}
                avatarSize={10}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{c.author.nickname}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {userPermission !== 'VIEWER' && (
                    <button
                      className="text-xs text-red-500 hover:underline ml-2"
                      onClick={() =>
                        dispatch(
                          deleteComment({
                            commentId: c.commentId,
                            bookmarkId: bookmarkId!,
                          })
                        )
                      }
                    >
                      삭제
                    </button>
                  )}
                </div>
                <p className="text-sm">{c.content}</p>
                <button
                  className="text-xs text-gray-500 hover:underline mt-1"
                  onClick={() => {
                    setInput(`@${c.author.nickname} `);
                    setReplyTarget(c.commentId);
                    setRootTarget(c.commentId);
                  }}
                >
                  답글 달기
                </button>
                {c.replyCount > 0 && (
                  <button
                    className="block text-xs text-violet-600 mt-1"
                    onClick={() => handleToggleReplies(c.commentId)}
                  >
                    {showReplies[c.commentId]
                      ? '답글 숨기기'
                      : `답글 보기 ${c.replyCount}개`}
                  </button>
                )}
              </div>
            </div>

            {/* 답글 */}
            {showReplies[c.commentId] && (
              <div className="pl-12 space-y-2">
                {repliesState[c.commentId]?.data.map((r) => (
                  <div key={r.commentId} className="flex items-start gap-3">
                    {/* <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-sm">
                      {r.author.nickname[0]}
                    </div> */}
                    <Avatar
                      name={r.author.nickname}
                      src={r.author.profileImageUrl}
                      avatarSize={8}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {r.author.nickname}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <button
                          className="text-xs text-red-500 hover:underline ml-2"
                          onClick={() =>
                            dispatch(
                              deleteComment({
                                commentId: r.commentId,
                                bookmarkId: bookmarkId!,
                                parentId: c.commentId,
                              })
                            )
                          }
                        >
                          삭제
                        </button>
                      </div>
                      <p className="text-sm">
                        {r.parentAuthorNickname && (
                          <span className="text-violet-600 font-semibold">
                            @{r.parentAuthorNickname}{' '}
                          </span>
                        )}
                        {r.content}
                      </p>
                      <button
                        className="text-xs text-gray-500 hover:underline mt-1"
                        onClick={() => {
                          setInput(`@${r.author.nickname} `);
                          setReplyTarget(r.commentId);
                          setRootTarget(c.commentId);
                        }}
                      >
                        답글 달기
                      </button>
                    </div>
                  </div>
                ))}
                {repliesState[c.commentId]?.hasNext && (
                  <div className="flex justify-center py-2">
                    <button
                      onClick={() => handleLoadMoreReplies(c.commentId)}
                      disabled={repliesState[c.commentId]?.loading}
                      className="px-3 py-1 text-xs bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                    >
                      {repliesState[c.commentId]?.loading
                        ? '불러오는 중...'
                        : '답글 더보기'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* 댓글 더보기 */}
        {commentsState.hasNext && (
          <div className="flex justify-center py-3">
            <button
              onClick={handleLoadMoreComments}
              disabled={commentsState.loading}
              className="px-4 py-2 bg-gray-200 rounded-md text-sm hover:bg-gray-300 disabled:opacity-50"
            >
              {commentsState.loading ? '불러오는 중...' : '댓글 더보기'}
            </button>
          </div>
        )}
      </div>

      {/* 입력창 */}
      <div className="border-t pt-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="댓글 달기"
          className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          onClick={() => handleAddComment()}
          disabled={sending || userPermission === 'VIEWER'}
          className={`px-4 py-2 bg-violet-500 text-white rounded-full text-sm ${
            userPermission === 'VIEWER'
              ? 'cursor-not-allowed opacity-50'
              : 'hover:bg-violet-600'
          }`}
        >
          {sending ? '등록 중...' : '등록'}
        </button>
      </div>
    </div>
  );
};

export default CommentModal;
