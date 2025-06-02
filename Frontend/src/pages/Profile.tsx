import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../axiosConfig';

interface Anime {
  id: number;
  title: string;
  image_url: string;
}

interface ProfileData {
  username: string;
  bio?: string;
  collections: { [key: string]: Anime[] };
  ratings: { anime_title: string; score: number }[];
  reviews: { anime_title: string; rating: number; text: string; created_at: string }[];
  posts: { title: string; content: string; created_at: string }[];
}

interface ProfileProps {
  username?: string;
  profileData?: ProfileData;
  isFriendView?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ username: propUsername, profileData, isFriendView = false }) => {
  const routeParams = useParams<{ username: string }>();
  const username = propUsername || routeParams.username;

  const [profile, setProfile] = useState<ProfileData | null>(profileData || null);
  const [activeTab, setActiveTab] = useState<'collections' | 'ratings' | 'reviews' | 'posts'>('collections');
  const [reviewSort, setReviewSort] = useState<'newest' | 'highest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    if (!profile && username) {
      axios.get(`/api/profile/${username}`)
        .then(res => setProfile(res.data))
        .catch(err => {
          if (err.response?.status === 401) {
            window.location.href = '/login';
          } else {
            console.error("Error fetching profile:", err);
          }
        });
    }
  }, [username, profile]);

  if (!profile) return <div className="text-center mt-10">Loading profile...</div>;

  const sortedReviews = [...profile.reviews].sort((a, b) => {
    if (reviewSort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return b.rating - a.rating;
  });

  const paginatedReviews = sortedReviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage);
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 bg-white shadow rounded-xl">
      <h1 className="text-4xl font-bold mb-2">
        {profile.username}
        <span className="text-gray-500 text-lg ml-2">
          {isFriendView ? "'s Profile" : '(You)'}
        </span>
      </h1>
      <p className="text-sm text-gray-600 mb-6 italic">{profile.bio || 'This user has not added a bio yet.'}</p>

      <div className="flex space-x-4 mb-6">
        {['collections', 'ratings', 'reviews', 'posts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'collections' && (
          <motion.section
            key="collections"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {Object.entries(profile.collections).map(([key, list]) => (
              list.length > 0 && (
                <div key={key}>
                  <h3 className="capitalize font-semibold text-lg text-gray-700 mb-2">{key}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {list.map((anime) => (
                      <div
                        key={anime.id}
                        className="bg-gray-50 hover:bg-gray-100 p-2 rounded-lg shadow transition duration-200"
                      >
                        <img
                          src={anime.image_url}
                          alt={anime.title}
                          onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                          className="w-full h-48 object-cover rounded-md"
                        />
                        <p className="mt-2 text-sm font-medium">{anime.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </motion.section>
        )}

        {activeTab === 'ratings' && (
          <motion.section
            key="ratings"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {profile.ratings.length === 0 ? (
              <p className="text-gray-500 italic">No ratings yet.</p>
            ) : (
              <ul className="space-y-2">
                {profile.ratings.map((r, i) => (
                  <li key={i} className="text-gray-800">
                    <span className="font-semibold">{r.anime_title}</span>:
                    <span className="ml-2 inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      {r.score}/10
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.section>
        )}

        {activeTab === 'reviews' && (
          <motion.section
            key="reviews"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4">
              <label className="mr-2 font-medium">Sort by:</label>
              <select
                value={reviewSort}
                onChange={(e) => {
                  setReviewSort(e.target.value as typeof reviewSort);
                  setCurrentPage(1);
                }}
                className="border px-2 py-1 rounded"
              >
                <option value="newest">Newest</option>
                <option value="highest">Highest Rated</option>
              </select>
            </div>
            {sortedReviews.length === 0 ? (
              <p className="text-gray-500 italic">No reviews written yet.</p>
            ) : (
              <div className="space-y-4">
                {paginatedReviews.map((review, i) => (
                  <div key={i} className="bg-gray-50 border rounded-lg p-4 shadow-sm">
                    <p className="font-semibold text-gray-900">{review.anime_title}</p>
                    <p className="text-sm text-gray-600 italic">Rating: {review.rating}/10</p>
                    <p className="mt-1 text-gray-800">{review.text}</p>
                  </div>
                ))}
                <div className="flex justify-center space-x-2 mt-6">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        )}

        {activeTab === 'posts' && (
          <motion.section
            key="posts"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {profile.posts.length === 0 ? (
              <p className="text-gray-500 italic">No posts made yet.</p>
            ) : (
              <div className="space-y-4">
                {profile.posts.map((post, i) => (
                  <div key={i} className="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 className="font-bold text-lg">{post.title}</h3>
                    <p className="text-gray-700 text-sm mt-1">{post.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{post.created_at}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
