export default {
  async fetch(req, env) {
    if (req.method !== "POST") {
      return new Response("POST only", { status: 405 });
    }

    const url = new URL(req.url);
    const data = await req.json();

    /* ───────── Anime ───────── */
    if (url.pathname === "/anime") {
      await env.DB.prepare(`
        INSERT OR REPLACE INTO anime
        (id, slug, name, type, total_episodes, downloaded_episodes, last_episode, status, base_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        data.id,
        data.slug,
        data.name,
        data.type,
        data.total_episodes,
        data.downloaded_episodes,
        data.last_episode,
        data.status,
        data.base_path
      ).run();

      return new Response("anime ok");
    }

    /* ───────── Episode ───────── */
    if (url.pathname === "/episode") {
      await env.DB.prepare(`
        INSERT OR REPLACE INTO episodes
        (episode_id, anime_id, episode_number, title, category, status, file_path, error_reason, retry_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        data.episode_id,
        data.anime_id,
        data.episode_number,
        data.title,
        data.category,
        data.status,
        data.file_path,
        data.error_reason,
        data.retry_count
      ).run();

      return new Response("episode ok");
    }

    /* ───────── Failure ───────── */
    if (url.pathname === "/failure") {
      await env.DB.prepare(`
        INSERT INTO failures
        (anime_id, episode_id, category, http_code, reason, attempt)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        data.anime_id,
        data.episode_id,
        data.category,
        data.http_code,
        data.reason,
        data.attempt
      ).run();

      return new Response("failure logged");
    }

    return new Response("not found", { status: 404 });
  }
};
