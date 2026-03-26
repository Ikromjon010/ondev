export interface Lesson {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
  unlocked: boolean;
}

export interface Module {
  id: number;
  month: number;
  title: string;
  lessons: Lesson[];
}

export interface Tier {
  name: string;
  months: string;
  badge: 'basic' | 'intermediate' | 'advanced';
  modules: Module[];
  totalLessons: number;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  streak: number;
}

export const currentUser = {
  name: "Sardor Rakhimov",
  avatar: "SR",
  points: 1240,
  streak: 12,
  completedLessons: 18,
  totalLessons: 108,
};

export const leaderboard: LeaderboardUser[] = [
  { rank: 1, name: "Aziza Karimova", avatar: "AK", points: 2850, streak: 34 },
  { rank: 2, name: "Bobur Toshmatov", avatar: "BT", points: 2340, streak: 21 },
  { rank: 3, name: "Sardor Rakhimov", avatar: "SR", points: 1240, streak: 12 },
  { rank: 4, name: "Dilnoza Umarova", avatar: "DU", points: 980, streak: 8 },
  { rank: 5, name: "Eldor Hasanov", avatar: "EH", points: 720, streak: 5 },
  { rank: 6, name: "Feruza Alimova", avatar: "FA", points: 560, streak: 3 },
  { rank: 7, name: "Gulnora Saidova", avatar: "GS", points: 340, streak: 2 },
];

const makeLessons = (start: number, count: number, unlockedUpTo: number): Lesson[] =>
  Array.from({ length: count }, (_, i) => ({
    id: start + i,
    title: lessonTitles[start + i - 1] || `${start + i}-dars`,
    duration: `${12 + Math.floor(Math.random() * 20)}min`,
    completed: start + i <= unlockedUpTo - 1,
    unlocked: start + i <= unlockedUpTo,
  }));

const lessonTitles = [
  // Month 1 (1-12)
  "Python o'rnatish va muhit sozlash", "O'zgaruvchilar va ma'lumot turlari", "Satrlar va satr metodlari",
  "Sonlar va matematik amallar", "Ro'yxatlar va kortejlar", "Lug'atlar va to'plamlar",
  "Shartli operatorlar (if/elif/else)", "For va While tsikllari", "Funksiyalar asoslari",
  "Funksiya argumentlari va qaytarish", "Fayllar bilan ishlash", "Xatoliklarni boshqarish (try/except)",
  // Month 2 (13-24)
  "Modullar va paketlar", "Ro'yxat abstraktsiyalari", "Lambda funksiyalar",
  "Map, Filter, Reduce", "Obyektga yo'naltirilgan dasturlash", "Klasslar va obyektlar",
  "Meros va polimorfizm", "Dekoratorlar", "Generatorlar va iteratorlar",
  "Regulyar ifodalar", "JSON bilan ishlash", "Python loyiha: CLI To-Do Ilova",
  // Month 3 (25-36)
  "Veb dasturlash kirishi", "HTTP & REST asoslari", "Django o'rnatish va sozlash",
  "Django loyiha tuzilmasi", "URL marshrutlash va ko'rinishlar", "Django shablonlar asoslari",
  "Shablon merosligi", "Statik fayllar va media", "Django modellari va ORM",
  "Ma'lumotlar bazasi migratsiyalari", "Django admin paneli", "CRUD amallari",
  // Month 4 (37-48)
  "Django formalar", "Forma validatsiyasi", "Klassga asoslangan ko'rinishlar", "Autentifikatsiya tizimi",
  "Foydalanuvchi ro'yxatdan o'tishi", "Kirish va chiqish", "Ruxsatlar va guruhlar",
  "Django REST Framework kirishi", "Serializatorlar", "API ko'rinishlari va ViewSetlar",
  "API autentifikatsiyasi", "Loyiha: E-commerce Backend",
  // Month 5 (49-60)
  "E-commerce: Mahsulot modellari", "E-commerce: Savat mantiqiy qismi", "E-commerce: Buyurtma tizimi",
  "E-commerce: To'lov integratsiyasi", "E-commerce: Qidiruv va filtrlar",
  "E-commerce: Sharhlar va baholar", "E-commerce: Admin paneli",
  "E-commerce: API endpointlari", "E-commerce: Testlash asoslari",
  "E-commerce: Unit testlar", "E-commerce: Integratsiya testlari", "E-commerce: Deploy tayyorlash",
  // Month 6 (61-72)
  "PostgreSQL chuqur o'rganish", "Ma'lumotlar bazasi optimizatsiyasi", "So'rovlar samaradorligi",
  "Redis bilan keshlash", "Celery vazifalar navbati", "Fon vazifalari",
  "Email xabarnomalar", "Fayl yuklash va S3", "Docker asoslari",
  "Docker Compose Django uchun", "CI/CD asoslari", "E-commerce yakuniy loyiha ko'rigi",
  // Month 7 (73-84)
  "WebSocket asoslari", "Django Channels sozlash", "ASGI va WSGI farqi",
  "Real-time Chat: Modellar", "Real-time Chat: Consumerlar", "Real-time Chat: Marshrutlash",
  "Chat UI JavaScript bilan", "Guruh chat amalga oshirish", "Onlayn holat kuzatish",
  "Xabar o'qildi belgilari", "Chatda fayl almashish", "Chat xabarnomalar",
  // Month 8 (85-96)
  "Django ilg'or patternlar", "Maxsus Middleware", "Signal ishlov beruvchilari",
  "Ko'p ijarachi asoslari", "API tezlik cheklash", "Django bilan GraphQL",
  "Mikroservislar arxitekturasi", "Servislar aloqasi", "Hodisalarga asoslangan dizayn",
  "Monitoring va loglash", "Samaradorlik profillash", "Xavfsizlik eng yaxshi amaliyotlari",
  // Month 9 (97-108)
  "AWS/Bulut joylashtirish", "Nginx & Gunicorn", "SSL & Domen sozlash",
  "Kubernetes asoslari", "Masshtablash strategiyalari", "Ma'lumotlar bazasi replikatsiyasi",
  "Yakuniy loyiha rejalashtirish", "Yakuniy loyiha ishlab chiqish", "Kod ko'rigi va qayta ishlash",
  "Testlash va QA", "Productionga joylashtirish", "Kurs bitirish va keyingi qadamlar",
];

export const tiers: Tier[] = [
  {
    name: "Boshlang'ich",
    months: "1-2 oylar",
    badge: "basic",
    totalLessons: 24,
    modules: [
      { id: 1, month: 1, title: "Python asoslari", lessons: makeLessons(1, 12, 19) },
      { id: 2, month: 2, title: "Kengaytirilgan Python asoslari", lessons: makeLessons(13, 12, 19) },
    ],
  },
  {
    name: "O'rta",
    months: "3-6 oylar",
    badge: "intermediate",
    totalLessons: 48,
    modules: [
      { id: 3, month: 3, title: "Django asoslari", lessons: makeLessons(25, 12, 19) },
      { id: 4, month: 4, title: "Django REST & Autentifikatsiya", lessons: makeLessons(37, 12, 19) },
      { id: 5, month: 5, title: "E-commerce loyiha", lessons: makeLessons(49, 12, 19) },
      { id: 6, month: 6, title: "DevOps & Optimizatsiya", lessons: makeLessons(61, 12, 19) },
    ],
  },
  {
    name: "Yuqori",
    months: "7-9 oylar",
    badge: "advanced",
    totalLessons: 36,
    modules: [
      { id: 7, month: 7, title: "Real-time Chat loyiha", lessons: makeLessons(73, 12, 19) },
      { id: 8, month: 8, title: "Ilg'or patternlar", lessons: makeLessons(85, 12, 19) },
      { id: 9, month: 9, title: "Joylashtirish va bitirish", lessons: makeLessons(97, 12, 19) },
    ],
  },
];

export const sampleLessonContent = `
## Pythonda o'zgaruvchilar va ma'lumot turlari

Python **dinamik tiplangan** til bo'lib, o'zgaruvchi turlarini aniq e'lon qilish shart emas.

### Asosiy ma'lumot turlari

| Tur | Misol | Tavsif |
|------|---------|-------------|
| \`int\` | \`42\` | Butun sonlar |
| \`float\` | \`3.14\` | O'nlik kasrli sonlar |
| \`str\` | \`"salom"\` | Matnli satrlar |
| \`bool\` | \`True\` | Mantiqiy qiymatlar |

### O'zgaruvchilarga qiymat berish

\`\`\`python
# Oddiy qiymat berish
name = "Django Dasturchi"
age = 25
is_student = True
gpa = 3.8

# Ko'p o'zgaruvchiga qiymat berish
x, y, z = 1, 2, 3

# Turni tekshirish
print(type(name))   # <class 'str'>
print(type(age))    # <class 'int'>
\`\`\`

### Turni o'zgartirish

\`\`\`python
# Turlar o'rtasida o'zgartirish
num_str = "42"
num_int = int(num_str)    # Satrdan butun songa
num_float = float(num_str) # Satrdan o'nlik songa

# Noto'g'ri o'zgartirishga ehtiyot bo'ling!
try:
    invalid = int("salom")  # Bu ValueError chiqaradi
except ValueError as e:
    print(f"Xato: {e}")
\`\`\`

> 💡 **Maslahat:** Har doim tushunarli o'zgaruvchi nomlari ishlating. \`user_age\` \`x\` dan yaxshiroqdir.

### Amaliy topshiriq

Dastur yozing:
1. Talabaning ismi, yoshi va GPA uchun o'zgaruvchilar yarating
2. Barcha ma'lumotlarni formatlangan satr sifatida chiqaring
3. GPA ni foizga aylantiring (25 ga ko'paytiring)
`;

export const sampleCode = `# O'zgaruvchilar va ma'lumot turlari amaliyoti
# Quyidagi kodni to'ldiring

# 1. Talaba uchun o'zgaruvchilar yarating
student_name = "Ali"
student_age = 20
student_gpa = 3.6

# 2. Formatlangan ma'lumotni chiqaring
print(f"Talaba: {student_name}")
print(f"Yoshi: {student_age}")
print(f"GPA: {student_gpa}")

# 3. GPA ni foizga aylantiring
percentage = student_gpa * 25
print(f"Foiz: {percentage}%")
`;
