import Link from "next/link";

export default function NotFound() {
  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",fontFamily:"sans-serif",textAlign:"center",padding:24}}>
    <div><h1>Page not found</h1><p>The page you're looking for doesn't exist yet.</p><Link href="/">← Back to TaskVibe</Link></div>
  </main>;
}
