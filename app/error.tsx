'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white bg-black">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <p className="mb-4 text-red-400">{error.message}</p>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
                Try again
            </button>
        </div>
    );
}
