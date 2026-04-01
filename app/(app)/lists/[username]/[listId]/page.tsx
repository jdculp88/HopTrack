import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { StarRating } from "@/components/ui/StarRating";
import { AddToListButton } from "@/components/beer/AddToListButton";
import { BookMarked, Lock, ArrowLeft, Edit2 } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ username: string; listId: string }> }) {
  const { listId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("beer_lists").select("title").eq("id", listId).single();
  return { title: data?.title ?? "Beer List" };
}

export default async function BeerListPage({
  params,
}: {
  params: Promise<{ username: string; listId: string }>;
}) {
  const { username, listId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the list
  const { data: list } = await supabase
    .from("beer_lists")
    .select(
      "id, title, description, is_public, user_id, created_at, items:beer_list_items(id, beer_id, position, note, beer:beers(id, name, style, abv, avg_rating, brewery:breweries(name))), profile:profiles!user_id(id, username, display_name, avatar_url)"
    )
    .eq("id", listId)
    .single() as any;

  if (!list) notFound();

  const isOwner = user?.id === list.user_id;

  // Private lists only viewable by owner
  if (!list.is_public && !isOwner) notFound();

  // Verify the username matches
  if (list.profile?.username !== username) notFound();

  const items = (list.items ?? []).sort((a: any, b: any) => a.position - b.position);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back link */}
      <Link
        href={`/profile/${username}`}
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={14} />
        {isOwner ? "Back to your profile" : `Back to @${username}`}
      </Link>

      {/* Profile + list header */}
      <div
        className="rounded-2xl p-5 mb-6 flex items-start gap-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <Link href={`/profile/${username}`}>
          <UserAvatar
            profile={{
              display_name: list.profile?.display_name ?? null,
              avatar_url: list.profile?.avatar_url ?? null,
              username,
            }}
            size="md"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1
                className="font-display font-bold text-2xl leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {list.title}
              </h1>
              <Link
                href={`/profile/${username}`}
                className="text-sm hover:underline mt-0.5 inline-block"
                style={{ color: "var(--accent-gold)" }}
              >
                @{username}
              </Link>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!list.is_public && (
                <span
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                  style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                >
                  <Lock size={10} />
                  Private
                </span>
              )}
              {isOwner && (
                <Link
                  href={`/beer-lists/${listId}`}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl transition-colors"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Edit2 size={11} />
                  Edit
                </Link>
              )}
            </div>
          </div>

          {list.description && (
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
              {list.description}
            </p>
          )}

          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            {items.length} {items.length === 1 ? "beer" : "beers"}
          </p>
        </div>
      </div>

      {/* Beer items */}
      {items.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <BookMarked size={32} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>
            No beers on this list yet
          </p>
          {isOwner && (
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Add beers from any brewery or beer page.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any, idx: number) => {
            const beer = item.beer;
            if (!beer) return null;
            return (
              <div
                key={item.id}
                className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <span
                  className="text-lg font-bold font-mono flex-shrink-0 w-7 text-center"
                  style={{ color: "var(--accent-gold)" }}
                >
                  {idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/beer/${beer.id}`}
                    className="font-semibold hover:underline underline-offset-2 transition-colors text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {beer.name}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    {beer.style && (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {beer.style}
                      </span>
                    )}
                    {beer.brewery?.name && (
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        · {beer.brewery.name}
                      </span>
                    )}
                    {beer.abv != null && (
                      <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                        {beer.abv}%
                      </span>
                    )}
                  </div>
                  {beer.avg_rating != null && (
                    <div className="mt-1.5">
                      <StarRating value={Math.round(beer.avg_rating)} readonly size="sm" />
                    </div>
                  )}
                  {item.note && (
                    <p className="text-xs mt-2 italic" style={{ color: "var(--text-secondary)" }}>
                      &ldquo;{item.note}&rdquo;
                    </p>
                  )}
                </div>

                {/* Add to my list (if authenticated and not owner) */}
                {user && !isOwner && (
                  <div className="flex-shrink-0">
                    <AddToListButton beerId={beer.id} userId={user.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* OG metadata hint for sharing */}
      <p className="text-center text-xs mt-8" style={{ color: "var(--text-muted)" }}>
        Share: /lists/{username}/{listId}
      </p>
    </div>
  );
}
