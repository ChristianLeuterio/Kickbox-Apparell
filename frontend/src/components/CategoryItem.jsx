import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CategoryItem = ({ category }) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden h-96 w-full rounded-lg group border border-gray-300 bg-white shadow-sm">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-3 left-3 z-30 flex items-center px-3 py-1.5 bg-gray-800 text-white text-sm rounded-md shadow hover:bg-gray-700 transition"
      >
      </button>

      <Link to={"/category" + category.href}>
        <div className="w-full h-full cursor-pointer">
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-200 opacity-60 z-10" />

          {/* Image */}
          <img
            src={category.imageUrl}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Text */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gray-50 bg-opacity-80">
            <h3 className="text-gray-900 text-2xl font-bold mb-2">{category.name}</h3>
            <p className="text-gray-700 text-sm">Explore {category.name}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CategoryItem;