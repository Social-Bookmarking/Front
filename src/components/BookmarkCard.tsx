import { Heart } from 'lucide-react';

interface BookmarkCardProps {
  title: string;
  description: string;
  imageUrl: string;
  tag: string;
}

const BookmarkCard = ({
  title,
  description,
  imageUrl,
  tag,
}: BookmarkCardProps) => {
  return (
    <div className="bg-[#fafafa] border-2 border-[#E6E5F2] rounded-2xl shadow-sm overflow-hidden w-full max-w-[250px]">
      <div className="relative">
        <img src={imageUrl} alt={title} className="w-full h-36 object-cover" />
        <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-gray-100">
          <Heart className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="p-4">
        <span className="inline-block text-xs text-white bg-violet-500 px-2 py-0.5 rounded-full mb-2">
          {tag}
        </span>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>
      </div>
    </div>
  );
};

export default BookmarkCard;
