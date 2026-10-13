
"use client";

import { useState } from "react";

export default function Home() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [completedPhotos, setCompletedPhotos] = useState<string[]>([]);
   
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
async function downloadCollage() {
  const collage = document.getElementById("collage");

  if (!collage) {
    alert("Kolase tidak ditemukan.");
    return;
  }

  try {
    const { toPng } = await import("html-to-image");

    const dataUrl = await toPng(collage, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.download = "puzzlecam-kolase.png";
    link.href = dataUrl;
    link.click();
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
    <main className="min-h-screen bg-stone-100 px-6 py-12 text-stone-900">
      <div className="mx-auto max-w-xl">
        
    <header className="mb-10 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
       PuzzleCam<span className="text-emerald-700">.</span>
      </h1>

      <p className="mt-3 text-stone-600">
        Ubah foto favoritmu menjadi puzzle.
      </p>

      <p className="mt-2 text-sm font-medium text-emerald-700">
        Foto {Math.min(currentPhotoNumber, 3)} dari 3
      </p>
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
    className="flex flex-col items-center gap-4"
    >
      {completedPhotos.map((completedPhoto, index) => (
        <div
          key={index}
          className="w-64 bg-white p-3 pb-10 shadow-lg"
          style={{
            transform: `rotate(${(index - 1) * 4}deg)`,
          }}
        >
          <img
            src={completedPhoto}
            alt={`Foto kenangan ${index + 1}`}
            className="aspect-square w-full object-cover"
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

        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold">
            Pilih foto kamu
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            Unggah foto dari galeri atau ambil foto langsung.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="cursor-pointer rounded-xl bg-emerald-800 px-4 py-3 text-center font-medium text-white hover:bg-emerald-900">
              Pilih dari galeri
              <input
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
              />
            </label>

            <label className="cursor-pointer rounded-xl border border-stone-300 px-4 py-3 text-center font-medium hover:bg-stone-50">
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
    className="mb-4 w-full rounded-xl bg-emerald-800 px-4 py-3 font-medium text-white hover:bg-emerald-900"
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


      
<div className="grid grid-cols-3 gap-1">
   

{pieces.map((piece, position) => {
  const col = piece % 3;
  const row = Math.floor(piece / 3);
  const isSelected = selectedPosition === position;

  return (
    <div
      key={position}
      onClick={() => handlePieceClick(position)}
      className={`aspect-square cursor-pointer rounded border-2 ${
        isSelected ? "border-emerald-500" : "border-transparent"
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
        className="mt-4 w-full rounded-xl border border-stone-300 px-4 py-3 font-medium hover:bg-stone-50"
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
    </main>
  );
}
