import { Heart, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '../Util/hook';
import { selectCategories } from '../Util/categorySlice';

const MAX_VISIBLE = 3;

type tag = { tagId: number; tagName: string };

interface BookmarkCardProps {
  categoryId: number;
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  tagIds: tag[];
  liked: boolean;
  latitude: number;
  longitude: number;
}

const BookmarkCard = ({
  categoryId,
  url,
  title,
  description,
  imageUrl,
  tagIds,
  liked,
}: BookmarkCardProps) => {
  const [isLiked, setIsLiked] = useState(liked);
  const categories = useAppSelector(selectCategories);
  const categoryName = categories.find((c) => c.id === categoryId)?.name;

  return (
    <div className="group bg-[#fafafa] border-2 border-[#E6E5F2] rounded-2xl shadow-sm w-full max-w-[250px]">
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
            setIsLiked(!isLiked);
          }}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''} `} />
        </button>
        <span className="absolute bottom-3 left-3 text-primary bg-white/90 text-violet-700 text-xs px-2 py-0.5 rounded-full hover:bg-white">
          {categoryName}
        </span>
      </div>
      <div className="relative p-4 flex flex-col justify-between h-[150px]">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-violet-700">
              {title}
            </h3>
            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 flex-shrink-0" />
          </div>
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
            {description}
          </p>
          {/* 태그 표시 */}
          <div className="flex flex-wrap gap-x-1 max-h-[40px] overflow-visible">
            {tagIds.slice(0, MAX_VISIBLE).map((tag) => (
              <div key={tag.tagId} className="relative group/tag">
                <span className="px-2 py-0.5 text-[9px] max-w-[80px] truncate bg-violet-100 text-violet-700 rounded-full cursor-default">
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
            {tagIds.length > MAX_VISIBLE && (
              <div className="relative group/tag">
                <span className="px-2 py-0.5 text-[9px] bg-gray-200 text-gray-700 rounded-full cursor-default">
                  +{tagIds.length - MAX_VISIBLE}
                </span>
                {/* 나머지 태그 툴팁 */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover/tag:block z-50">
                  <div className="px-2 py-1 text-[9px] text-white bg-gray-800 rounded-md shadow-md whitespace-nowrap max-w-[200px]">
                    {tagIds
                      .slice(MAX_VISIBLE)
                      .map((t) => `#${t.tagName}`)
                      .join(' ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <span className="absolute bottom-2 text-xs text-gray-500 truncate">
          {url}
        </span>
      </div>
    </div>
  );
};

export default BookmarkCard;
