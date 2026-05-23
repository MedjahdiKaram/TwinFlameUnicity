-- ============================================================
-- TwinFlameUnicity — Schéma Supabase complet
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- TYPES ENUM
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'user', 'visitor');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'disabled');
CREATE TYPE user_gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE article_language AS ENUM ('fr', 'ar');

-- ============================================================
-- TABLE: profiles (extends auth.users)
-- ============================================================

CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  first_name    TEXT,
  last_name     TEXT,
  pseudo        TEXT UNIQUE,
  gender        user_gender DEFAULT 'prefer_not_to_say',
  bio           TEXT,
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'user',
  status        user_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Trigger: updated_at auto-update
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'),
    CASE
      WHEN NEW.email = 'kar.giga@gmail.com' THEN 'active'::user_status
      ELSE 'pending'::user_status
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLE: categories
-- ============================================================

CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_fr     TEXT NOT NULL,
  name_ar     TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description_fr TEXT,
  description_ar TEXT,
  color       TEXT DEFAULT '#9333ea',
  icon        TEXT,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Default category
INSERT INTO public.categories (name_fr, name_ar, slug, description_fr, description_ar, is_default, sort_order)
VALUES (
  'Non classé', 'غير مصنف', 'non-classe',
  'Articles sans catégorie spécifique', 'مقالات بدون فئة محددة',
  TRUE, 0
);

-- ============================================================
-- TABLE: tags
-- ============================================================

CREATE TABLE public.tags (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_fr    TEXT NOT NULL,
  name_ar    TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: articles
-- ============================================================

CREATE TABLE public.articles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT NOT NULL UNIQUE,
  language        article_language NOT NULL DEFAULT 'fr',
  title           TEXT NOT NULL,
  excerpt         TEXT,
  content         TEXT NOT NULL DEFAULT '',   -- HTML output from TipTap
  cover_url       TEXT,
  cover_alt       TEXT,
  status          article_status NOT NULL DEFAULT 'draft',
  is_premium      BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  reading_time    INTEGER DEFAULT 5,          -- minutes
  views           INTEGER NOT NULL DEFAULT 0,
  likes           INTEGER NOT NULL DEFAULT 0,
  author_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  meta_title      TEXT,
  meta_description TEXT,
  og_image        TEXT,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-set published_at when status changes to published
CREATE OR REPLACE FUNCTION public.handle_article_publish()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_publish_date
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.handle_article_publish();

-- Full-text search index
CREATE INDEX articles_search_idx ON public.articles
  USING gin(to_tsvector('french', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, '')));

CREATE INDEX articles_slug_idx ON public.articles(slug);
CREATE INDEX articles_status_idx ON public.articles(status);
CREATE INDEX articles_language_idx ON public.articles(language);
CREATE INDEX articles_author_idx ON public.articles(author_id);
CREATE INDEX articles_category_idx ON public.articles(category_id);
CREATE INDEX articles_published_at_idx ON public.articles(published_at DESC);

-- ============================================================
-- TABLE: article_tags (junction)
-- ============================================================

CREATE TABLE public.article_tags (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: article_images (gallery)
-- ============================================================

CREATE TABLE public.article_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id  UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.article_images ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: comments
-- ============================================================

CREATE TABLE public.comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id  UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX comments_article_idx ON public.comments(article_id);
CREATE INDEX comments_user_idx ON public.comments(user_id);

-- ============================================================
-- TABLE: article_likes
-- ============================================================

CREATE TABLE public.article_likes (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (article_id, user_id)
);

ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;

-- Trigger: update likes count on articles
CREATE OR REPLACE FUNCTION public.handle_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.articles SET likes = likes + 1 WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.articles SET likes = likes - 1 WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER article_likes_count
  AFTER INSERT OR DELETE ON public.article_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_likes_count();

-- ============================================================
-- TABLE: media (fichiers Supabase Storage)
-- ============================================================

CREATE TABLE public.media (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename    TEXT NOT NULL,
  url         TEXT NOT NULL,
  bucket      TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type   TEXT,
  size        BIGINT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- PROFILES
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- CATEGORIES
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can manage categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- TAGS
CREATE POLICY "Tags are viewable by everyone"
  ON public.tags FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can manage tags"
  ON public.tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ARTICLES
CREATE POLICY "Published non-premium articles visible to all"
  ON public.articles FOR SELECT
  USING (status = 'published' AND is_premium = FALSE);

CREATE POLICY "Published premium articles visible to active users"
  ON public.articles FOR SELECT
  USING (
    status = 'published' AND is_premium = TRUE AND (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Authors can view own articles"
  ON public.articles FOR SELECT
  USING (author_id = auth.uid());

CREATE POLICY "Admins can view all articles"
  ON public.articles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert articles"
  ON public.articles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update articles"
  ON public.articles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete articles"
  ON public.articles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ARTICLE_TAGS
CREATE POLICY "Article tags viewable by everyone"
  ON public.article_tags FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage article tags"
  ON public.article_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- COMMENTS
CREATE POLICY "Approved comments visible to everyone"
  ON public.comments FOR SELECT
  USING (is_approved = TRUE);

CREATE POLICY "Users can see own comments"
  ON public.comments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Active users can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all comments"
  ON public.comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ARTICLE_LIKES
CREATE POLICY "Likes viewable by everyone"
  ON public.article_likes FOR SELECT USING (TRUE);

CREATE POLICY "Active users can like articles"
  ON public.article_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can unlike their own likes"
  ON public.article_likes FOR DELETE
  USING (auth.uid() = user_id);

-- MEDIA
CREATE POLICY "Media viewable by everyone"
  ON public.media FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage media"
  ON public.media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ARTICLE_IMAGES
CREATE POLICY "Article images viewable by everyone"
  ON public.article_images FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage article images"
  ON public.article_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('articles', 'articles', TRUE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']),
  ('avatars', 'avatars', TRUE, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('covers', 'covers', TRUE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view articles bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'articles');

CREATE POLICY "Admins can upload to articles bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'articles' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete from articles bucket"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'articles' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

CREATE POLICY "Admins can manage covers"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'covers' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- FONCTIONS UTILES
-- ============================================================

-- Incrémenter les vues d'un article
CREATE OR REPLACE FUNCTION public.increment_article_views(article_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.articles
  SET views = views + 1
  WHERE slug = article_slug AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recherche plein texte articles
CREATE OR REPLACE FUNCTION public.search_articles(
  search_query TEXT,
  lang article_language DEFAULT 'fr',
  limit_count INT DEFAULT 10,
  offset_count INT DEFAULT 0
)
RETURNS TABLE (
  id UUID, slug TEXT, title TEXT, excerpt TEXT, cover_url TEXT,
  published_at TIMESTAMPTZ, reading_time INT, views INT,
  category_id UUID, is_premium BOOLEAN, language article_language,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id, a.slug, a.title, a.excerpt, a.cover_url,
    a.published_at, a.reading_time, a.views,
    a.category_id, a.is_premium, a.language,
    ts_rank(
      to_tsvector('french', coalesce(a.title,'') || ' ' || coalesce(a.excerpt,'') || ' ' || coalesce(a.content,'')),
      plainto_tsquery('french', search_query)
    ) as rank
  FROM public.articles a
  WHERE
    a.status = 'published' AND
    a.language = lang AND
    to_tsvector('french', coalesce(a.title,'') || ' ' || coalesce(a.excerpt,'') || ' ' || coalesce(a.content,'')) @@
    plainto_tsquery('french', search_query)
  ORDER BY rank DESC, a.published_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SEED: Admin par défaut
-- ============================================================
-- NOTE: L'admin est créé via Supabase Auth UI ou via l'API Auth.
-- Après création du compte kar.giga@gmail.com, ce trigger
-- l'assignera automatiquement comme 'active' avec le rôle 'admin'.

-- Pour forcer le rôle admin sur un compte existant :
-- UPDATE public.profiles
-- SET role = 'admin', status = 'active'
-- WHERE email = 'kar.giga@gmail.com';

-- ============================================================
-- SEED: Catégories initiales
-- ============================================================

INSERT INTO public.categories (name_fr, name_ar, slug, description_fr, description_ar, color, sort_order)
VALUES
  ('Éveil Intérieur', 'الصحوة الداخلية', 'eveil-interieur',
   'Développement personnel et éveil de la conscience', 'التطوير الشخصي وصحوة الوعي',
   '#9333ea', 1),
  ('Harmonie du Couple', 'توافق الزوجين', 'harmonie-couple',
   'Relations amoureuses, connexion et harmonie', 'العلاقات العاطفية والتواصل والتناسق',
   '#ec4899', 2),
  ('Éveil de la Conscience', 'صحوة الوعي', 'eveil-conscience',
   'Spiritualité, méditation et expansion de conscience', 'الروحانية والتأمل وتوسع الوعي',
   '#8b5cf6', 3),
  ('Guidance Spirituelle', 'التوجيه الروحي', 'guidance-spirituelle',
   'Guidance, intuition et messages de l''âme', 'التوجيه والحدس ورسائل الروح',
   '#6366f1', 4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED: Tags initiaux
-- ============================================================

INSERT INTO public.tags (name_fr, name_ar, slug)
VALUES
  ('Flamme Jumelle', 'اللهب التوأم', 'flamme-jumelle'),
  ('Âme Sœur', 'توأم الروح', 'ame-soeur'),
  ('Méditation', 'التأمل', 'meditation'),
  ('Éveil', 'الصحوة', 'eveil'),
  ('Guérison', 'الشفاء', 'guerison'),
  ('Loi de l''Attraction', 'قانون الجذب', 'loi-attraction'),
  ('Chakras', 'شاكرا', 'chakras'),
  ('Spiritualité', 'الروحانية', 'spiritualite'),
  ('Synchronicités', 'التزامنات', 'synchronicites'),
  ('Conscience', 'الوعي', 'conscience')
ON CONFLICT (slug) DO NOTHING;
