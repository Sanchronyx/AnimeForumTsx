import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';

interface AnimeItem {
  id: number;
  title: string;
  image_url: string;
  score: number;
  episodes: number;
  status: string; // ✅ was: string | undefined
  year?: number;
  genres?: string;
  studios?: string;
  type?: string;
}


export default function BrowseAnime() {
  const [anime, setAnime] = useState<AnimeItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = parseInt(searchParams.get('page') || '1');
  const title = searchParams.get('title') || '';
  const genre = searchParams.get('genre') || '';
  const type = searchParams.get('type') || '';
  const status = searchParams.get('status') || '';

  useEffect(() => {
    fetch(`/api/anime/browse?page=${page}&title=${title}&genre=${genre}&type=${type}&status=${status}`)
      .then(res => res.json())
      .then(data => {
        setAnime(data.anime);
        setTotalPages(data.total_pages);
      });
  }, [searchParams]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Browse Anime</h1>

      <div className="mb-8 p-4 bg-white shadow rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search title..."
          className="px-3 py-2 border rounded w-full"
          defaultValue={title}
          onBlur={(e) => handleFilterChange('title', e.target.value)}
        />
        <select className="border px-2 py-2 rounded" defaultValue={genre} onChange={e => handleFilterChange('genre', e.target.value)}>
          <option value="">All Genres</option>
          <option value="Action">Action</option>
          <option value="Comedy">Comedy</option>
          <option value="Romance">Romance</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Sci-Fi">Sci-Fi</option>
        </select>
        <select className="border px-2 py-2 rounded" defaultValue={type} onChange={e => handleFilterChange('type', e.target.value)}>
          <option value="">All Types</option>
          <option value="TV">TV</option>
          <option value="Movie">Movie</option>
          <option value="OVA">OVA</option>
        </select>
        <select className="border px-2 py-2 rounded" defaultValue={status} onChange={e => handleFilterChange('status', e.target.value)}>
          <option value="">All Status</option>
          <option value="Finished Airing">Finished</option>
          <option value="Currently Airing">Airing</option>
          <option value="Not yet aired">Upcoming</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-10">
        {anime.length > 0 ? (
          anime.map(a => <AnimeCard key={a.id} anime={a} />)
        ) : (
          <p className="text-center col-span-full text-gray-600">No anime found. Try changing filters or loading data.</p>
        )}
      </div>

      <div className="mt-10 flex justify-center items-center gap-4">
        <button
          onClick={() => handlePageChange(Math.max(1, page - 1))}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          disabled={page === 1}
        >
          Prev
        </button>
        <span className="text-gray-700">Page {page} of {totalPages}</span>
        <button
          onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
