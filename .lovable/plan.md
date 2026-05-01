## Maqsad

Hozir platforma faqat bitta yo'nalishga (Python/Django backend) qurilgan — `modules` jadvalida `tier` (basic/intermediate/advanced) bor, lekin **kurs yo'nalishi** tushunchasi yo'q. Buni o'zgartirib, foydalanuvchi bir nechta yo'nalishlardan birini (Backend, Frontend, Mobile va h.k.) tanlab o'qiy oladigan qilamiz.

## Yangi struktura

```text
Course (yo'nalish)         -> "Python Backend", "Frontend", "Mobile (Flutter)" ...
  └── Module (oy/bosqich)  -> tier (basic/intermediate/advanced) shu yerda
        └── Lesson         -> video, kontent, kod, task
```

Har bir kursning o'z modullari, darslari, narxi (tier'lari) va sertifikati bo'ladi. Foydalanuvchi bir nechta kursga obuna bo'lishi mumkin.

## Bosqichlar

### 1-bosqich: Ma'lumotlar bazasi (migration)
- Yangi `courses` jadvali: `id`, `slug` (`python-backend`, `frontend`, `mobile`), `title`, `description`, `icon`, `color`, `language` (Python/JS/Dart), `is_published`, `sort_order`.
- `modules` jadvaliga `course_id` ustuni qo'shish (default = mavjud Python kursining id'si, NOT NULL).
- `profiles.active_tier` o'rniga yangi `user_course_access` jadvali: `user_id`, `course_id`, `tier` (free/intermediate/advanced), `granted_at`. Bir foydalanuvchi har bir kurs uchun alohida tier'ga ega bo'ladi.
- `payments` jadvaliga `course_id` ustuni qo'shish.
- `certificates` jadvaliga `course_id` ustuni qo'shish.
- `user_progress`'ga tegmaymiz (`lesson_id` orqali kursga ulanadi).
- Hamma yangi jadvallarga RLS: hamma o'qiy oladi (kurslar katalogi ochiq), faqat admin o'zgartiradi; `user_course_access`'ni faqat admin yoza oladi (to'lov tasdiqlangach), foydalanuvchi o'zinikini ko'radi.
- Migratsiya barcha mavjud modullarni avtomatik "Python Backend" kursiga bog'laydi (data backfill).

### 2-bosqich: Frontend — kurslarni tanlash
- **Yangi sahifa `/courses`**: barcha mavjud kurslar katalogi (kartalar bilan), har birida til/ikon/qisqa tavsif, narx (yoki "Tez orada"), "Boshlash" tugmasi.
- **Dashboard (`/dashboard`)** qayta ishlanadi: foydalanuvchi obuna bo'lgan kurslar ro'yxati ko'rsatiladi; agar hech qaysisiga obuna bo'lmagan bo'lsa — "Kurs tanlang" CTA `/courses`'ga olib boradi.
- **Syllabus (`/syllabus/:courseSlug`)** — URL'ga kurs slug qo'shamiz, faqat shu kurs modullari ko'rsatiladi.
- **LessonView** — dars qaysi kursga tegishli ekanini chiqaradi (breadcrumb), tier tekshiruvi `user_course_access`'dan o'qiladi.
- **AppHeader** — "Joriy dars" tugmasi joriy faol kursga bog'lanadi; agar bir nechta kursi bo'lsa — kurs tanlash dropdown.
- **Checkout (`/checkout/:courseSlug/:tier`)** — kurs slug bo'yicha to'lovga yo'naltiradi, muvaffaqiyatli to'lovdan keyin `user_course_access`'ga yozadi.
- **Sertifikat** — kurs nomi sertifikatga chiqadi.

### 3-bosqich: Admin panel
- **AdminContent** ikki bosqichli bo'ladi: avval kurs tanlanadi (yoki yangi kurs yaratiladi), so'ng o'sha kursning modullari/darslari ko'rsatiladi.
- **Yangi `AdminCourses` (yoki AdminContent ichida tab)**: kurs CRUD — qo'shish, tahrirlash, yashirish/chiqarish, ikon va rang tanlash.
- **AdminUsers**: "Joriy dars" ustuniga qaysi kurs ekani ham qo'shiladi; foydalanuvchiga qo'lda kurs tier bera olish.
- **AdminPayments**: to'lovda kurs ko'rsatiladi.
- **AdminDashboard**: statistika kurslar bo'yicha bo'linadi.

### 4-bosqich: Boshlang'ich kurslar (data)
- "Python Backend" — mavjud kontent (avtomatik).
- "Frontend (React)" — bo'sh skeleton (admin keyin to'ldiradi), `is_published = false`.
- "Mobile (Flutter)" — bo'sh skeleton, `is_published = false`.
Foydalanuvchilar `is_published = true` bo'lganlarini ko'radi.

## Texnik tafsilotlar

- Backend AI tekshiruvchisi (`check-code` edge function) hozir Python uchun. Yangi kurslarda boshqa tillar bo'lgani uchun darsga `language` (yoki kursdan meros) qo'shiladi va system prompt'i shu tilga moslashadi (Python o'qituvchisi → JS/Dart o'qituvchisi).
- Monaco Editor til rejimi `lesson.language` yoki `course.language` orqali dinamik o'rnatiladi.
- `useCurrentLesson` hook'i kurs slug'ini parametr sifatida qabul qiladi.
- `AuthContext.activeTier` o'rniga `useCourseAccess(courseSlug)` hook'i — kursga xos tier qaytaradi.
- TypeScript turlari `src/integrations/supabase/types.ts` migratsiyadan keyin avtomatik yangilanadi.
- Eski `/syllabus` URL'i `/syllabus/python-backend`'ga redirect qilinadi (orqaga moslik).

## Nima o'zgarmaydi
- Auth, follow, leaderboard, gamification, badge tizimi shundayligicha qoladi (ular kursdan mustaqil).
- Mavjud Python darslari va foydalanuvchilar progressi yo'qolmaydi (migratsiya backfill qiladi).

## Yetkazib berish tartibi
1-bosqich va 4-bosqich (DB + skeleton kurslar) → 2-bosqich (kurs tanlash UI) → 3-bosqich (admin) → AI tekshiruvchini ko'p tilga moslashtirish.

Tasdiqlasangiz, ishni ushbu tartibda boshlayman.