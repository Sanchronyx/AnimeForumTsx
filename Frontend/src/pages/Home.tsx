import { useEffect, useState } from "react";
import AnimeCard from '../components/AnimeCard';
import axios from '../../axiosConfig';
import React from 'react';

function PlaceholderCard({ index }: { index: number }) {
  return (
    <div
      key={`placeholder-${index}`}
      className="bg-gray-100 w-[200px] h-[320px] rounded-xl flex items-center justify-center text-gray-400 text-sm shadow-inner"
    >
      Loading...
    </div>
  );
}

function SectionSlider<T>({ title, items, render }: { title: string, items: T[], render: (item: T, index: number) => React.JSX.Element }) {
  const maxItems = 10;
  const filled = [...items.map(render)];
  const currentLength = filled.length;

  for (let i = 0; i < maxItems - currentLength; i++) {
    filled.push(<PlaceholderCard key={`placeholder-${i}`} index={i} />);
  }

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">{title}</h2>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 px-4 pb-2">
          {filled}
        </div>
      </div>
    </section>
  );
}

interface AnimeItem {
  id: number;
  title: string;
  image_url: string;
  score: number;
  episodes: number;
  status: string;
  year?: number;
  genres?: string;
  studios?: string;
  type?: string;
}

interface ReviewItem {
  id: number;
  anime_title: string;
  text: string;
  user: string;
}

interface PostItem {
  id: number;
  title: string;
  content: string;
  user: string;
}

interface NewsItem {
  id: number;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
}

interface HomeData {
  top_anime: AnimeItem[];
  most_popular: AnimeItem[];
  recent_reviews: ReviewItem[];
  recent_posts: PostItem[];
  news?: NewsItem[];
}

export default function Home(): React.JSX.Element {
  const [data, setData] = useState<HomeData>({
    top_anime: [],
    most_popular: [],
    recent_reviews: [],
    recent_posts: [],
    news: []
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [homeRes, newsRes] = await Promise.all([
          axios.get('/api/home'),
          axios.get('/news')
        ]);
        setData({ ...homeRes.data, news: newsRes.data });
      } catch (err) {
        console.warn("News or home fetch failed:", err);
      }
    };
    fetchAll();
  }, []);

  return (
    <main className="px-0 md:px-6 py-10 space-y-14 bg-gray-50 min-h-screen">
      {data.news && data.news.length > 0 && (
        <section className="mb-12 px-4">
          <h2 className="text-2xl font-bold mb-4 text-indigo-800">Latest News</h2>
          <div className="space-y-4">
            {data.news.map((n) => (
              <div key={n.id} className="bg-white border border-indigo-200 shadow-sm rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">
                  Posted by <span className="font-semibold text-indigo-700">{n.created_by}</span> on {new Date(n.created_at).toLocaleDateString()}
                </div>
                <h3 className="text-lg font-bold text-indigo-900 mb-1">{n.title}</h3>
                <p className="text-gray-800 whitespace-pre-wrap">{n.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <SectionSlider title="Top Anime of All Time" items={data.top_anime} render={(anime) => (
        <div className="min-w-[200px] md:min-w-[240px]" key={anime.id}>
          <AnimeCard anime={anime} />
        </div>
      )} />

      <SectionSlider title="Most Popular Anime of All Time" items={data.most_popular} render={(anime) => (
        <div className="min-w-[200px] md:min-w-[240px]" key={anime.id}>
          <AnimeCard anime={anime} />
        </div>
      )} />

      <SectionSlider title="Recent Reviews" items={data.recent_reviews} render={(review) => (
        <div key={review.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 p-4 w-[320px] flex flex-col justify-between">
          <p className="italic text-gray-700 line-clamp-4">"{review.text}"</p>
          <p className="text-xs text-gray-500 mt-2">— {review.user} on <span className="font-medium">{review.anime_title}</span></p>
        </div>
      )} />

      <SectionSlider title="Recent Forum Posts" items={data.recent_posts} render={(post) => (
        <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-4 w-[320px] hover:shadow-md transition duration-300">
          <h4 className="font-bold text-md mb-1 truncate text-indigo-700">{post.title}</h4>
          <p className="text-sm text-gray-700 line-clamp-4">{post.content}</p>
          <p className="text-xs text-gray-500 mt-2">by {post.user}</p>
        </div>
      )} />
    </main>
  );
}