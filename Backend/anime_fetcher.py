import requests
import time
from Backend.models import db, Anime

def fetch_and_store_anime(pages=1, delay=1):
    for page in range(1, pages + 1):
        print(f"Fetching page {page}...")
        try:
            response = requests.get(f"https://api.jikan.moe/v4/anime?page={page}")
            response.raise_for_status()
            data = response.json()

            new_anime_count = 0
            for item in data.get("data", []):
                mal_id = item["mal_id"]
                if Anime.query.filter_by(mal_id=mal_id).first():
                    continue

                anime = Anime(
                    mal_id=mal_id,
                    title=item["title"],
                    image_url=item["images"]["jpg"].get("image_url"),
                    synopsis=item.get("synopsis"),
                    score=item.get("score"),
                    episodes=item.get("episodes"),
                    status=item.get("status"),
                    year=item.get("year"),
                    genres=", ".join([g["name"] for g in item.get("genres", [])]),
                    studios=", ".join([s["name"] for s in item.get("studios", [])]),
                    duration=item.get("duration"),
                    type=item.get("type"),
                    popularity=item.get("popularity"),
                    favorites=item.get("favorites"),
                    members=item.get("members"),
                    source=item.get("source"),
                )


                db.session.add(anime)
                new_anime_count += 1

            db.session.commit()
            print(f"✅ Page {page} complete — {new_anime_count} new entries added.")
            time.sleep(delay)

        except requests.exceptions.RequestException as e:
            print(f"Error fetching page {page}: {e}")
            break
        except Exception as db_error:
            print(f"❌ DB error: {db_error}")
            db.session.rollback()
