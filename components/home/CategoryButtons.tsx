import Link from "next/link";
import { logButtonClick } from "@/lib/firebase/analytics";

const categories = [
  { name: "Explore Tours", href: "/tours" },
  { name: "Explore Day Trips", href: "/tours?category=day-trips" },
  { name: "Explore Special Offers", href: "/tours?category=special-offers" },
];

const CategoryButtons = () => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-orange-600 font-semibold tracking-wide uppercase">
            Categories
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Find Your Next Adventure
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Click on a category to start exploring our curated safari
            experiences.
          </p>
        </div>

        <div className="mt-10">
          <div className="flex justify-center space-x-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                onClick={() =>
                  logButtonClick(category.name, "category_buttons")
                }
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryButtons;
