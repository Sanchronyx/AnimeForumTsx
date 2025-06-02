import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  created_at: string;
  created_by: number;
}

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("http://localhost:5000/news", {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType?.includes("application/json")) {
          const text = await res.text();
          throw new Error(`Invalid response: ${text}`);
        }

        const data = await res.json();
        setNews(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Latest News</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : news.length === 0 ? (
        <p>No news available.</p>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="bg-white shadow rounded p-4 border">
              <h2 className="text-xl font-semibold mb-1">{item.title}</h2>
              <p className="text-gray-600 text-sm mb-2">Posted on {new Date(item.created_at).toLocaleString()}</p>
              <p>{item.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsPage;