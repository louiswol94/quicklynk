import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UrlForm() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3003');

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setShortUrl(data.shortId);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
	axios.post('http://localhost:3001/shorten', { originalUrl: longUrl });
    setLongUrl('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter long URL"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
        />
        <button type="submit">Shorten</button>
      </form>
      {shortUrl && <p>Short URL: {shortUrl}</p>}
    </div>
  );
}

export default UrlForm;
