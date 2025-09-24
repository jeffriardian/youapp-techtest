// frontend/app/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function RootRedirect() {
  const cookieStore = cookies();
  const jwt = cookieStore.get('jwt');

  if (jwt?.value) {
    redirect('/initial');
  } else {
    redirect('/auth/login');
  }

  return null; // ga bakal pernah render
}
