import { fakeData } from '../api';

export default function CategorySidebar() {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 transition-colors duration-200 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">文章分类</h3>
            <ul className="space-y-2">
                {fakeData.categories.map((category) => (
                    <li key={category.id}>
                        <a
                            href={`/category/${category.id}`}
                            className="flex justify-between items-center text-gray-600 hover:text-blue-600 transition-colors duration-200 hover:bg-gray-50 px-2 py-1 rounded"
                        >
                            <span>{category.name}</span>
                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                {category.count}
              </span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
