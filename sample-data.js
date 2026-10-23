(() => {
  "use strict";

  const STORAGE_KEY = "masakin_mahasiswa1_v1";
  const SEEDED_KEY = "masakin_sample_data_v1";
  const categories = ["Masakan Utama", "Camilan", "Sayuran", "Minuman"];
  const sampleRecipes = [
    {
      id: 1,
      name: "Nasi goreng sederhana",
      category: "Masakan Utama",
      description: "Nasi goreng praktis untuk makan malam keluarga.",
      time: 20,
      ingredients: ["1 piring nasi putih", "1 butir telur", "2 siung bawang putih", "2 sdm kecap manis"],
      steps: ["Cincang bawang putih.", "Tumis bawang putih sampai harum.", "Masukkan telur lalu orak-arik.", "Tambahkan nasi dan kecap, lalu aduk rata."],
      favorite: true
    },
    {
      id: 2,
      name: "Sup ayam sayur",
      category: "Masakan Utama",
      description: "Sup hangat dengan ayam, wortel, dan kentang.",
      time: 45,
      ingredients: ["250 g daging ayam", "1 buah wortel", "1 buah kentang", "1 batang daun bawang", "750 ml air"],
      steps: ["Potong ayam dan sayuran.", "Rebus ayam sampai matang.", "Masukkan wortel dan kentang, masak sampai empuk.", "Tambahkan daun bawang dan bumbu."],
      favorite: false
    },
    {
      id: 3,
      name: "Pisang goreng renyah",
      category: "Camilan",
      description: "Camilan manis dengan lapisan tepung yang renyah.",
      time: 15,
      ingredients: ["3 buah pisang", "100 g tepung terigu", "1 sdm gula", "Air secukupnya", "Minyak untuk menggoreng"],
      steps: ["Campur tepung, gula, dan air.", "Potong pisang sesuai selera.", "Baluri pisang dengan adonan.", "Goreng sampai kuning keemasan."],
      favorite: true
    },
    {
      id: 4,
      name: "Tumis kangkung bawang putih",
      category: "Sayuran",
      description: "Tumis sayur cepat dengan bumbu sederhana.",
      time: 10,
      ingredients: ["1 ikat kangkung", "3 siung bawang putih", "1 sdm saus tiram", "2 sdm minyak", "Garam secukupnya"],
      steps: ["Petik dan cuci kangkung.", "Iris bawang putih lalu tumis sampai harum.", "Masukkan kangkung dan saus tiram.", "Aduk sampai layu, lalu sajikan."],
      favorite: false
    },
    {
      id: 5,
      name: "Es teh lemon",
      category: "Minuman",
      description: "Minuman segar untuk menemani makan siang.",
      time: 5,
      ingredients: ["1 kantong teh", "250 ml air panas", "1 sdm gula", "2 iris lemon", "Es batu secukupnya"],
      steps: ["Seduh teh dengan air panas.", "Tambahkan gula lalu aduk.", "Masukkan irisan lemon dan es batu."],
      favorite: false
    }
  ];

  try {
    if (localStorage.getItem(SEEDED_KEY) === "true") return;

    const saved = localStorage.getItem(STORAGE_KEY);
    let data = { categories: [...categories], recipes: [] };
    if (saved) {
      data = JSON.parse(saved);
      if (!data || !Array.isArray(data.categories) || !Array.isArray(data.recipes)) return;
      if (data.recipes.length) {
        localStorage.setItem(SEEDED_KEY, "true");
        return;
      }
    }

    const mergedCategories = [...data.categories];
    categories.forEach(category => {
      if (!mergedCategories.includes(category)) mergedCategories.push(category);
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      categories: mergedCategories,
      recipes: sampleRecipes
    }));
    localStorage.setItem(SEEDED_KEY, "true");
  } catch (error) {
    console.warn("Contoh data MASAKin tidak dapat dimuat:", error);
  }
})();
