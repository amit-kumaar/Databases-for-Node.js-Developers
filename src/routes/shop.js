export default async function (fastify) {
  // Route to display all items with pagination
  fastify.get("/:tag?", async (request, reply) => {
    const { page = 1, limit = 10, q } = request.query;
    const { tag } = request.params;

    const query = {};
    if (tag) {
      query.tags = tag;
    }
    if (q) {
      query.$text = { $search: q };
    }

    const allItems = await fastify.Item.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Try to get tags from Redis cache first
    let tags;
    const cacheKey = "simpleshop:tags";
    const cachedTags = await fastify.redis.get(cacheKey);
    if (cachedTags) {
      tags = JSON.parse(cachedTags);
    } else {
      tags = await fastify.Item.distinct("tags");
      await fastify.redis.set(cacheKey, JSON.stringify(tags), "EX", 3600);
    }

    const totalPages = Math.ceil(
      (await fastify.Item.countDocuments(query)) / limit
    );

    // Render the shop view with paginated items and tags
    return reply.view("shop.ejs", {
      title: "Shop",
      currentPath: "/shop",
      items: allItems,
      tags,
      currentPage: parseInt(page, 10),
      totalPages,
      currentTag: tag || null
    });
  });
}
