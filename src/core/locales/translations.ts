export type Language = 'ar' | 'en';

export const translations = {
  // ─── Navbar & Menu ──────────────────────────────────────────────────────────
  'nav.home': { ar: 'الرئيسية', en: 'Home' },
  'nav.fields': { ar: 'الملاعب', en: 'Fields' },
  'nav.tournaments': { ar: 'البطولات', en: 'Tournaments' },
  'nav.bookings': { ar: 'حجوزاتي', en: 'Bookings' },
  
  'menu.profile': { ar: 'الملف الشخصي', en: 'Profile' },
  'menu.favorites': { ar: 'المفضلة', en: 'Favorites' },
  'menu.myTournaments': { ar: 'بطولاتي', en: 'My Tournaments' },
  'menu.settings': { ar: 'إعدادات الإشعارات', en: 'Notification Settings' },
  'menu.logout': { ar: 'تسجيل الخروج', en: 'Logout' },
  'menu.login': { ar: 'تسجيل الدخول', en: 'Login' },

  // ─── Dashboard Hero ─────────────────────────────────────────────────────────
  'hero.title': { ar: 'احجز ملعب كرة القدم بسهولة', en: 'Book Football Fields Easily' },
  'hero.subtitle': { ar: 'ابحث عن أفضل ملاعب كرة القدم في منطقتك واحجزها، وانضم إلى البطولات واجمع النقاط والعب مع أصدقائك.', en: 'Find and book the best football fields in your area, join tournaments, earn points, and play with friends.' },
  'search.placeholder': { ar: 'أين تريد أن تلعب؟', en: 'Where do you want to play?' },
  'search.button': { ar: 'بحث', en: 'Search' },

  // ─── Dashboard Quick Actions ────────────────────────────────────────────────
  'action.friendly.title': { ar: 'ابدأ مباراة ودية', en: 'Start a Friendly Match' },
  'action.friendly.subtitle': { ar: 'أنشئ مباراة وادعُ أصدقاءك للعب', en: 'Create a match and invite friends to play' },
  'action.friendly.btn': { ar: 'إنشاء', en: 'Create' },
  
  'action.tournament.title': { ar: 'انضم إلى بطولة', en: 'Join a Tournament' },
  'action.tournament.subtitle': { ar: 'نافس الآخرين واربح الجوائز', en: 'Compete and win prizes' },
  'action.tournament.btn': { ar: 'انضمام', en: 'Join' },

  // ─── Dashboard Sections ─────────────────────────────────────────────────────
  'section.fields.title': { ar: 'الملاعب الشائعة', en: 'Popular Fields' },
  'section.fields.subtitle': { ar: 'احجز ملعبك المفضل اليوم', en: 'Book your favorite field today' },
  'section.fields.empty.title': { ar: 'لا توجد ملاعب متاحة', en: 'No Fields Available' },
  'section.fields.empty.desc': { ar: 'ستظهر الملاعب الشائعة هنا عند توفر ملاعب معتمدة في منطقتك.', en: 'Popular fields will appear here when certified fields are available in your area.' },
  
  'section.tournaments.title': { ar: 'البطولات القادمة', en: 'Upcoming Tournaments' },
  'section.tournaments.subtitle': { ar: 'نافس واجمع النقاط', en: 'Compete and earn points' },

  'common.viewAll': { ar: 'عرض الكل', en: 'View All' },
  'common.joinTournament': { ar: 'الضم إلى البطولة', en: 'Join Tournament' },
  'common.teamsJoined': { ar: 'الفرق المنضمة', en: 'Teams Joined' },
  'common.prizePool': { ar: 'قيمة الجوائز', en: 'Prize Pool' },
  
  // ─── Auth: Login ────────────────────────────────────────────────────────────
  'auth.login.title': { ar: 'مرحباً بعودتك!', en: 'Welcome Back!' },
  'auth.login.subtitle': { ar: 'سجل دخولك لحجز ملعبك وإدارة مبارياتك', en: 'Login to book your field and manage your matches' },
  'auth.login.method.phone': { ar: 'رقم الهاتف', en: 'Phone Number' },
  'auth.login.method.email': { ar: 'البريد الإلكتروني', en: 'Email' },
  'auth.login.input.phone': { ar: 'رقم الهاتف', en: 'Phone Number' },
  'auth.login.input.email': { ar: 'البريد الإلكتروني', en: 'Email' },
  'auth.login.input.password': { ar: 'كلمة المرور', en: 'Password' },
  'auth.login.forgotPassword': { ar: 'نسيت كلمة المرور؟', en: 'Forgot Password?' },
  'auth.login.btn': { ar: 'تسجيل الدخول', en: 'Login' },
  'auth.login.loading': { ar: 'جاري تسجيل الدخول...', en: 'Logging in...' },
  'auth.login.noAccount': { ar: 'ليس لديك حساب؟', en: 'Don\'t have an account?' },
  'auth.login.registerNow': { ar: 'سجل الآن', en: 'Register Now' },
  'auth.login.player': { ar: 'حساب لاعب', en: 'Player Account' },
  'auth.login.owner': { ar: 'حساب مالك ملعب', en: 'Owner Account' },
  'auth.login.ownerPrompt': { ar: 'هل أنت صاحب ملعب؟', en: 'Are you a field owner?' },
  'auth.login.registerHere': { ar: 'سجل من هنا', en: 'Register here' },

  // ─── Auth: Reset Password ───────────────────────────────────────────────────
  'auth.reset.title': { ar: 'إعادة تعيين كلمة المرور', en: 'Reset Password' },
  'auth.reset.subtitle': { ar: 'أدخل رمز التحقق المرسل إلى بريدك الإلكتروني وكلمة المرور الجديدة لتأمين حسابك.', en: 'Enter the verification code sent to your email and the new password to secure your account.' },
  'auth.reset.otpCode': { ar: 'رمز التحقق', en: 'Verification Code' },
  'auth.reset.newPassword': { ar: 'كلمة المرور الجديدة', en: 'New Password' },
  'auth.reset.confirmPassword': { ar: 'تأكيد كلمة المرور الجديدة', en: 'Confirm New Password' },
  'auth.reset.btn': { ar: 'تأكيد كلمة المرور', en: 'Confirm Password' },
  'auth.reset.loading': { ar: 'جاري الحفظ...', en: 'Saving...' },
  'auth.reset.backToLogin': { ar: 'العودة لتسجيل الدخول', en: 'Back to Login' },

  // ─── Positions ──────────────────────────────────────────────────────────────
  'goalkeeper': { ar: 'حارس مرمى', en: 'Goalkeeper' },
  'defender': { ar: 'مدافع', en: 'Defender' },
  'midfielder': { ar: 'وسط ميدان', en: 'Midfielder' },
  'winger': { ar: 'جناح', en: 'Winger' },
  'forward': { ar: 'مهاجم', en: 'Forward' },
};

export type TranslationKey = keyof typeof translations;
