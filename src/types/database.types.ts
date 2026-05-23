// ============================================================
// Types TypeScript générés depuis le schéma Supabase
// Mettre à jour via: npm run db:generate-types
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'user' | 'visitor'
export type UserStatus = 'pending' | 'active' | 'disabled'
export type UserGender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
export type ArticleStatus = 'draft' | 'published' | 'archived'
export type ArticleLanguage = 'fr' | 'ar'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          pseudo: string | null
          gender: UserGender
          bio: string | null
          avatar_url: string | null
          role: UserRole
          status: UserStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          pseudo?: string | null
          gender?: UserGender
          bio?: string | null
          avatar_url?: string | null
          role?: UserRole
          status?: UserStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          pseudo?: string | null
          gender?: UserGender
          bio?: string | null
          avatar_url?: string | null
          role?: UserRole
          status?: UserStatus
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name_fr: string
          name_ar: string
          slug: string
          description_fr: string | null
          description_ar: string | null
          color: string
          icon: string | null
          is_default: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_fr: string
          name_ar: string
          slug: string
          description_fr?: string | null
          description_ar?: string | null
          color?: string
          icon?: string | null
          is_default?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name_fr?: string
          name_ar?: string
          slug?: string
          description_fr?: string | null
          description_ar?: string | null
          color?: string
          icon?: string | null
          is_default?: boolean
          sort_order?: number
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name_fr: string
          name_ar: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name_fr: string
          name_ar: string
          slug: string
          created_at?: string
        }
        Update: {
          name_fr?: string
          name_ar?: string
          slug?: string
        }
      }
      articles: {
        Row: {
          id: string
          slug: string
          language: ArticleLanguage
          title: string
          excerpt: string | null
          content: string
          cover_url: string | null
          cover_alt: string | null
          status: ArticleStatus
          is_premium: boolean
          is_featured: boolean
          reading_time: number
          views: number
          likes: number
          author_id: string
          category_id: string | null
          meta_title: string | null
          meta_description: string | null
          og_image: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          language?: ArticleLanguage
          title: string
          excerpt?: string | null
          content?: string
          cover_url?: string | null
          cover_alt?: string | null
          status?: ArticleStatus
          is_premium?: boolean
          is_featured?: boolean
          reading_time?: number
          views?: number
          likes?: number
          author_id: string
          category_id?: string | null
          meta_title?: string | null
          meta_description?: string | null
          og_image?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          language?: ArticleLanguage
          title?: string
          excerpt?: string | null
          content?: string
          cover_url?: string | null
          cover_alt?: string | null
          status?: ArticleStatus
          is_premium?: boolean
          is_featured?: boolean
          reading_time?: number
          views?: number
          likes?: number
          author_id?: string
          category_id?: string | null
          meta_title?: string | null
          meta_description?: string | null
          og_image?: string | null
          published_at?: string | null
          updated_at?: string
        }
      }
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
      }
      article_images: {
        Row: {
          id: string
          article_id: string
          url: string
          alt: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          article_id: string
          url: string
          alt?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          url?: string
          alt?: string | null
          sort_order?: number
        }
      }
      comments: {
        Row: {
          id: string
          article_id: string
          user_id: string
          parent_id: string | null
          content: string
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id: string
          parent_id?: string | null
          content: string
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          is_approved?: boolean
          updated_at?: string
        }
      }
      article_likes: {
        Row: {
          article_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          article_id: string
          user_id: string
          created_at?: string
        }
        Update: never
      }
      media: {
        Row: {
          id: string
          filename: string
          url: string
          bucket: string
          storage_path: string
          mime_type: string | null
          size: number | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          filename: string
          url: string
          bucket: string
          storage_path: string
          mime_type?: string | null
          size?: number | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          filename?: string
          url?: string
          bucket?: string
          storage_path?: string
          mime_type?: string | null
          size?: number | null
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_article_views: {
        Args: { article_slug: string }
        Returns: void
      }
      search_articles: {
        Args: {
          search_query: string
          lang?: ArticleLanguage
          limit_count?: number
          offset_count?: number
        }
        Returns: Array<{
          id: string
          slug: string
          title: string
          excerpt: string | null
          cover_url: string | null
          published_at: string | null
          reading_time: number
          views: number
          category_id: string | null
          is_premium: boolean
          language: ArticleLanguage
          rank: number
        }>
      }
    }
    Enums: {
      user_role: UserRole
      user_status: UserStatus
      user_gender: UserGender
      article_status: ArticleStatus
      article_language: ArticleLanguage
    }
  }
}

// ============================================================
// Helpers types
// ============================================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Derived types
export type Profile = Tables<'profiles'>
export type Category = Tables<'categories'>
export type Tag = Tables<'tags'>
export type Article = Tables<'articles'>
export type Comment = Tables<'comments'>
export type Media = Tables<'media'>

// Extended types with relations
export type ArticleWithRelations = Article & {
  author?: Profile
  category?: Category | null
  tags?: Tag[]
  images?: Tables<'article_images'>[]
}

export type CommentWithAuthor = Comment & {
  author?: Profile
  replies?: CommentWithAuthor[]
}

export type ArticleCard = Pick<
  Article,
  | 'id'
  | 'slug'
  | 'title'
  | 'excerpt'
  | 'cover_url'
  | 'cover_alt'
  | 'is_premium'
  | 'is_featured'
  | 'language'
  | 'reading_time'
  | 'views'
  | 'likes'
  | 'published_at'
  | 'category_id'
> & {
  category?: Pick<Category, 'id' | 'name_fr' | 'name_ar' | 'slug' | 'color'>
  tags?: Pick<Tag, 'id' | 'name_fr' | 'name_ar' | 'slug'>[]
  author?: Pick<Profile, 'id' | 'pseudo' | 'first_name' | 'last_name' | 'avatar_url'>
}
