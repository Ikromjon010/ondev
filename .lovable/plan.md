## Maqsad

1. **Landing pageni** to'liq, ishonarli marketing sahifasiga aylantirish (hozir bor bo'lim hero+kurslar+features+pricing — qisqa).
2. **Sertifikat tizimini** mock'dan real ma'lumotlarga o'tkazish: haqiqiy QR, verifikatsiya sahifasi, PDF yuklash, avtomatik berilish.

---

## 1-qism: Landing pageni to'ldirish (`src/pages/Index.tsx`)

Mavjud bo'limlar saqlanadi, qo'shamiz:

### a) Hero ostiga **statistika polosasi**
- "500+ o'quvchi", "108 dars", "9 oylik dastur", "4.8★ reyting" — `glass-card` chiziqli blok.
- Raqamlar hozircha statik (yoki `profiles`/`lessons` count'idan olamiz — oson SQL).

### b) **"Qanday ishlaydi"** bo'limi (yangi)
4 qadam vizual:
1. Ro'yxatdan o'ting (telefon orqali)
2. Qisqa video tomosha qiling
3. Brauzerda kod yozing — AI tekshiradi
4. Ball, sertifikat va reyting

Har birida ikon (`UserPlus`, `PlayCircle`, `Code2`, `Award`) + qisqa matn.

### c) **Kod muharriri preview** (yangi)
Statik mock IDE oynasi: chap tomonda Python kodi (syntax highlighted div), o'ngda "✓ Test passed" output. Marketing "show, don't tell" effekti.

### d) **Yutuqlar/o'quvchi sharhlari** (yangi)
3 ta sharh kartasi (statik, hozircha tipik o'quvchi nomlaridan): "Ondev orqali birinchi backend ishimni topdim" tipidagi.

### e) **FAQ** akkordeon (yangi)
6-8 ta savol: "Qancha vaqt ketadi?", "Oldindan tajriba kerakmi?", "Sertifikat tan olinadimi?", "To'lov qanday?", "Qaytarish bormi?", "Qaysi tilda?".
`@/components/ui/accordion` ishlatamiz.

### f) **Final CTA banner**
"Bugun bepul boshlang" katta call-to-action — gradient fon, ikkita tugma.

### g) **Footer'ni kengaytirish**
Bog'lanish (Telegram link, email), siyosat/shartlar (placeholder), bo'limlar.

---

## 2-qism: Sertifikat tizimini tugatish

### Asosiy kamchiliklar hozir
- `Certificate.tsx` — barcha ma'lumot **hardcoded** ("Sardor Rakhimov", "ONDEV-2026-SR7X9K"). DB'dagi `certificates` jadvali ishlatilmaydi.
- QR kod — chiroyli rasm, lekin haqiqiy emas.
- Verifikatsiya sahifasi yo'q (QR'ni skanerlasa hech narsa ochilmaydi).
- Sertifikat **avtomatik berilmaydi** (kursni tugatganda).
- PDF "yuklab olish" — `window.print()` (brauzer print dialog), to'g'ri PDF emas.

### Bajariladigan ishlar

#### a) Route va ma'lumot oqimi
- `/certificate` — joriy foydalanuvchining sertifikatlari ro'yxati (kurs bo'yicha kartalar). Agar bitta bo'lsa to'g'ridan-to'g'ri ko'rsatamiz.
- `/certificate/:credentialId` — **ommaviy** verifikatsiya sahifasi (login talab qilmaydi, `certificates` jadvalida `Public can view` policy bor).
  - Agar topilsa: "✓ Tasdiqlangan sertifikat" + sertifikat ko'rinishi.
  - Agar topilmasa: "Sertifikat topilmadi".

#### b) Sertifikat komponentini ajratish
- Yangi `src/components/CertificateCard.tsx` — qayta ishlatiladigan, `studentName`, `courseTitle`, `date`, `credentialId` props oladi.
- `Certificate.tsx` va verifikatsiya sahifasi shu komponentni ishlatadi.

#### c) Real QR kod
- `qrcode.react` paketini qo'shamiz (`bun add qrcode.react`).
- QR mazmuni: `https://ondev.uz/certificate/{credentialId}`.

#### d) Avtomatik sertifikat berilishi
- Yangi hook/util: `useIssueCertificateOnComplete(courseId)` — `Syllabus`/`LessonView`'da ishlatiladi.
- Logika: foydalanuvchi kurs ichidagi **barcha darslarni** tugatganida (`user_progress.completed = true` for all `lessons` in course's modules), `certificates` jadvaliga `INSERT` qilinadi:
  - `credential_id`: `ONDEV-{YEAR}-{6 ta random alfanumeric}` (client-side generatsiya, RLS `auth.uid() = user_id` bilan insert qilamiz).
  - `student_name`: `profiles.full_name`'dan.
- **DB siyosati**: `certificates` hozir faqat **admin manage** uchun INSERT qila oladi. **Migration kerak** — yangi RLS policy:
  ```
  CREATE POLICY "Users can issue own certificate"
  ON certificates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
  ```
- Dublikatlarning oldini olish uchun unique index: `UNIQUE(user_id, course_id)`.

#### e) PDF yuklash (real)
- `html2canvas` + `jspdf` (yengil, allaqachon ekosistemada keng ishlatiladi). `bun add html2canvas jspdf`.
- "PDF yuklab olish" tugmasi — `CertificateCard` ref'ini canvas'ga, keyin A4 landscape PDF.
- `window.print()` zaxira sifatida qoldiramiz (alohida "Chop etish" tugmasi).

#### f) Dashboard'da sertifikatlar belgisi
- Agar foydalanuvchining `certificates` yozuvi bo'lsa, `Dashboard.tsx`'da "Sizning sertifikatlaringiz" mini-bo'lim yoki `AppHeader` profilida belgi.

---

## Texnik tafsilotlar

### Yangi/o'zgaradigan fayllar
- `src/pages/Index.tsx` — yangi bo'limlar (Stats, HowItWorks, IDEPreview, Testimonials, FAQ, FinalCTA).
- `src/pages/Certificate.tsx` — DB'dan o'qish, ro'yxat ko'rinishi.
- `src/pages/CertificateVerify.tsx` — yangi ommaviy sahifa.
- `src/components/CertificateCard.tsx` — yangi komponent (QR + dizayn).
- `src/hooks/useIssueCertificate.ts` — yangi hook (avtomatik berish logikasi).
- `src/App.tsx` — yangi route `/certificate/:credentialId`.
- `src/pages/LessonView.tsx` (yoki `Syllabus.tsx`) — kurs tugaganini aniqlash va sertifikat berishni triggerlash.

### DB migration
```sql
-- 1. INSERT policy for users
CREATE POLICY "Users can issue own certificate"
ON public.certificates FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Prevent duplicates (one cert per user/course)
CREATE UNIQUE INDEX certificates_user_course_unique
ON public.certificates(user_id, course_id);
```

### Yangi paketlar
- `qrcode.react` — QR generatsiya
- `html2canvas` + `jspdf` — PDF eksport

### Ishlatilmaydi
- Email yuborish (sertifikat berilganda) — keyingi bosqichga, email infratuzilmasi sozlanmagan.
- Real raqamli imzo (cryptographic) — keyingi bosqichga.

---

## Tartib

1. Landing'ni yangilash (1-qism, hammasi bir faylda).
2. DB migration — `certificates` policy + unique index.
3. `CertificateCard` komponenti + `qrcode.react` o'rnatish.
4. `Certificate.tsx` — DB'dan o'qish, ro'yxat.
5. `CertificateVerify.tsx` + route.
6. Avtomatik berish hook'i + `LessonView`'ga integratsiya.
7. PDF eksport (`html2canvas` + `jspdf`).

Tasdiqlasangiz, shu tartibda bajaraman.
