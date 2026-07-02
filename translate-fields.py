import os
import re

file = r'src/modules/fields/pages/CreateFieldPage.tsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

if 'useLanguage' not in content:
    content = content.replace(
        "import { fieldsApi } from '../api/fields.api';",
        "import { fieldsApi } from '../api/fields.api';\nimport { useLanguage } from '../../../core/context/LanguageContext';"
    )

dict_code = '''
// ─── Local Dictionary ────────────────────────────────────────────────────────
const DICT = {
  ar: {
    uploading: 'جاري الرفع...',
    uploadSuccess: 'تم الرفع بنجاح ✓',
    readyToUpload: 'جاهز للرفع',
    clickToChoose: 'اضغط لاختيار ملف',
    successMsg: 'تم إنشاء الملعب بنجاح! بانتظار موافقة الإدارة.',
    errorMsg: 'حدث خطأ أثناء إنشاء الملعب',
    btnIdle: 'تقديم طلب إدراج الملعب',
    btnUploadingLicense: 'جاري رفع رخصة الملعب...',
    btnUploadingPhoto: 'جاري رفع صورة الملعب...',
    btnSaving: 'جاري حفظ بيانات الملعب...',
    btnDone: 'تم!',
    title: 'إضافة ملعب جديد',
    subtitle: 'قم بإدخال مواصفات ملعبك بدقة ليتم عرضه للاعبين في النظام.',
    secBasic: 'المعلومات الأساسية والمستندات',
    lblName: 'اسم الملعب',
    plhName: 'مثال: ملعب سانتياغو الخماسي',
    lblLicense: 'رخصة الملعب',
    hintLicense: 'PDF, JPG, PNG — يُرفع قبل الحفظ تلقائياً',
    lblPhoto: 'الصورة الرئيسية للملعب',
    hintPhoto: 'JPG, PNG, WEBP — حجم أقصى 5MB',
    secLoc: 'تفاصيل الموقع',
    lblGov: 'المحافظة',
    plhGov: 'المنوفية',
    lblCity: 'المدينة',
    plhCity: 'مدينة السادات',
    lblVillage: 'القرية / المنطقة',
    plhVillage: 'المنطقة الرابعة',
    lblAddress: 'العنوان بالتفصيل',
    plhAddress: 'شارع الجامعة، بجوار السنتر',
    lblLat: 'خط العرض (Latitude)',
    lblLng: 'خط الطول (Longitude)',
    secPricing: 'المواصفات والأسعار',
    lblPriceAm: 'سعر الساعة — صباحاً (ج.م)',
    lblPricePm: 'سعر الساعة — مساءً (ج.م)',
    lblSize: 'حجم الملعب',
    size5: 'خماسي (5-a-side)',
    size7: 'سباعي (7-a-side)',
    size11: 'قانوني (11-a-side)',
    lblSurface: 'نوع الأرضية',
    surfaceArt: 'نجيل صناعي',
    surfaceNat: 'نجيل طبيعي',
    surfaceHyb: 'هجين',
    lblCapacity: 'السعة (عدد اللاعبين)',
    secSettings: 'الإعدادات والمرافق',
    lblTimes: 'مواعيد العمل',
    lblOpen: 'وقت الفتح',
    lblClose: 'وقت الإغلاق',
    lblAmenities: 'المرافق والخدمات المتاحة',
    amLight: 'إضاءة كاشفة ليلية',
    amPark: 'موقف سيارات آمن',
    amChange: 'غرف تغيير ملابس',
    amShower: 'حمامات ودش واستحمام',
    amCafe: 'بوفيه / كافتيريا مشروبات',
  },
  en: {
    uploading: 'Uploading...',
    uploadSuccess: 'Uploaded successfully ✓',
    readyToUpload: 'Ready to upload',
    clickToChoose: 'Click to choose file',
    successMsg: 'Field created successfully! Waiting for admin approval.',
    errorMsg: 'An error occurred while creating the field',
    btnIdle: 'Submit Field Application',
    btnUploadingLicense: 'Uploading License...',
    btnUploadingPhoto: 'Uploading Photo...',
    btnSaving: 'Saving Field Data...',
    btnDone: 'Done!',
    title: 'Add New Field',
    subtitle: 'Enter your field specifications accurately to display to players in the system.',
    secBasic: 'Basic Info & Documents',
    lblName: 'Field Name',
    plhName: 'e.g., Santiago 5-a-side',
    lblLicense: 'Field License',
    hintLicense: 'PDF, JPG, PNG — Auto uploaded before saving',
    lblPhoto: 'Main Field Photo',
    hintPhoto: 'JPG, PNG, WEBP — Max size 5MB',
    secLoc: 'Location Details',
    lblGov: 'Governorate',
    plhGov: 'Monufia',
    lblCity: 'City',
    plhCity: 'Sadat City',
    lblVillage: 'Village / Area',
    plhVillage: 'Fourth District',
    lblAddress: 'Detailed Address',
    plhAddress: 'University St, next to the center',
    lblLat: 'Latitude',
    lblLng: 'Longitude',
    secPricing: 'Specifications & Pricing',
    lblPriceAm: 'Price/Hour — AM (EGP)',
    lblPricePm: 'Price/Hour — PM (EGP)',
    lblSize: 'Field Size',
    size5: '5-a-side',
    size7: '7-a-side',
    size11: '11-a-side (Standard)',
    lblSurface: 'Surface Type',
    surfaceArt: 'Artificial Turf',
    surfaceNat: 'Natural Grass',
    surfaceHyb: 'Hybrid Turf',
    lblCapacity: 'Capacity (Players)',
    secSettings: 'Settings & Amenities',
    lblTimes: 'Working Hours',
    lblOpen: 'Opening Time',
    lblClose: 'Closing Time',
    lblAmenities: 'Available Amenities & Services',
    amLight: 'Floodlights (Night)',
    amPark: 'Secure Parking',
    amChange: 'Changing Rooms',
    amShower: 'Showers',
    amCafe: 'Cafeteria / Beverages',
  }
};
'''

if 'const DICT' not in content:
    content = content.replace(
        "// ─── Main Component ───────────────────────────────────────────────────────────",
        dict_code + "\n// ─── Main Component ───────────────────────────────────────────────────────────"
    )

if 'const { lang } = useLanguage()' not in content:
    content = content.replace(
        "export function CreateFieldPage() {\n    const navigate = useNavigate();",
        "export function CreateFieldPage() {\n    const { lang } = useLanguage();\n    const d = DICT[lang];\n    const navigate = useNavigate();"
    )
    
    content = re.sub(
        r"function FilePicker\(\{.*?\}\) \{",
        "function FilePicker({ label, hint, accept, file, onChange, uploading, uploaded, icon: Icon }: { label: string; hint?: string; accept: string; file: File | null; onChange: (f: File | null) => void; uploading?: boolean; uploaded?: boolean; icon: any; }) {\n    const { lang } = useLanguage();\n    const d = DICT[lang];",
        content,
        flags=re.DOTALL
    )

content = content.replace("'جاري الرفع...'", "d.uploading")
content = content.replace(">جاري الرفع...<", ">{d.uploading}<")
content = content.replace(">تم الرفع بنجاح ✓<", ">{d.uploadSuccess}<")
content = content.replace("— جاهز للرفع", "— {d.readyToUpload}")
content = content.replace(">اضغط لاختيار ملف<", ">{d.clickToChoose}<")
content = content.replace("'تم إنشاء الملعب بنجاح! بانتظار موافقة الإدارة.'", "d.successMsg")
content = content.replace("'حدث خطأ أثناء إنشاء الملعب'", "d.errorMsg")

content = content.replace("'تقديم طلب إدراج الملعب'", "d.btnIdle")
content = content.replace("'جاري رفع رخصة الملعب...'", "d.btnUploadingLicense")
content = content.replace("'جاري رفع صورة الملعب...'", "d.btnUploadingPhoto")
content = content.replace("'جاري حفظ بيانات الملعب...'", "d.btnSaving")
content = content.replace("'تم!'", "d.btnDone")

content = content.replace(">إضافة ملعب جديد<", ">{d.title}<")
content = re.sub(r">\s*قم بإدخال مواصفات ملعبك بدقة ليتم عرضه للاعبين في النظام\.\s*<", ">{d.subtitle}<", content)

content = content.replace(">المعلومات الأساسية والمستندات<", ">{d.secBasic}<")
content = content.replace("اسم الملعب ", "{d.lblName} ")
content = content.replace('"مثال: ملعب سانتياغو الخماسي"', 'd.plhName')

content = content.replace('"رخصة الملعب"', 'd.lblLicense')
content = content.replace('"PDF, JPG, PNG — يُرفع قبل الحفظ تلقائياً"', 'd.hintLicense')
content = content.replace('"الصورة الرئيسية للملعب"', 'd.lblPhoto')
content = content.replace('"JPG, PNG, WEBP — حجم أقصى 5MB"', 'd.hintPhoto')

content = content.replace(">تفاصيل الموقع<", ">{d.secLoc}<")
content = content.replace("المحافظة ", "{d.lblGov} ")
content = content.replace('"المنوفية"', 'd.plhGov')
content = content.replace("المدينة ", "{d.lblCity} ")
content = content.replace('"مدينة السادات"', 'd.plhCity')
content = content.replace(">القرية / المنطقة<", ">{d.lblVillage}<")
content = content.replace('"المنطقة الرابعة"', 'd.plhVillage')
content = content.replace("العنوان بالتفصيل ", "{d.lblAddress} ")
content = content.replace('"شارع الجامعة، بجوار السنتر"', 'd.plhAddress')

content = content.replace(">خط العرض (Latitude)<", ">{d.lblLat}<")
content = content.replace(">خط الطول (Longitude)<", ">{d.lblLng}<")

content = content.replace(">المواصفات والأسعار<", ">{d.secPricing}<")
content = content.replace(">سعر الساعة — صباحاً (ج.م)<", ">{d.lblPriceAm}<")
content = content.replace(">سعر الساعة — مساءً (ج.م)<", ">{d.lblPricePm}<")
content = content.replace(">حجم الملعب<", ">{d.lblSize}<")

content = content.replace(">خماسي (5-a-side)<", ">{d.size5}<")
content = content.replace(">سباعي (7-a-side)<", ">{d.size7}<")
content = content.replace(">قانوني (11-a-side)<", ">{d.size11}<")

content = content.replace(">نوع الأرضية<", ">{d.lblSurface}<")
content = content.replace(">نجيل صناعي<", ">{d.surfaceArt}<")
content = content.replace(">نجيل طبيعي<", ">{d.surfaceNat}<")
content = content.replace(">هجين<", ">{d.surfaceHyb}<")
content = content.replace(">السعة (عدد اللاعبين)<", ">{d.lblCapacity}<")

content = content.replace(">الإعدادات والمرافق<", ">{d.secSettings}<")
content = content.replace("> مواعيد العمل<", "> {d.lblTimes}<")
content = content.replace(" مواعيد العمل", " {d.lblTimes}")
content = content.replace(">وقت الفتح<", ">{d.lblOpen}<")
content = content.replace(">وقت الإغلاق<", ">{d.lblClose}<")
content = content.replace(" المرافق والخدمات المتاحة", " {d.lblAmenities}")

content = content.replace('"إضاءة كاشفة ليلية"', 'd.amLight')
content = content.replace('"موقف سيارات آمن"', 'd.amPark')
content = content.replace('"غرف تغيير ملابس"', 'd.amChange')
content = content.replace('"حمامات ودش واستحمام"', 'd.amShower')
content = content.replace('"بوفيه / كافتيريا مشروبات"', 'd.amCafe')

content = content.replace('dir="rtl"', 'dir={lang === "ar" ? "rtl" : "ltr"}')

content = content.replace('placeholder=d.plhName', 'placeholder={d.plhName}')
content = content.replace('placeholder=d.plhGov', 'placeholder={d.plhGov}')
content = content.replace('placeholder=d.plhCity', 'placeholder={d.plhCity}')
content = content.replace('placeholder=d.plhVillage', 'placeholder={d.plhVillage}')
content = content.replace('placeholder=d.plhAddress', 'placeholder={d.plhAddress}')

content = content.replace('label=d.lblLicense', 'label={d.lblLicense}')
content = content.replace('hint=d.hintLicense', 'hint={d.hintLicense}')
content = content.replace('label=d.lblPhoto', 'label={d.lblPhoto}')
content = content.replace('hint=d.hintPhoto', 'hint={d.hintPhoto}')

content = content.replace('label=d.amLight', 'label={d.amLight}')
content = content.replace('label=d.amPark', 'label={d.amPark}')
content = content.replace('label=d.amChange', 'label={d.amChange}')
content = content.replace('label=d.amShower', 'label={d.amShower}')
content = content.replace('label=d.amCafe', 'label={d.amCafe}')

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
