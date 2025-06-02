import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReviewCard from '../components/ReviewCard';

interface AnimeDetailData {
  id: number;
  title: string;
  image_url: string;
  score: number;
  episodes: number;
  status: string;
  year?: number;
  type?: string;
  genres?: string;
  studios?: string;
  synopsis?: string;
}

interface ReviewType {
  id: number;
  rating: number;
  text: string;
  user: string;
  likes: number;
  dislikes: number;
  created_at: string;
}

export default function AnimeDetail() {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<AnimeDetailData | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewScore, setReviewScore] = useState<number | null>(null);
  const [allReviews, setAllReviews] = useState<ReviewType[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [sortType, setSortType] = useState<'recent' | 'popular'>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    fetch(`/auth/whoami`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCurrentUser(data.username || ''));

    fetch(`/api/anime/${id}`)
      .then(res => res.json())
      .then(setAnime)
      .catch(console.error);

    fetch(`/api/review/anime/${id}`)
      .then(res => res.json())
      .then(data => {
        setAllReviews(data.reviews);
        setAverageRating(data.average_rating);
        if (data.user_review) {
          setReviewText(data.user_review.text);
          setReviewScore(data.user_review.rating);
        }
      })
      .catch(console.error);
  }, [id]);

  const handleSubmitReview = () => {
    if (!anime || reviewScore === null || !reviewText.trim()) {
      alert("Please provide both a rating and review text.");
      return;
    }

    setIsSubmitting(true);

    fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        anime_id: anime.id,
        rating: reviewScore,
        text: reviewText.trim()
      })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      return fetch(`/api/reviews/${anime.id}`)
        .then(res => res.json())
        .then(data => {
          setAllReviews(data.reviews);
          setAverageRating(data.average_rating);
          if (data.user_review) {
            setReviewText(data.user_review.text);
            setReviewScore(data.user_review.rating);
          }
        });
    })
    .catch(err => {
      console.error("Review submission failed:", err);
      alert("Failed to submit review.");
    })
    .then(() => setIsSubmitting(false));
  };

  const handleReportReview = (reviewId: number) => {
    fetch('/api/report/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ review_id: reviewId })
    })
    .then(res => res.json())
    .then(data => alert(data.message || data.error))
    .catch(err => {
      console.error("Failed to report review:", err);
      alert("Could not report review.");
    });
  };

  const sortedReviews = [...allReviews].sort((a, b) => {
    if (sortType === 'popular') {
      return (b.likes - b.dislikes) - (a.likes - a.dislikes);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const paginated = sortedReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  if (!anime) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <img src={anime.image_url} alt={anime.title} className="w-60 h-auto rounded-xl shadow" />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{anime.title}</h1>
          <p className="text-gray-600">{anime.type} | {anime.status} | {anime.year}</p>
          <p className="text-sm text-gray-800"><strong>Average Score:</strong> {averageRating ?? 'N/A'}</p>
          <p className="text-sm text-gray-800"><strong>Episodes:</strong> {anime.episodes ?? 'Unknown'}</p>
          {anime.genres && <p><strong>Genres:</strong> {anime.genres}</p>}
          {anime.studios && <p><strong>Studios:</strong> {anime.studios}</p>}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Synopsis</h2>
        <p className="text-gray-700 whitespace-pre-line mt-2">{anime.synopsis || "No synopsis available."}</p>
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-2">Your Review</h3>
        <textarea
          className="w-full border rounded p-2"
          placeholder="Write your review here..."
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
        />
        <div className="mt-2">
          <label className="block mb-1 font-medium text-gray-700">Your Score:</label>
          <select
            className="px-2 py-1 border rounded"
            value={reviewScore ?? ""}
            onChange={e => setReviewScore(Number(e.target.value))}
          >
            <option value="" disabled>Select your rating</option>
            {[...Array(10)].map((_, i) => (
              <option key={i} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        <button
          className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center"
          onClick={handleSubmitReview}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            allReviews.some(r => r.user === currentUser) ? "Update Review" : "Submit Review"
          )}
        </button>
      </div>

      <div className="mt-10">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold">All Reviews</h3>
          <select
            className="px-2 py-1 border rounded text-sm"
            value={sortType}
            onChange={(e) => setSortType(e.target.value as 'recent' | 'popular')}
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Liked</option>
          </select>
        </div>
        {paginated.length === 0 ? (
          <p className="text-gray-600">No reviews yet. Be the first to write one!</p>
        ) : (
          paginated.map((review) => (
            <div key={review.id} className="mb-4">
              <ReviewCard
                id={review.id}
                text={review.text}
                user={review.user}
                anime_title={anime.title}
                likes={review.likes}
                dislikes={review.dislikes}
                currentUser={currentUser}
                created_at={review.created_at}
              />
              <button
                onClick={() => handleReportReview(review.id)}
                className="text-red-500 text-sm mt-1 hover:underline"
              >
                Report Review
              </button>
            </div>
          ))
        )}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
