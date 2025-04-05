'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, PlusIcon, StarIcon, ShareIcon, ArrowPathIcon, SpeakerWaveIcon, SpeakerXMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, DocumentDuplicateIcon, DocumentArrowDownIcon, CameraIcon } from '@heroicons/react/24/solid';
import dynamic from 'next/dynamic';
import useSound from 'use-sound';

// Client-side only imports
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });
const Wheel = dynamic(() => import('react-custom-roulette').then(mod => mod.Wheel), { ssr: false });

const predefinedCategories = [
  {
    id: 'evet-hayir',
    icon: '🤔',
    title: 'Evet/Hayır',
    items: ['✅ Evet', '❌ Hayır', '🤔 Belki', '👍 Kesinlikle Evet', '👎 Kesinlikle Hayır', '⏳ Daha Sonra']
  },
  {
    id: 'yemekler',
    icon: '🍽️',
    title: 'Yemekler',
    items: ['🍕 Pizza', '🍔 Burger', '🍜 Noodles', '🍣 Sushi', '🥗 Salad', '🌮 Taco', '🥘 Kebap', '🍝 Makarna', '🥪 Sandviç']
  },
  {
    id: 'sehirler',
    icon: '🏙️',
    title: 'Şehirler',
    items: ['🏛️ İstanbul', '🏖️ İzmir', '🏔️ Ankara', '🌅 Antalya', '🌊 Muğla', '🏰 Bursa', '⛰️ Trabzon', '🌇 Eskişehir', '🌆 Konya']
  },
  {
    id: 'sporlar',
    icon: '⚽',
    title: 'Sporlar',
    items: ['⚽ Futbol', '🏀 Basketbol', '🏐 Voleybol', '🎾 Tenis', '🏊‍♂️ Yüzme', '🏃‍♂️ Koşu', '🚴‍♂️ Bisiklet', '🏋️‍♂️ Fitness', '🎯 Dart']
  },
  {
    id: 'hobiler',
    icon: '🎨',
    title: 'Hobiler',
    items: ['📚 Kitap', '🎨 Resim', '🎮 Oyun', '🎸 Müzik', '📷 Fotoğraf', '🧘‍♂️ Yoga', '🌱 Bahçe', '✈️ Seyahat', '👨‍🍳 Yemek']
  },
  {
    id: 'filmler',
    icon: '🎬',
    title: 'Film Türleri',
    items: ['🎭 Drama', '😱 Korku', '🦸‍♂️ Aksiyon', '🤖 Bilim Kurgu', '😂 Komedi', '💕 Romantik', '🔍 Gizem', '🌍 Belgesel', '🦸‍♀️ Macera']
  },
  {
    id: 'muzik',
    icon: '🎵',
    title: 'Müzik',
    items: ['🎸 Rock', '🎹 Pop', '🎺 Jazz', '🎻 Klasik', '🎤 Hip Hop', '💃 Latin', '🪘 Folk', '🎼 Blues', '🎧 Elektronik']
  }
];

const defaultColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5'];

interface SpinHistoryItem {
  timestamp: string;
  winner: string;
}

export default function Home() {
  const [items, setItems] = useState<string[]>([
    '🍕 Pizza', '🍔 Burger', '🍜 Noodles', '🍣 Sushi', '🥗 Salad', '🌮 Taco'
  ]);
  const [newItem, setNewItem] = useState('');
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [customCategories, setCustomCategories] = useState<typeof predefinedCategories>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showSaveCategory, setShowSaveCategory] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [spinHistory, setSpinHistory] = useState<SpinHistoryItem[]>([]);
  const [spinSpeed, setSpinSpeed] = useState(1); // 1 = normal, 0.5 = yavaş, 2 = hızlı
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const wheelContainerRef = useRef<HTMLDivElement>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>(defaultColors);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [currentColorIndex, setCurrentColorIndex] = useState<number | null>(null);
  const [isSimpleMode, setIsSimpleMode] = useState(false);

  const [playSpinning, { stop: stopSpinning }] = typeof window !== 'undefined' ? useSound('/spinning.mp3', {
    loop: true,
    soundEnabled: isSoundEnabled
  }) : [() => {}, { stop: () => {} }];

  const [playWin] = typeof window !== 'undefined' ? useSound('/win.mp3', {
    soundEnabled: isSoundEnabled
  }) : [() => {}];

  useEffect(() => {
    // Load custom categories and sound preference from localStorage
    const saved = localStorage.getItem('customCategories');
    const soundPref = localStorage.getItem('soundEnabled');
    if (saved) {
      setCustomCategories(JSON.parse(saved));
    }
    if (soundPref !== null) {
      setIsSoundEnabled(JSON.parse(soundPref));
    }
  }, []);

  const data = items.map(item => ({ option: item }));

  const addItem = () => {
    if (newItem.trim() !== '') {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const clearAll = () => {
    setItems([]);
    setWinner(null);
    setMustSpin(false);
    setPrizeNumber(0);
  };

  const handleSpinClick = () => {
    if (items.length === 0 || mustSpin) return;
    
    const nextPrize = Math.floor(Math.random() * items.length);
    setPrizeNumber(nextPrize);
    setMustSpin(true);
    setWinner(null);
    playSpinning();
    setSpinCount(prev => prev + 1);
  };

  const loadCategory = (categoryItems: string[]) => {
    setItems(categoryItems);
    setWinner(null);
    setMustSpin(false);
    setPrizeNumber(0);
  };

  const saveCurrentAsCategory = () => {
    if (newCategoryName && items.length > 0) {
      const newCategory = {
        id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
        icon: '⭐',
        title: newCategoryName,
        items: [...items]
      };
      const updatedCategories = [...customCategories, newCategory];
      setCustomCategories(updatedCategories);
      localStorage.setItem('customCategories', JSON.stringify(updatedCategories));
      setNewCategoryName('');
      setShowSaveCategory(false);
    }
  };

  const shareResult = () => {
    if (winner) {
      const text = `Karar Çarkım ${winner} seçeneğini seçti! 🎯\nSen de denemek ister misin? 🎲`;
      if (navigator.share) {
        navigator.share({
          title: 'Karar Çarkı Sonucu',
          text: text,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(text);
        alert('Sonuç panoya kopyalandı!');
      }
    }
  };

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    localStorage.setItem('soundEnabled', JSON.stringify(!isSoundEnabled));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const deleteCustomCategory = (categoryId: string) => {
    const updatedCategories = customCategories.filter(cat => cat.id !== categoryId);
    setCustomCategories(updatedCategories);
    localStorage.setItem('customCategories', JSON.stringify(updatedCategories));
  };

  const exportWheel = () => {
    const wheelData = {
      items,
      spinSpeed,
      timestamp: new Date().toISOString(),
      winner,
      spinCount,
      spinHistory
    };

    const jsonStr = JSON.stringify(wheelData);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `karar-carki-${new Date().toLocaleDateString('tr-TR').replace(/\//g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importWheel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          setItems(data.items || []);
          setSpinSpeed(data.spinSpeed || 1);
          if (data.spinHistory) setSpinHistory(data.spinHistory);
          if (data.spinCount) setSpinCount(data.spinCount);
          setShowExport(false);
        } catch (error) {
          alert('Geçersiz çark dosyası!');
        }
      };
      reader.readAsText(file);
    }
  };

  const captureWheel = async () => {
    if (wheelContainerRef.current && typeof window !== 'undefined') {
      try {
        const html2canvasModule = await import('html2canvas');
        const html2canvas = html2canvasModule.default;

        const wheelElement = wheelContainerRef.current;
        
        const canvas = await html2canvas(wheelElement, {
          backgroundColor: '#581C85',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: true,
          foreignObjectRendering: false,
          removeContainer: false,
          ignoreElements: (element) => {
            return element.classList.contains('confetti') || 
                   element.tagName === 'BUTTON' ||
                   element.classList.contains('winner-display');
          }
        });
        
        try {
          const image = canvas.toDataURL('image/png', 1.0);
          
          if (navigator.share) {
            try {
              const blob = await (await fetch(image)).blob();
              const file = new File([blob], 'karar-carki.png', { type: 'image/png' });
              
              await navigator.share({
                title: 'Karar Çarkı',
                text: winner ? `Karar Çarkım ${winner} seçeneğini seçti! 🎯` : 'Karar Çarkım',
                files: [file]
              });
            } catch (err) {
              const link = document.createElement('a');
              link.download = `karar-carki-${new Date().toLocaleDateString('tr-TR').replace(/\//g, '-')}.png`;
              link.href = image;
              link.click();
            }
          } else {
            const link = document.createElement('a');
            link.download = `karar-carki-${new Date().toLocaleDateString('tr-TR').replace(/\//g, '-')}.png`;
            link.href = image;
            link.click();
          }
        } catch (err) {
          console.error('Görsel kaydedilirken hata oluştu:', err);
          alert('Görsel kaydedilirken bir hata oluştu! Lütfen tekrar deneyin.');
        }
      } catch (err) {
        console.error('html2canvas yüklenirken hata oluştu:', err);
        alert('Görsel kaydedilirken bir hata oluştu! Lütfen tekrar deneyin.');
      }
    }
  };

  const toggleSimpleMode = () => {
    setIsSimpleMode(!isSimpleMode);
    if (!isSimpleMode) {
      // Evet/Hayır moduna geç
      setItems(['✅ Evet', '❌ Hayır']);
      setSelectedColors(['#4CAF50', '#f44336']); // Yeşil ve Kırmızı
    } else {
      // Normal moda geri dön
      clearAll();
      setSelectedColors(defaultColors);
    }
  };

  const updateColor = (color: string) => {
    if (currentColorIndex !== null) {
      const newColors = [...selectedColors];
      newColors[currentColorIndex] = color;
      setSelectedColors(newColors);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 p-2 sm:p-4 md:p-8">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={200} />}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-2 sm:gap-4">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-center text-white animate-pulse mb-2 sm:mb-0">
            Karar Çarkı ✨
          </h1>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
            <motion.button
              whileHover={!mustSpin ? { scale: 1.1 } : {}}
              whileTap={!mustSpin ? { scale: 0.9 } : {}}
              onClick={async () => {
                if (!mustSpin) {
                  await captureWheel();
                }
              }}
              disabled={mustSpin}
              className={`text-white/70 hover:text-white transition-opacity p-1.5 sm:p-0 ${mustSpin ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Çarkı Görsel Olarak Kaydet"
            >
              <CameraIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
            <motion.button
              whileHover={!mustSpin ? { scale: 1.1 } : {}}
              whileTap={!mustSpin ? { scale: 0.9 } : {}}
              onClick={() => !mustSpin && setShowExport(true)}
              disabled={mustSpin}
              className={`text-white/70 hover:text-white transition-opacity p-1.5 sm:p-0 ${mustSpin ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <DocumentDuplicateIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
            <motion.button
              whileHover={!mustSpin ? { scale: 1.1 } : {}}
              whileTap={!mustSpin ? { scale: 0.9 } : {}}
              onClick={() => !mustSpin && toggleSound()}
              disabled={mustSpin}
              className={`text-white/70 hover:text-white transition-opacity p-1.5 sm:p-0 ${mustSpin ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSoundEnabled ? (
                <SpeakerWaveIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <SpeakerXMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </motion.button>
            <motion.button
              whileHover={!mustSpin ? { scale: 1.1 } : {}}
              whileTap={!mustSpin ? { scale: 0.9 } : {}}
              onClick={() => !mustSpin && toggleFullscreen()}
              disabled={mustSpin}
              className={`text-white/70 hover:text-white transition-opacity p-1.5 sm:p-0 ${mustSpin ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isFullscreen ? (
                <ArrowsPointingInIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <ArrowsPointingOutIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </motion.button>
            <span className="text-white text-xs sm:text-sm ml-1">Çevirme: {spinCount}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            <div 
              ref={wheelContainerRef}
              className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px] aspect-square flex items-center justify-center bg-[#002144] rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 mx-auto my-4 sm:my-6"
              style={{
                boxShadow: '0 0 20px rgba(0,0,0,0.3)',
              }}
            >
              {items.length > 0 ? (
                <Wheel
                  mustStartSpinning={mustSpin}
                  prizeNumber={prizeNumber}
                  data={data}
                  onStopSpinning={() => {
                    stopSpinning();
                    setMustSpin(false);
                    setWinner(items[prizeNumber]);
                    playWin();
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 5000);
                    
                    // Spin geçmişine ekleme
                    const newHistory: SpinHistoryItem[] = [...spinHistory];
                    newHistory.push({
                      timestamp: new Date().toLocaleString('tr-TR'),
                      winner: items[prizeNumber]
                    });
                    setSpinHistory(newHistory);
                  }}
                  backgroundColors={selectedColors}
                  textColors={['#ffffff']}
                  fontSize={12}
                  radiusLineWidth={1}
                  perpendicularText
                  textDistance={60}
                  spinDuration={0.8 / spinSpeed}
                />
              ) : (
                <div className="w-full h-full rounded-full border-4 border-dashed border-white/30 flex items-center justify-center">
                  <p className="text-white/50 text-center px-2 sm:px-4 text-xs sm:text-sm">Lütfen en az bir seçenek ekleyin</p>
                </div>
              )}
            </div>

            <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px] mx-auto space-y-3 sm:space-y-4">
              <div className="flex gap-1.5 sm:gap-2">
                <motion.button
                  whileHover={!mustSpin ? { scale: 1.05 } : {}}
                  whileTap={!mustSpin ? { scale: 0.95 } : {}}
                  onClick={() => !mustSpin && setSpinSpeed(0.5)}
                  disabled={mustSpin}
                  className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg transition-colors ${
                    spinSpeed === 0.5 ? 'bg-purple-500' : 'bg-white/20'
                  } text-white text-xs sm:text-sm ${
                    mustSpin ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Yavaş
                </motion.button>
                <motion.button
                  whileHover={!mustSpin ? { scale: 1.05 } : {}}
                  whileTap={!mustSpin ? { scale: 0.95 } : {}}
                  onClick={() => !mustSpin && setSpinSpeed(1)}
                  disabled={mustSpin}
                  className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg transition-colors ${
                    spinSpeed === 1 ? 'bg-purple-500' : 'bg-white/20'
                  } text-white text-xs sm:text-sm ${
                    mustSpin ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Normal
                </motion.button>
                <motion.button
                  whileHover={!mustSpin ? { scale: 1.05 } : {}}
                  whileTap={!mustSpin ? { scale: 0.95 } : {}}
                  onClick={() => !mustSpin && setSpinSpeed(2)}
                  disabled={mustSpin}
                  className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg transition-colors ${
                    spinSpeed === 2 ? 'bg-purple-500' : 'bg-white/20'
                  } text-white text-xs sm:text-sm ${
                    mustSpin ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Hızlı
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSpinClick}
                disabled={mustSpin || items.length < 2}
                className={`w-full py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-full text-base sm:text-lg md:text-xl font-bold shadow-lg
                  ${mustSpin || items.length < 2
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600'}
                  text-white transition-all duration-300`}
              >
                {mustSpin ? 'Çevriliyor...' : 'Çevir!'}
              </motion.button>

              {winner && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-white/20 p-2 sm:p-3 md:p-4 rounded-lg text-center relative mt-2 sm:mt-3"
                >
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2">Kazanan!</h3>
                  <p className="text-lg sm:text-xl md:text-2xl text-white">{winner}</p>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={shareResult}
                    className="absolute top-1 sm:top-2 right-1 sm:right-2 text-white/70 hover:text-white"
                  >
                    <ShareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </motion.div>
              )}

              {spinHistory.slice().reverse().map((result, index) => (
                <div key={index} className="text-white/90 text-xs sm:text-sm flex items-center gap-2">
                  <span className="opacity-50">#{spinHistory.length - index}</span>
                  <span>{result.winner}</span>
                  <span className="text-white/50 text-[10px]">({result.timestamp})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6 mt-4 sm:mt-0">
            <div className="grid grid-cols-3 xs:grid-cols-3 gap-1.5 sm:gap-2">
              {predefinedCategories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={!mustSpin ? { scale: 1.05 } : {}}
                  whileTap={!mustSpin ? { scale: 0.95 } : {}}
                  onClick={() => !mustSpin && loadCategory(category.items)}
                  disabled={mustSpin}
                  className={`px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex flex-col items-center gap-0.5 sm:gap-1 ${
                    mustSpin ? 'opacity-50 cursor-not-allowed hover:bg-white/20' : ''
                  }`}
                >
                  <span className="text-lg sm:text-xl md:text-2xl">{category.icon}</span>
                  <span className="text-[10px] sm:text-xs md:text-sm font-medium">{category.title}</span>
                </motion.button>
              ))}
            </div>

            {customCategories.length > 0 && (
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-[10px] sm:text-xs md:text-sm font-medium text-white/70">Özel Kategoriler</h3>
                <div className="grid grid-cols-3 xs:grid-cols-3 gap-1.5 sm:gap-2">
                  {customCategories.map((category) => (
                    <motion.div
                      key={category.id}
                      className="relative group"
                    >
                      <motion.button
                        whileHover={!mustSpin ? { scale: 1.05 } : {}}
                        whileTap={!mustSpin ? { scale: 0.95 } : {}}
                        onClick={() => !mustSpin && loadCategory(category.items)}
                        disabled={mustSpin}
                        className={`w-full px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex flex-col items-center gap-0.5 sm:gap-1 ${
                          mustSpin ? 'opacity-50 cursor-not-allowed hover:bg-white/20' : ''
                        }`}
                      >
                        <span className="text-lg sm:text-xl md:text-2xl">{category.icon}</span>
                        <span className="text-[10px] sm:text-xs md:text-sm font-medium">{category.title}</span>
                      </motion.button>
                      <motion.button
                        whileHover={!mustSpin ? { scale: 1.1 } : {}}
                        whileTap={!mustSpin ? { scale: 0.9 } : {}}
                        onClick={() => !mustSpin && deleteCustomCategory(category.id)}
                        disabled={mustSpin}
                        className={`absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 md:-top-2 md:-right-2 bg-red-500 text-white rounded-full p-0.5 sm:p-1 ${
                          mustSpin ? 'hidden' : 'opacity-0 group-hover:opacity-100'
                        } transition-opacity`}
                      >
                        <TrashIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-[200px] sm:max-h-[250px] md:max-h-[300px] overflow-y-auto">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between bg-white/20 p-1.5 sm:p-2 md:p-3 rounded-lg group"
                >
                  <span className="text-xs sm:text-sm md:text-base text-white">{item}</span>
                  <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                    <motion.button
                      whileHover={!mustSpin ? { scale: 1.1 } : {}}
                      whileTap={!mustSpin ? { scale: 0.9 } : {}}
                      onClick={() => {
                        if (!mustSpin) {
                          setCurrentColorIndex(index);
                          setIsColorPickerOpen(true);
                        }
                      }}
                      disabled={mustSpin}
                      className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full cursor-pointer border-2 border-white/20 transition-opacity ${mustSpin ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: selectedColors[index % selectedColors.length] }}
                    />
                    <motion.button
                      whileHover={!mustSpin ? { scale: 1.1 } : {}}
                      whileTap={!mustSpin ? { scale: 0.9 } : {}}
                      onClick={() => !mustSpin && setItems(items.filter((_, i) => i !== index))}
                      disabled={mustSpin}
                      className={`text-red-400 hover:text-red-600 transition-colors ${mustSpin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-xs sm:text-sm md:text-base">❌</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-1.5 sm:gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => !mustSpin && setNewItem(e.target.value)}
                placeholder="Yeni seçenek ekle..."
                className={`flex-1 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-xs sm:text-sm md:text-base ${
                  mustSpin ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onKeyPress={(e) => e.key === 'Enter' && !mustSpin && addItem()}
                disabled={mustSpin}
              />
              <motion.button
                whileHover={!mustSpin ? { scale: 1.05 } : {}}
                whileTap={!mustSpin ? { scale: 0.95 } : {}}
                onClick={() => !mustSpin && addItem()}
                disabled={mustSpin}
                className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm md:text-base ${
                  mustSpin ? 'opacity-50 cursor-not-allowed hover:bg-green-500' : ''
                }`}
              >
                Ekle
              </motion.button>
            </div>

            <div className="flex gap-1.5 sm:gap-2">
              <motion.button
                whileHover={!mustSpin ? { scale: 1.05 } : {}}
                whileTap={!mustSpin ? { scale: 0.95 } : {}}
                onClick={() => !mustSpin && clearAll()}
                disabled={mustSpin}
                className={`flex-1 py-1 sm:py-1.5 md:py-2 px-2 sm:px-3 md:px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base ${
                  mustSpin ? 'opacity-50 cursor-not-allowed hover:bg-red-500' : ''
                }`}
              >
                <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                Tümünü Sil
              </motion.button>
              
              <motion.button
                whileHover={!mustSpin ? { scale: 1.05 } : {}}
                whileTap={!mustSpin ? { scale: 0.95 } : {}}
                onClick={() => !mustSpin && setShowSaveCategory(true)}
                disabled={mustSpin}
                className={`flex-1 py-1 sm:py-1.5 md:py-2 px-2 sm:px-3 md:px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base ${
                  mustSpin ? 'opacity-50 cursor-not-allowed hover:bg-yellow-500' : ''
                }`}
              >
                <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                Kategori Kaydet
              </motion.button>
            </div>

            <AnimatePresence>
              {showSaveCategory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-1.5 sm:gap-2"
                >
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => !mustSpin && setNewCategoryName(e.target.value)}
                    placeholder="Kategori adı..."
                    className={`flex-1 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-xs sm:text-sm md:text-base ${
                      mustSpin ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onKeyPress={(e) => e.key === 'Enter' && !mustSpin && saveCurrentAsCategory()}
                    disabled={mustSpin}
                  />
                  <motion.button
                    whileHover={!mustSpin ? { scale: 1.05 } : {}}
                    whileTap={!mustSpin ? { scale: 0.95 } : {}}
                    onClick={() => !mustSpin && saveCurrentAsCategory()}
                    disabled={mustSpin}
                    className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors ${
                      mustSpin ? 'opacity-50 cursor-not-allowed hover:bg-yellow-500' : ''
                    }`}
                  >
                    <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {showExport && !mustSpin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full space-y-3 sm:space-y-4"
              >
                <h3 className="text-lg sm:text-xl font-bold text-white">Çarkı Kaydet / Yükle</h3>
                
                <div className="space-y-3 sm:space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={exportWheel}
                    className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    Çarkı Kaydet
                  </motion.button>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={importWheel}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base">
                      <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      Çark Yükle
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowExport(false)}
                  className="w-full py-2 px-3 sm:px-4 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm sm:text-base"
                >
                  Kapat
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isColorPickerOpen && !mustSpin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full"
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Renk Seç</h3>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {[
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
                    '#f44336', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0',
                    '#795548', '#FF9800', '#607D8B', '#E91E63', '#00BCD4'
                  ].map((color) => (
                    <motion.button
                      key={color}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        updateColor(color);
                        setIsColorPickerOpen(false);
                      }}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full cursor-pointer border-2 border-white/20"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsColorPickerOpen(false)}
                  className="w-full mt-3 sm:mt-4 py-2 px-3 sm:px-4 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm sm:text-base"
                >
                  Kapat
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
    </main>
  );
}
