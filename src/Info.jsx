import React, { useEffect, useRef, useState } from 'react';
import cloud from 'd3-cloud';
import { Link } from 'react-router-dom';
import { Globe, Linkedin, Github, Instagram, Info as InfoIcon } from 'lucide-react';

export default function Info() {
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

      const colors = ['#000000', '#111111', '#FF0000', '#B91C1C', '#F5F5F5'];

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
          <Link to="/" className="hover:text-red-600 transition-colors">
            <span className="bg-red-600 text-white px-2 italic">YouTube</span> <span>Comment Cloud</span>
          </Link>
        </h1>
        <p className="text-xs uppercase tracking-widest text-gray-700 mt-4">
          Visualize viewer sentiment with bold, uncompromising type
        </p>
      </div>
      <div className="max-w-3xl w-full mb-12">
        <h2 className="text-3xl font-bold mb-4 uppercase border-b-2 border-black pb-2">About Me</h2>
        <p className="mb-4">
          I'm a software engineer who loves building fun, useful, and open tools like this one. I freelance, create side projects, and enthusiastically welcome input, feedback, and feature suggestions.
        </p>
        <p className="mb-4">
          YouTube Comment Cloud exists to help users visualize viewer sentiment in a fun, interactive way. No paywalls, no hassle—just free and functional insight from YouTube audiences.
        </p>
        <h2 className="text-3xl font-bold mb-4 uppercase border-b-2 border-black pb-2">Support This Project</h2>
        <p>
          If you'd like to support my work or get in touch for freelance projects, please visit my website or connect with me on LinkedIn and GitHub using the links below.
        </p>
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
