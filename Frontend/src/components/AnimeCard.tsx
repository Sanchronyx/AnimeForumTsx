import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AnimeCardProps {
  anime: {
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
  };
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/anime/${anime.id}`);
  };

  return (
    <div
      className="bg-white shadow-md rounded-xl overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl duration-300 cursor-pointer group"
      onClick={handleClick}
    >
      <img
        src={anime.image_url}
        alt={anime.title}
        className="w-full h-64 object-cover object-center group-hover:brightness-90 transition duration-300"
      />
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-bold truncate group-hover:text-indigo-600 transition-colors duration-200" title={anime.title}>{anime.title}</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p>Score: <span className="font-medium text-black">{anime.score ?? 'N/A'}</span></p>
          <p>Episodes: {anime.episodes ?? 'Unknown'}</p>
          <p>Status: {anime.status}</p>
          <p>Year: {anime.year ?? 'N/A'}</p>
          <p>Type: {anime.type ?? 'N/A'}</p>
          {anime.genres && <p className="text-xs text-gray-500 truncate group-hover:text-gray-800 transition" title={anime.genres}>Genres: {anime.genres}</p>}
          {anime.studios && <p className="text-xs text-gray-500 truncate group-hover:text-gray-800 transition" title={anime.studios}>Studios: {anime.studios}</p>}
        </div>
      </div>
    </div>
  );
};

export default AnimeCard;
