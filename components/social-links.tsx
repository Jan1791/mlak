const brandSearch = encodeURIComponent("Maison Lydia AK");
const whatsapp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "243985986202").replace(/\D/g, "");

function Mark({ name }: { name: "facebook" | "instagram" | "tiktok" | "youtube" | "whatsapp" | "phone" }) {
  if (name === "facebook") return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.6 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v1.9H7v3.1h2.9v8z" /></svg>;
  if (name === "instagram") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" /></svg>;
  if (name === "tiktok") return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.6 7.1a6.7 6.7 0 0 1-4.1-1.4v8.1a6.1 6.1 0 1 1-5.3-6V12a2.6 2.6 0 1 0 1.8 2.5V2.5h3.5c.2 2.3 1.8 4.2 4.1 4.7z" /></svg>;
  if (name === "youtube") return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23 7.1a3 3 0 0 0-2.1-2.2C19 4.4 12 4.4 12 4.4s-7 0-8.9.5A3 3 0 0 0 1 7.1 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.9 3 3 0 0 0 2.1 2.2c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.2 31 31 0 0 0 .5-4.9 31 31 0 0 0-.5-4.9" /><path fill="#fff" d="m9.6 15.5 5.8-3.5-5.8-3.5z" /></svg>;
  if (name === "whatsapp") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.3 11.7a8.2 8.2 0 0 1-12.1 7.2L3 20l1.2-5a8.2 8.2 0 1 1 16.1-3.3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M8.4 8.1c.3-.7.6-.7.9-.7h.6c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.2.2-.2.4 0 .6.5.9 1.2 1.6 2.1 2.1.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.2.1.4.3.4.5 0 .3-.2 1-.7 1.4-.4.4-1 .6-1.5.6-.4 0-1-.1-1.8-.5-1-.4-2.2-1.1-3.4-2.4-1-1.1-1.7-2.3-1.9-3.2-.2-.8 0-1.2.2-1.5Z" fill="currentColor" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function SocialLinks({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`social-links ${compact ? "social-links-compact" : ""}`} aria-label="Réseaux sociaux et contact">
      <a href={process.env.NEXT_PUBLIC_FACEBOOK_URL || `https://www.facebook.com/search/top?q=${brandSearch}`} target="_blank" rel="noreferrer" aria-label="Facebook — rechercher Maison Lydia AK" title="Facebook"><Mark name="facebook" /></a>
      <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || `https://www.instagram.com/explore/search/keyword/?q=${brandSearch}`} target="_blank" rel="noreferrer" aria-label="Instagram — rechercher Maison Lydia AK" title="Instagram"><Mark name="instagram" /></a>
      <a href={process.env.NEXT_PUBLIC_TIKTOK_URL || `https://www.tiktok.com/search?q=${brandSearch}`} target="_blank" rel="noreferrer" aria-label="TikTok — rechercher Maison Lydia AK" title="TikTok"><Mark name="tiktok" /></a>
      <a href={process.env.NEXT_PUBLIC_YOUTUBE_URL || `https://www.youtube.com/results?search_query=${brandSearch}`} target="_blank" rel="noreferrer" aria-label="YouTube — rechercher Maison Lydia AK" title="YouTube"><Mark name="youtube" /></a>
      <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="Écrire à Maison Lydia AK sur WhatsApp" title="WhatsApp"><Mark name="whatsapp" /></a>
      <a href={`tel:+${whatsapp}`} aria-label={`Appeler le +${whatsapp}`} title="Appeler"><Mark name="phone" /></a>
    </div>
  );
}
