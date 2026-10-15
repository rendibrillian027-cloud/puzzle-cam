
"use client";

import { useState } from "react";

export default function Home() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [showHome, setShowHome] = useState(true);
  const [completedPhotos, setCompletedPhotos] = useState<string[]>([]);
  const [captions, setCaptions] = useState<string[]>(["", "", ""]);
  
  function prepareNextPhoto() {
    setPhoto(null);
    setIsPuzzle(false);
    setPieces([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    setSelectedPosition(null);
    setMoves(0);
    setHasStarted(false);
  }

  const [currentPhotoNumber, setCurrentPhotoNumber] = useState(1);
  const [isPuzzle, setIsPuzzle] = useState(false);
  const [pieces, setPieces] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const isSolved =
    hasStarted && pieces.every((piece, index) => piece === index);
  const [showFinal, setShowFinal] = useState(false);


  function handlePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
    }
  }

  function saveCompletedPhoto() {
    if (!photo || showFinal) return;

    const nextPhotos = [...completedPhotos, photo];

    if (nextPhotos.length < 3) {
      setCompletedPhotos(nextPhotos);
      setCurrentPhotoNumber(nextPhotos.length + 1);
      prepareNextPhoto();
    } else {
      setCompletedPhotos(nextPhotos);
      setShowFinal(true);
    }
  }

  function shufflePieces() {
    const shuffled = [...pieces];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [shuffled[i], shuffled[j]] = [
        shuffled[j],
        shuffled[i]
      ];
    }

    setPieces(shuffled);
    let isSolved = true;
    setSelectedPosition(null);
    setMoves(0);
    setHasStarted(true);
  }
    
async function getPhotoBackgroundColor(
  photos: string[]
): Promise<string> {
  const photoColors: { r: number; g: number; b: number }[] = [];

  for (const src of photos) {
    const img = new Image();
    img.src = src;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () =>
        reject(new Error("Foto gagal dibaca untuk mengambil warna."));
    });

    const canvas = document.createElement("canvas");
    canvas.width = 30;
    canvas.height = 30;

    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    ctx.drawImage(img, 0, 0, 30, 30);

    const pixels = ctx.getImageData(0, 0, 30, 30).data;
    const counts: Record<string, number> = {};

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      const brightness = (r + g + b) / 3;
      const chroma = Math.max(r, g, b) - Math.min(r, g, b);

      // Abaikan warna terlalu gelap, terang, atau netral.
      if (brightness < 35 || brightness > 235 || chroma < 25) {
        continue;
      }

      const qr = Math.min(255, Math.round(r / 32) * 32);
      const qg = Math.min(255, Math.round(g / 32) * 32);
      const qb = Math.min(255, Math.round(b / 32) * 32);
      const key = `${qr},${qg},${qb}`;

      counts[key] = (counts[key] || 0) + 1;
    }

    const dominant = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0];

    if (dominant) {
      const [r, g, b] = dominant[0].split(",").map(Number);
      photoColors.push({ r, g, b });
    }
  }

  if (photoColors.length === 0) return "#E8E3D9";

  // Setiap foto punya bobot yang sama.
  // Pilih warna dominan yang paling dekat dengan warna
  // dominan foto-foto lainnya.
  const bestColor = photoColors.reduce((best, candidate) => {
    const score = (color: { r: number; g: number; b: number }) =>
      photoColors.reduce((total, other) => {
        const dr = color.r - other.r;
        const dg = color.g - other.g;
        const db = color.b - other.b;

        return total + dr * dr + dg * dg + db * db;
      }, 0);

    return score(candidate) < score(best) ? candidate : best;
  });

  // Lembutkan warna terpilih agar cocok dengan bingkai putih.
  const soften = (value: number) =>
    Math.min(
      255,
      Math.max(0, Math.round(value * 0.55 + 255 * 0.45))
    );

  return "#E8E0D2";
}

    async function downloadCollage() {
      console.log("DOWNLOAD COLLAGE DIPANGGIL");

      const collage = document.getElementById("collage");

      if (!collage) {
        alert("Kolase tidak ditemukan.");
        return;
      }

   try {
    const { toPng } = await import("html-to-image");
    const originalBackground = collage.style.backgroundColor;
    const captionInputs = collage.querySelectorAll<HTMLInputElement>(
      ".caption-input"
    );

    const originalPlaceholders = Array.from(captionInputs).map(
      (input) => input.placeholder
    );

    try {
    
  const captionInputs = collage.querySelectorAll<HTMLInputElement>(
  ".caption-input"
    );

  const originalPlaceholders = Array.from(captionInputs).map(
      (input) => input.placeholder
    );    
   const color = await getPhotoBackgroundColor(completedPhotos);
    console.log("Warna background hasil:", color);
    collage.style.backgroundColor = color;
    captionInputs.forEach((input) => {
      input.placeholder = "";
    });
  const dataUrl = await toPng(collage, {
      width: 1080,
      height: 1920,
      canvasWidth: 1080,
      canvasHeight: 1920,
      pixelRatio: 1,
      backgroundColor: color,
     });
         

          const link = document.createElement("a");
          link.download = "puzzlecam-kolase.png";
          link.href = dataUrl;
          link.click();  
  } finally {
      captionInputs.forEach((input, index) => {
      input.placeholder = originalPlaceholders[index];
    });
          collage.style.backgroundColor = originalBackground;
        }

      } catch (error) {
        console.error("Gagal mengunduh kolase:", error);
        alert("Kolase gagal diunduh. Coba lagi, ya.");
      }
    }


    // TAMBAHKAN FUNGSI BARU DI BAWAH INI
    function handlePieceClick(position: number) {
      if (selectedPosition === null) {
        setSelectedPosition(position);
        return;
      }

      if (selectedPosition === position) {
        setSelectedPosition(null);
        return;
      }

      const nextPieces = [...pieces];

      [nextPieces[selectedPosition], nextPieces[position]] = [
        nextPieces[position],
        nextPieces[selectedPosition],
      ];

      setPieces(nextPieces);
      setSelectedPosition(null);
      setMoves((currentMoves) => currentMoves + 1);
    }

    return (
      <main className="relative min-h-screen overflow-hidden bg-[#F4F0E8] px-6 py-12 text-stone-900">
        {isPuzzle && photo && !showFinal && (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 scale-110 bg-cover bg-center blur-2xl"
            style={{
              backgroundImage: `url(${photo})`,
            }}
          />
        )}
        {showHome ? (
          <div className="relative z-10 flex min-h-[75vh] flex-col items-center justify-center px-6 py-12 text-center">
            <h1 className="font-serif text-6xl font-medium tracking-tight text-stone-800">
              PuzzleCam<span className="text-emerald-800">.</span>
          </h1>

        <p className="mt-5 max-w-sm text-base leading-7 text-stone-600">
          Ubah foto favoritmu menjadi puzzle.
          Susun kembali momen berharga, satu keping demi satu keping.
        </p>

            <button
            type="button"
            onClick={() => setShowHome(false)}
            className="mt-8 rounded-full bg-emerald-900 px-9 py-3.5 font-medium tracking-wide text-stone-50 shadow-sm transition duration-200 hover:bg-emerald-950"
          >
            Mulai Bermain
          </button>

          <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-500">
              Three Frames · One Story
          </p>
          </div>
        ) : (
          <div className="relative z-10 mx-auto max-w-xl">
       <header className="mb-10 text-center">
         <h1 className="font-serif text-4xl font-medium tracking-tight text-stone-800">
          PuzzleCam<span className="text-emerald-800">.</span>
        </h1>
        
        <p className="mt-3 text-sm leading-6 text-stone-500">
          Ubah foto favoritmu menjadi puzzle.
        </p>
              
              {photo && !showFinal && (
                <p className="mt-2 text-sm font-medium text-emerald-700">
                  Foto {Math.min(currentPhotoNumber, 3)} dari 3
                </p>
              )}
            </header>

            {showFinal ? (
              <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl text-center font-semibold">
                  Momen, Satu Cerita
                </h2>

                <p className="mt-2 mb-6 text-center text-sm text-stone-500">
                  Puzzle selesai! Ini kumpulan foto kamu.
                </p>

           <div
             id="collage"
             className="flex flex-col items-center gap-5 px-4 pt-20 pb-8 sm:gap-6"
              >
      {completedPhotos.map((completedPhoto, index) => (
    <div
     key={index}
     className="w-full max-w-[600px] bg-white p-4 pb-20 shadow-lg"
     style={{
       transform: `rotate(${(index - 1) * 4}deg)`,
       }}
        >
       <img
        src={completedPhoto}
        alt={`Foto kenangan ${index + 1}`}
        className="aspect-square w-full object-cover"
         />
                
      <input
        type="text"
        value={captions[index] ?? ""}
        onChange={(event) => {
          const newCaptions = [...captions];
        newCaptions[index] = event.target.value;
        setCaptions(newCaptions);
      }}
        placeholder="Tulis kenanganmu..."
      className="caption-input mt-3 w-full border-none bg-transparent text-center font-serif text-sm text-stone-700 outline-none placeholder:text-stone-400"
      />

        </div>
         ))}
        </div>

        <button
           type="button"
           onClick={downloadCollage}
           className="mt-6 w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
         >
          Download Kolase
       </button>
       </section>
        ) : (
        <>

        <section className="rounded-3xl border border-stone-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl font-medium text-stone-800">
              Pilih foto kamu
       </h2>
       <p className="mt-2 text-sm leading-6 text-stone-500">
          Unggah foto dari galeri atau ambil foto langsung.
       </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
       <label className="cursor-pointer rounded-full bg-emerald-900 px-4 py-3.5 text-center text-sm font-medium tracking-wide text-white transition duration-200 hover:bg-emerald-950">
          Pilih dari galeri
       <input
         type="file"
         accept="image/*"
         onChange={handlePhoto}
         className="hidden"
        />
            </label>

           <label className="cursor-pointer rounded-full border border-stone-300 bg-white px-4 py-3.5 text-center text-sm font-medium tracking-wide text-stone-700 transition duration-200 hover:bg-stone-100">
              Ambil foto
           <input
              type="file"
                 accept="image/*"
                 capture="environment"
                 onChange={handlePhoto}
                 className="hidden"
            />
            </label>
            </div>


        {photo ? (
          isPuzzle ? (
             <div className="mt-6">
               <h2 className="mb-4 text-lg font-semibold">
                  Puzzle 3×3
               </h2>
             <p className="mb-3 text-sm text-stone-600">
                  Langkah: {moves}
             </p>

                        {isSolved && (
                          <p className="mb-4 rounded-xl bg-emerald-100 p-3 font-semibold text-emerald-800">
                            Puzzle berhasil diselesaikan dalam {moves} langkah!
                          </p>
                        )}


                        {isSolved && (
                          <button
                            type="button"
                            onClick={saveCompletedPhoto}
                            className="mb-4 w-full rounded-full bg-emerald-900 px-4 py-3.5 text-sm font-medium tracking-wide text-stone-50 shadow-sm transition duration-200 hover:bg-emerald-950"
                          >
                            Simpan Foto
                          </button>
                        )}



                        <button
                          type="button"
                          onClick={shufflePieces}
                          className="mb-4 w-full rounded-xl bg-emerald-800 px-4 py-3 font-medium text-white hover:bg-emerald-900"
                        >
                          Acak Puzzle
                        </button>



                        <div className="grid grid-cols-3 gap-1.5">


                          {pieces.map((piece, position) => {
                            const col = piece % 3;
                            const row = Math.floor(piece / 3);
                            const isSelected = selectedPosition === position;
        return (
             <div
                  key={position}
              onClick={() => handlePieceClick(position)}
        className={`aspect-square cursor-pointer rounded-lg border-2 shadow-sm transition-all duration-200 ${
              isSelected
                ? "scale-[0.97] border-emerald-800 bg-white shadow-md ring-2 ring-2-emerald-700/20"
                : "border-transparent hover:brightness-105"
              }`}
           
             style={{
               backgroundImage: `url(${photo})`,
               backgroundSize: "300% 300%",
               backgroundPosition: `${col * 50}% ${row * 50}%`,
             }}
           />
           );
       })}

                        </div>

                        <button
                          type="button"
                          onClick={() => setIsPuzzle(false)}
                          className="mt-4 w-full rounded-full border border-stone-300 bg-white px-4 py-3 text-sm font-medium tracking-wide text-stone-700 transition duration-200 hover:bg-stone-100"
                        >
                          ← Kembali ke Foto
                        </button>
                      </div>
                    ) : (
                      <div className="mt-6">
                        <p className="mb-3 text-sm font-medium">
                          Pratinjau foto
                        </p>

                        <img
                          src={photo}
                          alt="Pratinjau foto pilihan"
                          className="max-h-96 w-full rounded-xl object-contain"
                        />

                        <button
                          type="button"
                          onClick={() => setIsPuzzle(true)}
                          className="mt-4 w-full rounded-xl bg-emerald-800 px-4 py-3 font-medium text-white hover:bg-emerald-900"
                        >
                          Lanjut ke Puzzle →
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPhoto(null);
                            setIsPuzzle(false);
                          }}
                          className="mt-4 w-full rounded-xl border border-stone-300 px-4 py-3 font-medium hover:bg-stone-50"
                        >
                          Hapus foto
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="mt-6 flex min-h-40 items-center justify-center rounded-xl border-2 border-dashed border-stone-200 px-4 text-center text-sm text-stone-400">
                      Foto yang kamu pilih akan muncul di sini.
                    </div>
                  )}

                </section>
              </>
            )}

            <p className="mt-6 text-center text-xs text-stone-400">
              PuzzleCam — setiap foto punya tantangannya sendiri.
            </p>
          </div>
        )}
      </main>
    );
  }
