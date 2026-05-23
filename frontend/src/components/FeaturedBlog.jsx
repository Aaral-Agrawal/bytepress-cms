 
import FeaturedBlogCard from "@/components/blog/FeaturedBlogCard";

export default function FeaturedBlogsSection({ blogs = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {blogs.map((blog, i) => (
        <FeaturedBlogCard key={blog._id} blog={blog} index={i} />
      ))}
    </div>
  );
}