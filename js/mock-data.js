const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "[SGTVN] Mini GT Box Version MGT01087 LB Works Lamborghini Aventador Limited Edition Matte Black",
    brand: "Mini GT",
    category: "Mini GT",
    scale: "1:64",
    price: 549000,
    image: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=900&q=80",
    featured: true
  },
  {
    id: 2,
    name: "[SGTVN] Kaido House KHMG190 Honda NSX Kaido Test Car Spec V1",
    brand: "Kaido House",
    category: "Kaido House",
    scale: "1:64",
    price: 495000,
    image: "https://images.unsplash.com/photo-1600712242805-5f78671b24da?auto=format&fit=crop&w=900&q=80",
    featured: true
  },
  {
    id: 3,
    name: "[SGTVN] Pop Race PR640325 TOP SECRET GT300 SUPRA - Silver Chrome",
    brand: "Pop Race",
    category: "Pop Race",
    scale: "1:64",
    price: 399000,
    image: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=900&q=80",
    featured: true
  },
  {
    id: 4,
    name: "[SGTVN] Pop Race PR640301 Mazda 787B 1991 Le Mans 24h Winner",
    brand: "Pop Race",
    category: "Pop Race",
    scale: "1:64",
    price: 449000,
    image: "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=900&q=80",
    featured: true
  },
  {
    id: 5,
    name: "[SGTVN] Kaido House KHMG191 Nissan Skyline GT-R R33 Kaido Works ADVAN",
    brand: "Kaido House",
    category: "Kaido House",
    scale: "1:64",
    price: 495000,
    image: "https://images.unsplash.com/photo-1600712617803-2f6c31d9dc74?auto=format&fit=crop&w=900&q=80",
    featured: true
  },
  {
    id: 6,
    name: "[SGTVN] Pop Race PRDC003 R33 GT-R Dark Chrome",
    brand: "Pop Race",
    category: "Pop Race",
    scale: "1:64",
    price: 429000,
    image: "https://images.unsplash.com/photo-1617814076668-58d0a25b731e?auto=format&fit=crop&w=900&q=80",
    featured: false
  },
  {
    id: 7,
    name: "[SGTVN] Mini GT Box Version MGT00807 Lamborghini Huracan Sterrato Blu Aegir",
    brand: "Mini GT",
    category: "Mini GT",
    scale: "1:64",
    price: 399000,
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=900&q=80",
    featured: false
  },
  {
    id: 8,
    name: "[SGTVN] Shou Cang Jia Diorama 1:64 Japanese Style Ramp",
    brand: "Shou Cang Jia",
    category: "Diorama 1:64",
    scale: "1:64",
    price: 639000,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    featured: false
  },
  {
    id: 9,
    name: "[SGTVN] Kaido House KHMG208 Nissan Fairlady Z Kaido GT Police",
    brand: "Kaido House",
    category: "Kaido House",
    scale: "1:64",
    price: 495000,
    image: "https://images.unsplash.com/photo-1597007066704-67bf2068d5b2?auto=format&fit=crop&w=900&q=80",
    featured: true
  },
  {
    id: 10,
    name: "[SGTVN] Pop Race PR640217 PANDEM Datsun 620 Blue",
    brand: "Pop Race",
    category: "Pop Race",
    scale: "1:64",
    price: 379000,
    image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=900&q=80",
    featured: false
  },
  {
    id: 11,
    name: "[SGTVN] Tomica Premium No.08 Ferrari 512TR",
    brand: "Tomica",
    category: "Tomica",
    scale: "1:64",
    price: 249000,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80",
    featured: false
  },
  {
    id: 12,
    name: "[SGTVN] Mini GT Box Version MGT01012 Ford Mustang GT3 Daytona 24 Hrs",
    brand: "Mini GT",
    category: "Mini GT",
    scale: "1:64",
    price: 549000,
    image: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=900&q=80",
    featured: false
  },
  {
    id: 13,
    name: "[SGTVN] Inno64 1:64 TOP SECRET R34 GT-R White",
    brand: "Inno64",
    category: "Inno64",
    scale: "1:64",
    price: 599000,
    image: "https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?auto=format&fit=crop&w=900&q=80",
    featured: true
  },
  {
    id: 14,
    name: "[SGTVN] Inno64 1:64 Toyota Supra A80 TOP SECRET Red",
    brand: "Inno64",
    category: "Inno64",
    scale: "1:64",
    price: 649000,
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=900&q=80",
    featured: false
  },
  {
    id: 15,
    name: "[SGTVN] Pop Race PR640157 Nissan Skyline GT-R R32 Crystal White",
    brand: "Pop Race",
    category: "Pop Race",
    scale: "1:64",
    price: 369000,
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=900&q=80",
    featured: false
  },
  {
    id: 16,
    name: "[SGTVN] Pop Race PR640432 PANDEM S13 EVA RT Test Type-01",
    brand: "Pop Race",
    category: "Pop Race",
    scale: "1:64",
    price: 429000,
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80",
    featured: false
  }
];
