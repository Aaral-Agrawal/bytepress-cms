'use client';

import { useMemo, useState } from 'react';
import BlogCard from '@/components/blog/BlogCard';

export default function SearchSection({ allBlogs = [] }) {
  const [query, setQuery] = useState('');

  const filteredBlogs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return allBlogs;

    return allBlogs.filter((blog) => {
      const title = blog.title || '';
      const description = blog.description || blog.summary || blog.excerpt || '';
      const author = blog.author?.name || blog.author?.email || '';
      const categories = Array.isArray(blog.categories) ? blog.categories.join(' ') : '';
      const tags = Array.isArray(blog.tags) ? blog.tags.join(' ') : '';

      return [title, description, author, categories, tags]
        .some((value) => value.toLowerCase().includes(normalized));
    });
  }, [allBlogs, query]);

  return (
    <section aria-labelledby="search-heading" className="py-16 px-4"> 
      <div className="max-w-[1200px] mx-auto"> 
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8"> 
          <div> 
            <h2 id="search-heading" className="text-2xl font-bold text-gray-900"> 
              Browse all articles 
            </h2> 
            <p className="text-gray-500 text-sm mt-1"> 
              Search by title, author, category, or tag. 
            </p> 
          </div> 
          <div className="w-full sm:w-80"> 
            <label className="sr-only" htmlFor="blog-search">Search blogs</label> 
            <input 
              id="blog-search" 
              type="search" 
              value={query} 
              onChange={(event) => setQuery(event.target.value)} 
              placeholder="Search articles..." 
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" 
            /> 
          </div> 
        </div> 

        <div className="mb-6 text-sm text-gray-500"> 
          Showing {filteredBlogs.length} of {allBlogs.length} articles. 
        </div> 

        {filteredBlogs.length === 0 ? ( 
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-12 text-center text-sm text-gray-500"> 
            No articles matched your search. 
          </div> 
        ) : ( 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> 
            {filteredBlogs.map((blog) => ( 
              <BlogCard key={blog._id} blog={blog} /> 
            ))} 
          </div> 
        )} 
      </div> 
    </section>
  );
}
