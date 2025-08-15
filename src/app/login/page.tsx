
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Link href="/api/auth" style={{ padding: '10px 20px', backgroundColor: '#4285F4', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
        Sign in with Google
      </Link>
    </div>
  );
}
