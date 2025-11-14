import {
  Heart,
  ExternalLink,
  Trash2,
  MessageCircleMore,
  Pencil,
} from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../Util/hook';
import { selectCategories } from '../Util/categorySlice';
import { setBookMarkModifyModal, setCommentModal } from '../Util/modalSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import { deleteBookmark } from '../Util/bookmarkSlice';
import { selectSelectedGroup } from '../Util/groupSlice';

// 보여지는 태그 최대 개수
const MAX_VISIBLE = 3;

type Tag = { tagId: number; tagName: string };

interface BookmarkCardProps {
  bookmarkId: number;
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  categoryId: number;
  likesCount: number;
  tags: Tag[];
  liked: boolean;
}

const BookmarkCard = ({
  bookmarkId,
  categoryId,
  url,
  title,
  description,
  imageUrl,
  tags,
  liked,
}: BookmarkCardProps) => {
  const dispatch = useAppDispatch();
  const [isLiked, setIsLiked] = useState(liked);
  const categories = useAppSelector(selectCategories);
  const categoryName = categories.find((c) => c.id === categoryId)?.name;
  const currentGroupId = useAppSelector(selectSelectedGroup);

  const handleLike = async (nextLiked: boolean) => {
    try {
      if (nextLiked) {
        await axios.post(
          `https://www.marksphere.link/api/bookmarks/${bookmarkId}/like`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      } else {
        await axios.delete(
          `https://www.marksphere.link/api/bookmarks/${bookmarkId}/like`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      }
    } catch (err) {
      console.log(err);
      toast.error('좋아요 도중 오류가 발생했습니다.');
    }
  };

  const handleOpenNewTap = () => {
    window.open(url, '_blank', 'noopener, noreferrer');
  };

  return (
    <div className="group bg-[#fafafa] border-2 border-[#E6E5F2] rounded-2xl shadow-sm w-full min-w-[200px] max-w-[250px]">
      <div className="relative overflow-hidden rounded-t-2xl">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-120"
        />
        <button
          className={`absolute top-2 right-2 rounded-full p-2 shadow ${
            isLiked
              ? 'bg-red-500/90 text-white'
              : 'bg-white/90 text-gray-600 hover:bg-white'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            const nextLiked = !isLiked;
            setIsLiked(nextLiked);
            handleLike(nextLiked);
          }}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''} `} />
        </button>
        <span className="absolute bottom-3 left-3 text-primary bg-white/90 text-violet-700 text-xs px-2 py-0.5 rounded-full hover:bg-white">
          {categoryName}
        </span>
        <MessageCircleMore
          className="absolute text-gray-400 w-4 h-4 bottom-3 right-15 hover:text-violet-700"
          onClick={() =>
            dispatch(setCommentModal({ open: true, bookmarkId: bookmarkId }))
          }
        />
        <Pencil
          className="absolute text-gray-400 w-4 h-4 bottom-3 right-9 hover:text-violet-700"
          onClick={() =>
            dispatch(
              setBookMarkModifyModal({ open: true, bookmardId: bookmarkId })
            )
          }
        />
        <Trash2
          className="absolute text-gray-400 w-4 h-4 bottom-3 right-3 hover:text-violet-700"
          onClick={() =>
            dispatch(deleteBookmark({ bookmarkId, groupId: currentGroupId }))
          }
        />
      </div>
      <div className="relative p-4 flex flex-col justify-between h-[150px]">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-violet-700">
              {title}
            </h3>
            <ExternalLink
              className="w-4 h-4 opacity-0 group-hover:opacity-100 flex-shrink-0 cursor-pointer hover:text-violet-700"
              onClick={handleOpenNewTap}
            />
          </div>
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
            {description}
          </p>
          {/* 태그 표시 */}
          <div className="flex flex-wrap gap-x-1 max-h-[40px] overflow-visible">
            {tags.slice(0, MAX_VISIBLE).map((tag) => (
              <div key={tag.tagId} className="relative group/tag">
                <span className="px-2 py-0.5 text-[9px] max-w-[80px] truncate bg-violet-100 text-violet-700 rounded-full cursor-default inline-block align-middle">
                  #{tag.tagName}
                </span>
                {/* 커스텀 툴팁 */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover/tag:block z-50">
                  <div className="px-2 py-1 text-[9px] text-white bg-gray-800 rounded-md shadow-md whitespace-nowrap">
                    #{tag.tagName}
                  </div>
                </div>
              </div>
            ))}
            {tags.length > MAX_VISIBLE && (
              <div className="relative group/tag">
                <span className="px-2 py-0.5 text-[9px] bg-gray-200 text-gray-700 rounded-full cursor-default inline-block align-middle">
                  +{tags.length - MAX_VISIBLE}
                </span>
                {/* 나머지 태그 툴팁 */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover/tag:block z-50">
                  <div className="px-2 py-1 text-[9px] text-white bg-gray-800 rounded-md shadow-md inline-block whitespace-normal">
                    {tags.slice(MAX_VISIBLE).map((t) => (
                      <div key={t.tagId} className="block whitespace-nowrap">
                        #{t.tagName}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <span className="absolute bottom-2 left-0 right-0 px-4 text-xs text-gray-500 truncate">
          {url}
        </span>
      </div>
    </div>
  );
};

export default BookmarkCard;
