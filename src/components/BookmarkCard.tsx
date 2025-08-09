import { Heart, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface BookmarkCardProps {
  title: string;
  description: string;
  imageUrl: string;
  tag: string;
  isFavorite?: boolean;
  url: string;
}

const BookmarkCard = ({
  title,
  description,
  imageUrl,
  tag,
  isFavorite = false,
  url,
}: BookmarkCardProps) => {
  const [isLiked, setIsLiked] = useState(isFavorite);

  return (
    <div className="group bg-[#fafafa] border-2 border-[#E6E5F2] rounded-2xl shadow-sm overflow-hidden w-full max-w-[250px]">
      <div className="relative overflow-hidden">
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
          {tag}
        </span>
      </div>
      <div className="p-4 flex flex-col justify-between h-[150px]">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-violet-700">
              {title}
            </h3>
            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 flex-shrink-0" />
          </div>
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
            {description}
          </p>
        </div>
        <span className="text-xs text-gray-500 truncate">{url}</span>
      </div>
    </div>
  );
};

export default BookmarkCard;
