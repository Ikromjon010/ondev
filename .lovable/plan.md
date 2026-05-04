## Maqsad

Adminga ustozlarni qulay taklif qilish, ustozga aniq onboarding (qo'llanma) va platformada ko'rinish (badge) berish.

## Tafsilot

### 1. Admin: Ustoz taklif qilish oqimi (`AdminUsers.tsx`)
- Hozir bor: foydalanuvchiga "Instructor" rolini bermoq/olmoq (dropdown).
- Qo'shamiz:
  - **"Ustoz taklif qilish"** tugmasi sahifa tepasida → modal:
    - Telefon (yoki email) kiritiladi.
    - Agar foydalanuvchi `profiles`'da topilsa — darhol `instructor` roli beriladi va kursga biriktirish dropdown'i ko'rsatiladi (kurslar ro'yxati `courses`'dan).
    - Agar topilmasa — "Avval ro'yxatdan o'tsin, keyin qaytib bog'laysiz" deb sodda xabar (yangi user yaratmaymiz, xavfsizlik uchun).
  - Foydalanuvchilar jadvalida **"Ustoz"** ustuni: o'sha ustoz biriktirilgan kurs(lar) nomini chiqaradi.
  - Tezkor amal: foydalanuvchini ochib, **"Kursga biriktirish"** dropdown — `courses.instructor_id` ni o'rnatadi.

### 2. `/teach` ustoz onboarding sahifasi (`Teach.tsx`)
Birinchi marta kirgan ustoz uchun:
- Kursi yo'q bo'lsa: "Sizga hali kurs biriktirilmagan. Admin bilan bog'laning." — bo'sh holat.
- Kursi bor bo'lsa, sahifa tepasida **qisqa onboarding banner** (yopiladigan, `localStorage`'da yopilganini saqlash):
  - 3 qadam: **Modul qo'shing → Darslar yarating (video + markdown + task) → O'quvchilar progressini kuzating**.
  - Har birida CTA tugma (tegishli tabga olib boradi).
- Yangi **"Yo'riqnoma"** tab qo'shamiz — to'liq Markdown qo'llanma:
  - Dars qanday tuzilishi (YouTube link formati, markdown'da `## Vazifa N` sarlavhalari, starter/solution code).
  - AI kod tekshiruvi qanday ishlashi (`language` maydoni muhim).
  - Tier (basic/intermediate/advanced) ma'nosi.

### 3. Ustoz profilida belgi
- `Profile.tsx` va `PublicProfile.tsx`'da: agar foydalanuvchi `instructor` rolida va biror kursning `instructor_id`'si bo'lsa — ism yonida **"Ustoz"** badge (oltin/amber rangda) + "X kursi ustozi" matni va o'sha kursga link.
- `AppHeader`'dagi avatar dropdown'iga ham kichik "Ustoz" indikatori (agar instructor bo'lsa).

### 4. Ustoz biriktirilganda email xabarnoma (ixtiyoriy — keyinroq qilamiz)
Hozir email infratuzilmasi yo'q. Buni alohida bosqichda qo'shamiz: admin taklif tugmasini bosganda ustozga "Tabriklaymiz, siz X kursiga ustoz qilib tayinlandingiz" emaili. Bu Lovable Cloud'ning email tizimini (domen + setup) talab qiladi — **bu rejaga kiritmaymiz**, tasdiqlasangiz keyingi qadamda alohida qilamiz.

## Texnik tafsilotlar

- **DB o'zgarishi shart emas.** Hammasi mavjud jadvallar bilan ishlaydi (`courses.instructor_id`, `user_roles`, `profiles`).
- **Yangi hook**: `useInstructorCourses(userId)` — berilgan foydalanuvchi ustoz bo'lgan kurslarni qaytaradi (Profile va AdminUsers'da ishlatamiz).
- **AdminUsers** — invite modal `Dialog` orqali; telefon `profiles.phone` bo'yicha qidiriladi (avval normalizatsiya: faqat raqamlar).
- **Teach onboarding banner** — `useState` + `localStorage` (`teach_onboarding_dismissed`).
- **Yo'riqnoma tab** — statik Markdown content, `react-markdown` orqali render qilamiz (allaqachon `LessonView`'da ishlatilgan).
- **Badge ranglari** — `bg-amber-500/15 text-amber-400 border-amber-500/30` (mavjud dizayn tizimiga mos).

## O'zgaradigan/yaratiladigan fayllar
- `src/pages/admin/AdminUsers.tsx` — taklif modal + ustoz ustuni.
- `src/pages/Teach.tsx` — onboarding banner + Yo'riqnoma tab + bo'sh holat.
- `src/pages/Profile.tsx` — ustoz badge.
- `src/pages/PublicProfile.tsx` — ustoz badge + "X kursi ustozi" link.
- `src/hooks/useInstructorCourses.ts` — yangi hook.
- (Optional) `src/components/AppHeader.tsx` — dropdown'da kichik belgi.

Tasdiqlasangiz, shu tartibda bajarib boshlayman.