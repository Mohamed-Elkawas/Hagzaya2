import os
import re

file = r'src/modules/tournaments/pages/CreateTournament.tsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

if 'useLanguage' not in content:
    content = content.replace(
        "import { tournamentsApi, fieldsApi } from '../api/api';",
        "import { tournamentsApi, fieldsApi } from '../api/api';\nimport { useLanguage } from '../../../core/context/LanguageContext';"
    )

dict_code = '''
// ─── Local Dictionary ────────────────────────────────────────────────────────
const DICT = {
  ar: {
    type5: 'كرة 5 (خماسي)',
    type7: 'كرة 7 (سباعي)',
    type11: 'كرة 11 (مفتوح)',
    errName: 'اسم البطولة يجب أن يكون 3 أحرف على الأقل',
    errPrize: 'الجائزة مطلوبة',
    errDesc: 'الوصف يجب أن يكون 10 أحرف على الأقل',
    errPrice: 'أدخل رسوم تسجيل صحيحة',
    errType: 'اختر نوع البطولة',
    errStartDate: 'تاريخ البداية مطلوب',
    errEndDate: 'تاريخ النهاية مطلوب',
    errEndDateAfter: 'تاريخ النهاية يجب أن يكون بعد البداية',
    errFieldId: 'معرّف الملعب مطلوب',
    errSubmit: 'حدث خطأ أثناء إنشاء البطولة',
    successTitle: 'تم إنشاء البطولة! 🎉',
    successDesc: 'تم إنشاء البطولة "{name}" بنجاح. يمكنك الآن إدارتها وقبول تسجيلات الفرق.',
    btnView: 'عرض البطولة',
    btnBack: 'العودة للقائمة',
    btnBackTop: 'العودة للبطولات',
    title: 'إنشاء بطولة جديدة',
    subtitle: 'أنشئ بطولتك واستقبل تسجيلات الفرق',
    secBasic: 'معلومات البطولة الأساسية',
    lblName: 'اسم البطولة',
    plhName: 'مثال: October Weekend League',
    lblDesc: 'وصف البطولة',
    hintDesc: 'أضف تفاصيل تساعد الفرق على معرفة طبيعة البطولة',
    plhDesc: 'اكتب وصفاً شاملاً يحتوي على قواعد البطولة والتفاصيل الهامة...',
    lblType: 'نوع البطولة',
    secTeams: 'إعدادات الفرق',
    lblTeamsCount: 'عدد الفرق المشاركة',
    teamWord: 'فريق',
    groupsWord: 'مجموعات',
    teamsDesc1: 'مع {count} فريق: {groups} مجموعات × 4 فرق',
    teamsDesc2: '— أعلى فريقين من كل مجموعة يتأهلان للدور الإقصائي',
    secPrizes: 'الجوائز والرسوم',
    lblPrize: 'الجائزة الكبرى',
    plhPrize: 'مثال: EGP 15,000',
    lblPrice: 'رسوم التسجيل (جنيه)',
    secDateLoc: 'الموعد والمكان',
    lblStartDate: 'تاريخ البداية',
    lblEndDate: 'تاريخ النهاية',
    secField: 'الملعب',
    lblField: 'اختر الملعب',
    hintNoFields: 'لا توجد ملاعب مسجلة — أضف ملعبك أولاً من صفحة الملاعب',
    loadingFields: 'جار تحميل ملاعبك...',
    optSelectField: '-- اختر الملعب --',
    plhFieldId: 'أدخل معرّف الملعب يدوياً...',
    previewTitle: 'معاينة البطولة',
    lblPrevName: 'الاسم',
    lblPrevType: 'النوع',
    lblPrevTeams: 'عدد الفرق',
    lblPrevPrize: 'الجائزة',
    lblPrevPrice: 'الاشتراك',
    lblPrevField: 'الملعب',
    valFree: 'مجاناً',
    valEgp: 'ج.م',
    valNone: '—',
    valSelected: 'محدد',
    valNotSelected: 'غير محدد',
    btnCreate: 'إنشاء البطولة',
    btnCreating: 'جاري الإنشاء...'
  },
  en: {
    type5: '5-a-side',
    type7: '7-a-side',
    type11: '11-a-side',
    errName: 'Tournament name must be at least 3 characters',
    errPrize: 'Prize is required',
    errDesc: 'Description must be at least 10 characters',
    errPrice: 'Enter valid registration fee',
    errType: 'Select tournament type',
    errStartDate: 'Start date is required',
    errEndDate: 'End date is required',
    errEndDateAfter: 'End date must be after start date',
    errFieldId: 'Field ID is required',
    errSubmit: 'An error occurred while creating tournament',
    successTitle: 'Tournament Created! 🎉',
    successDesc: 'Tournament "{name}" created successfully. You can now manage it and accept registrations.',
    btnView: 'View Tournament',
    btnBack: 'Back to List',
    btnBackTop: 'Back to Tournaments',
    title: 'Create New Tournament',
    subtitle: 'Create your tournament and accept team registrations',
    secBasic: 'Basic Tournament Information',
    lblName: 'Tournament Name',
    plhName: 'e.g., October Weekend League',
    lblDesc: 'Tournament Description',
    hintDesc: 'Add details to help teams understand the tournament',
    plhDesc: 'Write a comprehensive description with rules and important details...',
    lblType: 'Tournament Type',
    secTeams: 'Teams Settings',
    lblTeamsCount: 'Number of Participating Teams',
    teamWord: 'Team',
    groupsWord: 'Groups',
    teamsDesc1: 'With {count} teams: {groups} groups × 4 teams',
    teamsDesc2: '— Top two teams from each group qualify to knockouts',
    secPrizes: 'Prizes & Fees',
    lblPrize: 'Grand Prize',
    plhPrize: 'e.g., 15,000 EGP',
    lblPrice: 'Registration Fee (EGP)',
    secDateLoc: 'Date & Location',
    lblStartDate: 'Start Date',
    lblEndDate: 'End Date',
    secField: 'Field',
    lblField: 'Select Field',
    hintNoFields: 'No registered fields — add your field first from Fields page',
    loadingFields: 'Loading your fields...',
    optSelectField: '-- Select Field --',
    plhFieldId: 'Enter Field ID manually...',
    previewTitle: 'Tournament Preview',
    lblPrevName: 'Name',
    lblPrevType: 'Type',
    lblPrevTeams: 'Teams',
    lblPrevPrize: 'Prize',
    lblPrevPrice: 'Fee',
    lblPrevField: 'Field',
    valFree: 'Free',
    valEgp: 'EGP',
    valNone: '—',
    valSelected: 'Selected',
    valNotSelected: 'Not Selected',
    btnCreate: 'Create Tournament',
    btnCreating: 'Creating...'
  }
};
'''

if 'const DICT' not in content:
    content = content.replace(
        "export function CreateTournament() {",
        dict_code + "\nexport function CreateTournament() {\n    const { lang } = useLanguage();\n    const d = DICT[lang];"
    )

# Use dynamic TOURNAMENT_TYPES
content = content.replace(
    "const TOURNAMENT_TYPES = [",
    "const getTournamentTypes = (d: any) => ["
)
content = content.replace("'كرة 5 (خماسي)'", "d.type5")
content = content.replace("'كرة 7 (سباعي)'", "d.type7")
content = content.replace("'كرة 11 (مفتوح)'", "d.type11")

# Update usage of TOURNAMENT_TYPES
content = content.replace("TOURNAMENT_TYPES.map", "getTournamentTypes(d).map")
content = content.replace("TOURNAMENT_TYPES.find", "getTournamentTypes(d).find")

# Validation errors
content = content.replace("'اسم البطولة يجب أن يكون 3 أحرف على الأقل'", "d.errName")
content = content.replace("'الجائزة مطلوبة'", "d.errPrize")
content = content.replace("'الوصف يجب أن يكون 10 أحرف على الأقل'", "d.errDesc")
content = content.replace("'أدخل رسوم تسجيل صحيحة'", "d.errPrice")
content = content.replace("'اختر نوع البطولة'", "d.errType")
content = content.replace("'تاريخ البداية مطلوب'", "d.errStartDate")
content = content.replace("'تاريخ النهاية مطلوب'", "d.errEndDate")
content = content.replace("'تاريخ النهاية يجب أن يكون بعد البداية'", "d.errEndDateAfter")
content = content.replace("'معرّف الملعب مطلوب'", "d.errFieldId")
content = content.replace("'حدث خطأ أثناء إنشاء البطولة'", "d.errSubmit")

# Success UI
content = content.replace(">تم إنشاء البطولة! 🎉<", ">{d.successTitle}<")
content = content.replace("تم إنشاء البطولة \"{form.name}\" بنجاح. يمكنك الآن إدارتها وقبول تسجيلات الفرق.", "{d.successDesc.replace('{name}', form.name)}")
content = content.replace(">عرض البطولة<", ">{d.btnView}<")
content = content.replace(">العودة للقائمة<", ">{d.btnBack}<")

# Page headers
content = content.replace("> العودة للبطولات<", "> {d.btnBackTop}<")
content = content.replace(">إنشاء بطولة جديدة<", ">{d.title}<")
content = content.replace(">أنشئ بطولتك واستقبل تسجيلات الفرق<", ">{d.subtitle}<")

# Section: Basic
content = content.replace('title="معلومات البطولة الأساسية"', 'title={d.secBasic}')
content = content.replace('label="اسم البطولة"', 'label={d.lblName}')
content = content.replace('placeholder="مثال: October Weekend League"', 'placeholder={d.plhName}')
content = content.replace('label="وصف البطولة"', 'label={d.lblDesc}')
content = content.replace('hint="أضف تفاصيل تساعد الفرق على معرفة طبيعة البطولة"', 'hint={d.hintDesc}')
content = content.replace('placeholder="اكتب وصفاً شاملاً يحتوي على قواعد البطولة والتفاصيل الهامة..."', 'placeholder={d.plhDesc}')
content = content.replace('label="نوع البطولة"', 'label={d.lblType}')

# Section: Teams
content = content.replace('title="إعدادات الفرق"', 'title={d.secTeams}')
content = content.replace('label="عدد الفرق المشاركة"', 'label={d.lblTeamsCount}')
content = content.replace(">فريق<", ">{d.teamWord}<")
content = content.replace(" مجموعات", " {d.groupsWord}")
content = content.replace("مع {form.numberOfTeams} فريق: {form.numberOfTeams / 4} مجموعات × 4 فرق", "{d.teamsDesc1.replace('{count}', String(form.numberOfTeams)).replace('{groups}', String(form.numberOfTeams / 4))}")
content = content.replace("— أعلى فريقين من كل مجموعة يتأهلان للدور الإقصائي", "{d.teamsDesc2}")

# Section: Prizes
content = content.replace('title="الجوائز والرسوم"', 'title={d.secPrizes}')
content = content.replace('label="الجائزة الكبرى"', 'label={d.lblPrize}')
content = content.replace('placeholder="مثال: EGP 15,000"', 'placeholder={d.plhPrize}')
content = content.replace('label="رسوم التسجيل (جنيه)"', 'label={d.lblPrice}')

# Section: Date & Location
content = content.replace('title="الموعد والمكان"', 'title={d.secDateLoc}')
content = content.replace('label="تاريخ البداية"', 'label={d.lblStartDate}')
content = content.replace('label="تاريخ النهاية"', 'label={d.lblEndDate}')

# Section: Field
content = content.replace('title="الملعب"', 'title={d.secField}')
content = content.replace('label="اختر الملعب"', 'label={d.lblField}')
content = content.replace("'لا توجد ملاعب مسجلة — أضف ملعبك أولاً من صفحة الملاعب'", "d.hintNoFields")
content = content.replace(">جار تحميل ملاعبك...<", ">{d.loadingFields}<")
content = content.replace(">-- اختر الملعب --<", ">{d.optSelectField}<")
content = content.replace('placeholder="أدخل معرّف الملعب يدوياً..."', 'placeholder={d.plhFieldId}')

# Preview Section
content = content.replace("> معاينة البطولة<", "> {d.previewTitle}<")
content = content.replace("{ label: 'الاسم',", "{ label: d.lblPrevName,")
content = content.replace("{ label: 'النوع',", "{ label: d.lblPrevType,")
content = content.replace("{ label: 'عدد الفرق',", "{ label: d.lblPrevTeams,")
content = content.replace("{ label: 'الجائزة',", "{ label: d.lblPrevPrize,")
content = content.replace("{ label: 'الاشتراك',", "{ label: d.lblPrevPrice,")
content = content.replace("{ label: 'الملعب',", "{ label: d.lblPrevField,")

content = content.replace("'—'", "d.valNone")
content = content.replace("'محدد'", "d.valSelected")
content = content.replace("'غير محدد'", "d.valNotSelected")
content = content.replace("'مجاناً'", "d.valFree")
content = content.replace("'ج.م'", "d.valEgp")

content = content.replace(">جاري الإنشاء...<", ">{d.btnCreating}<")
content = content.replace(">إنشاء البطولة<", ">{d.btnCreate}<")

content = content.replace('dir="rtl"', 'dir={lang === "ar" ? "rtl" : "ltr"}')

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
