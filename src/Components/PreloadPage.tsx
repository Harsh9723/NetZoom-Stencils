import { useState, useEffect } from 'react';
import useTheme from './Theme';
import data from '../Link.json';


function PreloadPage() {
  const [bgSizeClass, setBgSizeClass] = useState('bg-size-contain');
  const [fontSizeClass, setFontSizeClass] = useState('font-size-25'); 

  const Color = `${data.colortheme.split(',')[0]}80`;

  const handleclick = () => {
    window.open(data.logourl, '_blank');
  };

  useTheme(data.colortheme);

  useEffect(() => {
    const updateStyles = () => {
      const width = window.innerWidth;

      if (width < 600) {
        setBgSizeClass('bg-size-100');
        setFontSizeClass('font-size-20');
      } else if (width < 900) {
        setBgSizeClass('bg-size-90');
        setFontSizeClass('font-size-30');
      } else {
        setBgSizeClass('bg-size-100');
        setFontSizeClass('font-size-35');
      }
    };

    updateStyles();

    window.addEventListener('resize', updateStyles);

    return () => {
      window.removeEventListener('resize', updateStyles);
    };
  }, []);

  return (
    <div
      className={`preload-container ${bgSizeClass}`}
      style={{
        backgroundImage: `url(${data.backdrop})`,
        backgroundColor: 'var(--bg-color)',
      }}
    >
      <div
        className="overlay"
        style={{
          backgroundColor: Color,
        }}
      ></div>

      <div className="logo" onClick={handleclick}>
        <img src={data.logoicon} alt={data.logoalt} />
      </div>

      <div className="title">
        <h1 className={fontSizeClass}>Add-In for Stencils</h1>
      </div>
    </div>
  );
}

export default PreloadPage;
