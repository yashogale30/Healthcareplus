'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.push('/diseasePrediction/index.html');
  }, [router]);

  return (
    <div>
      <p>Redirecting to Disease Prediction...</p>
    </div>
  );
}
