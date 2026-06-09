export async function searchWeb(query: string) {
  if (!process.env.TAVILY_API_KEY) return "";
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: "advanced",
        max_results: 6,
      }),
    });
    if (!response.ok) return "";
    const data = await response.json();
    return (data.results || [])
      .map((result: { title: string; content: string }) => `${result.title}: ${result.content}`)
      .join("\n\n");
  } catch {
    return "";
  }
}
