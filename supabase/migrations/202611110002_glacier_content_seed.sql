-- Glacier content seed for the Supabase-backed website.
-- Safe to run once; existing records are preserved.

insert into public.site_pages(slug, seo_title, seo_description) values
  ('home', 'Glacier — Movies, Series & Discovery', 'Discover remarkable movies and series with Glacier.'),
  ('categories', 'Movies & Series — Glacier', 'Browse and search the Glacier collection.'),
  ('login', 'Sign in — Glacier', 'Sign in to your Glacier account.'),
  ('register', 'Create an account — Glacier', 'Create your Glacier account.'),
  ('admin', 'Admin — Glacier', 'Manage the Glacier website.')
on conflict (slug) do nothing;

insert into public.site_sections(page_slug, section_key, title, description, sort_order) values
  ('home', 'homeHero', 'Find a story worth staying for.', 'Discover remarkable movies and series, find your next favourite, and keep the stories you love close.', 0),
  ('home', 'recommendations', 'Recommended movies & series', 'A starting collection of memorable stories. Explore by format or search for a title or genre.', 1),
  ('home', 'account', 'A home for your discoveries', 'Create an account to get a more personal Glacier experience. You can explore the catalogue without signing in.', 2),
  ('home', 'about', 'Great stories deserve to be found, remembered, and shared.', 'Glacier is a calm, considered home for movie and series discovery — focused on the stories, not the noise.', 3),
  ('categories', 'categories', 'Explore the collection', 'Browse the Glacier catalogue and search by title, genre, or year.', 0)
on conflict (page_slug, section_key) do nothing;
