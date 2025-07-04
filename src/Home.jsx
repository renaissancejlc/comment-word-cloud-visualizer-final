import React, { useEffect, useRef, useState } from 'react';
import cloud from 'd3-cloud';
import { Link } from 'react-router-dom';
import { Globe, Linkedin, Github, Instagram, Info as InfoIcon } from 'lucide-react';

export default function Home() {
  const canvasRef = useRef(null);
  const [url, setUrl] = useState('');
  const [words, setWords] = useState([]);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    if (!words.length) return;

    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const baseSize = Math.min(width, height) / 20;

    const layout = cloud()
      .size([800, 600])
      .words(words.map(d => ({
        text: d.text,
        size: baseSize + d.value * 3
      })))
      .padding(2) // reduce spacing
      .rotate(() => 0) // keep horizontal
      .font('Impact')
      .fontSize(d => d.size)
      .on('end', draw);
    layout.start();

    function draw(words) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Fill background
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const colors = ['#000000', '#111111', '#FF0000', '#B91C1C', '#333333'];

      words.forEach((word, index) => {
        ctx.save();
        ctx.translate(word.x + width / 2, word.y + height / 2);
        ctx.rotate(word.rotate * Math.PI / 180);
        ctx.font = `bold ${word.size}px Impact`;
        ctx.fillStyle = colors[index % colors.length];
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 2;
        ctx.fillText(word.text, 0, 0);
        ctx.restore();
      });
      setShowDownload(true);
    }
  }, [words]);

  function extractVideoId(url) {
    const match = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : null;
  }

  async function handleGenerate() {
    setShowDownload(false);
    const videoId = extractVideoId(url);
    if (!videoId) {
      alert('Invalid YouTube URL');
      return;
    }

    try {
      const res = await fetch(`https://youtube-comment-wordcloud-backend.onrender.com/api/comments?videoId=${videoId}`);
      if (!res.ok) throw new Error('Failed to fetch comment data');
      const data = await res.json();
      setWords(data);
    } catch (err) {
      console.error(err);
      alert('Error fetching comments. Please try again.');
    }
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'comment-cloud.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 text-gray-900 p-6 font-sans">
      <div className="w-full text-center py-8 border-b-4 border-black mb-8">
        <h1 className="text-7xl font-extrabold uppercase tracking-tight leading-tight text-black">
          <span className="bg-red-600 text-white px-2 italic">YouTube</span> Comment Cloud
        </h1>
        <p className="text-xs uppercase tracking-widest text-gray-700 mt-4">
          Visualize viewer sentiment with bold, uncompromising type
        </p>
      </div>
      <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4 mt-8 py-6 border-y-4 border-black shadow-lg">
        <input
          type="text"
          placeholder="PASTE YOUTUBE VIDEO URL…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleGenerate();
            }
          }}
          className="flex-grow text-lg bg-transparent border-2 border-black focus:outline-none focus:border-red-600 px-4 py-2 placeholder-black font-mono tracking-wide uppercase"
        />
        <button
          onClick={handleGenerate}
          className="bg-black text-white px-6 py-3 text-lg font-extrabold uppercase tracking-widest hover:bg-white hover:text-black border-2 border-black transition-colors duration-200"
        >
          Generate
        </button>
      </div>
      <div className="mt-12 w-full max-w-5xl p-6 border-4 border-black bg-white/20 backdrop-blur-md shadow-2xl">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-2 border-black w-full h-auto bg-white"
        />
        {showDownload && (
          <button
            onClick={handleDownload}
            className="mt-6 w-full bg-black text-white py-3 text-lg font-bold uppercase tracking-widest hover:bg-white hover:text-black border-2 border-black transition-colors"
          >
            Download PNG
          </button>
        )}
      </div>
     <footer className="w-full mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
       <div className="flex justify-center gap-6 mb-2">
         <a href="https://renaissancecarr.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 text-2xl"><Globe /></a>
         <a href="https://www.linkedin.com/in/renaissancejlc" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 text-2xl"><Linkedin /></a>
         <a href="https://github.com/renaissancejlc" target="_blank" rel="noopener noreferrer" className="hover:text-black text-2xl"><Github /></a>
         <Link to="/info" className="hover:text-green-600 text-2xl"><InfoIcon /></Link>
         <a href="https://www.instagram.com/renaissancejlc" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 text-2xl"><Instagram /></a>
       </div>
       <p>&copy; {new Date().getFullYear()} Youtube Comment Cloud. All rights reserved.</p>
     </footer>
    </div>
  );
}
