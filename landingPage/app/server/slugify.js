/**
 * Generate URL-friendly slug from text
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * Generate unique slug by appending number if needed
 */
export async function generateUniqueSlug(name, prisma, existingId = null) {
  let slug = slugify(name);
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const existing = await prisma.configuration.findUnique({
      where: { slug },
    });

    if (!existing || existing.id === existingId) {
      isUnique = true;
    } else {
      slug = `${slugify(name)}-${counter}`;
      counter++;
    }
  }

  return slug;
}
