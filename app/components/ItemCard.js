import Link from 'next/link';

export default function ItemCard({ item }) {
  return (
    <Link 
      key={item._id}
      href={`/community/${item._id}`}
      className="block"
    >
      <div className="flex items-center p-8 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded-lg">
          {item.imageUrls && item.imageUrls.length > 0 ? (
            <img 
              src={item.imageUrls[0]} 
              alt={item.name} 
              className="w-full h-full object-cover rounded-lg" 
            />
          ) : (
            <span className="text-gray-500">이미지 없음</span>
          )}
        </div>
        <div className="ml-12 flex-1">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">   
              {item.recommended ? (
                <span className="px-3 py-1 bg-blue-100 rounded-full text-blue-600 font-bold">추천템</span>
              ) : (
                <span className="px-3 py-1 bg-pink-100 rounded-full text-red-400 font-bold">비추천템</span>
              )}
              <p className="font-semibold text-2xl whitespace-pre-wrap">{item.name}</p>
            </div>
            <span className="text-base text-gray-500">
              {new Date(item.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
          <p className="text-l text-gray-700 whitespace-pre-wrap mb-1 line-clamp-1">내용              {item.description}</p>
          <p className="text-l text-gray-700 whitespace-pre-wrap mb-1">사용 연령      {item.ageGroup}</p>
          <p className="text-l text-gray-700 whitespace-pre-wrap mb-1">
            구매처           {item.purchaseLink || '미기재'}
          </p>
        </div>
      </div>
    </Link>
  );
}