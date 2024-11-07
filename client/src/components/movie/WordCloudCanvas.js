import { useEffect } from 'react';
import { useRef } from 'react';
import Wordcloud from 'wordcloud';

function WordCloudCanvas({ wordCloud }) {
  const words = [];
  wordCloud.map(word => {
    words.push([word.word, word.value]);
  });

  const canvasRef = useRef(null);

  useEffect(() => {
    Wordcloud(canvasRef.current, {
      list: words,
      shape: 'circle',
      minRotation: 20,
      maxRotation: 90,
      shrinkToFit: true,
      minSize: 2,
      weightFactor: 5,
    });
  }, [words]);

  return (
    <canvas
      width="3000"
      height="400"
      style={{ width: '100%', height: '100%' }}
      ref={canvasRef}
    />
  );
}
export default WordCloudCanvas;
