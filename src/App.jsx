import React, { useEffect, useRef, useState } from 'react';
import cloud from 'd3-cloud';

export default function App() {
  const canvasRef = useRef(null);
  const [url, setUrl] = useState('');
  const [words, setWords] = useState([]);

  useEffect(() => {
    if (!words.length) return;

    const layout = cloud()
      .size([600, 400])
      .words(words.map(d => ({ text: d.text, size: 10 + d.value * 1.5 }))) // boost size
      .padding(2) // reduce spacing
      .rotate(() => 0) // keep horizontal
      .font('Impact')
      .fontSize(d => d.size)
      .on('end', draw);
    layout.start();

    function draw(words) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 600, 400);

      // Fill background
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(0, 0, 600, 400);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#6366f1'];

      words.forEach((word, index) => {
        ctx.save();
        ctx.translate(word.x + 300, word.y + 200);
        ctx.rotate(word.rotate * Math.PI / 180);
        ctx.font = `bold ${word.size}px Impact`;
        ctx.fillStyle = colors[index % colors.length];
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 2;
        ctx.fillText(word.text, 0, 0);
        ctx.restore();
      });
    }
  }, [words]);

  function extractVideoId(url) {
    const match = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : null;
  }

  async function handleGenerate() {
    const videoId = extractVideoId(url);
    if (!videoId) {
      alert('Invalid YouTube URL');
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/comments?videoId=${videoId}`);
      if (!res.ok) throw new Error('Failed to fetch comment data');
      const data = await res.json();
      setWords(data);
    } catch (err) {
      console.error(err);
      alert('Error fetching comments. Please try again.');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 p-6 font-sans">
      <div className="text-center mb-8 mt-2 px-6 py-8 bg-white rounded-md shadow border border-gray-200 w-full max-w-2xl">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 via-rose-600 to-red-700 text-transparent bg-clip-text">
          <span className="mr-2">💬</span>YouTube Comment Cloud
        </h1>
        <p className="text-md text-gray-600 max-w-xl mx-auto mt-2">
          Explore viewer sentiment through dynamic word clouds.
        </p>
      </div>
      <div className="w-full max-w-xl flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-md flex-grow shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          onClick={handleGenerate}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md shadow"
        >
          Generate
        </button>
      </div>
      <div className="mt-10 bg-white rounded-lg shadow-md p-4">
        <canvas ref={canvasRef} width={600} height={400} className="border rounded" />
      </div>
      <footer className="w-full mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
        <div className="flex justify-center gap-6 mb-2">
          <a href="https://renaissancecarr.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-600">Portfolio</a>
          <a href="https://www.linkedin.com/in/renaissancejlc" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">LinkedIn</a>
          <a href="https://github.com/renaissancejlc" target="_blank" rel="noopener noreferrer" className="hover:text-black">GitHub</a>
          <a href="https://www.instagram.com/renaissancejlc" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500">Instagram</a>
        </div>
        <p>&copy; {new Date().getFullYear()} Youtube Comment Cloud. All rights reserved.</p>
      </footer>
    </div>
  );
}
