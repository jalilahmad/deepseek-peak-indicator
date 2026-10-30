<p align="center">
  <img src="https://raw.githubusercontent.com/jalilahmad/deepseek-peak-indicator/main/assets/readme-banner.png" alt="نشانگر پیک DeepSeek — بدانید قیمت‌گذاری API DeepSeek در حالت پیک است یا خارج از پیک." />
</p>

# نشانگر پیک DeepSeek

[English](README.md) · **فارسی** · [简体中文](README.zh-CN.md)

![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-0.2.1--rc.5-0f2a44)
![Tests](https://img.shields.io/badge/tests-22%2F22-16a34a)
![License](https://img.shields.io/badge/license-MIT-0d9488)

یک افزونه سبک برای DeepSeek Harness که **دوره قیمت‌گذاری کنونی API DeepSeek** — پیک یا خارج از پیک — را
مستقیماً در پاورقی نوار کناری، از همان آغاز اجرای برنامه و بدون باز بودن هیچ Session، نشان می‌دهد.
با کلیک روی آن، **شمارش معکوس تا گذار بعدی قیمت‌گذاری** را می‌بینید.

این افزونه به کلید API نیاز ندارد، هیچ درخواست شبکه‌ای نمی‌فرستد و هیچ چیزی را به‌طور دوره‌ای نمی‌پرسد (polling): زمان‌بندی
به‌صورت محلی از ساعت سیستم و یک تقویم تعطیلات عمومی چینِ تأییدشده که همراه بسته عرضه می‌شود محاسبه می‌شود.

> **«پیک» به معنای دوره رسمی قیمت‌گذاری API است، نه ازدحام یا سلامت سرور.**
> این نشانگر تنها دوره صورت‌حسابی را که DeepSeek تعریف کرده گزارش می‌کند و هیچ چیزی درباره بار API،
> تأخیر یا دسترس‌پذیری نمی‌گوید. قیمت پیک همان نرخ بالاتر **پیک** است؛ خارج از پیک نرخ نیم‌بها است.

---

## نصب

**نیازمند DeepSeek Harness Desktop v0.2.1-rc.5** — همان نسخه‌ای که این انتشار بر اساس آن ساخته و آزمون
شده است. هیچ زمان اجرای اضافی، مرحله build یا وابستگی npm لازم نیست.

نام بسته `@jalilahmad.fazeli/deepseek-peak-indicator` است. آن را از npm یا مستقیماً از GitHub نصب کنید:

### نصب از npm

```powershell
dsh plugin --profile web add @jalilahmad.fazeli/deepseek-peak-indicator
```

### نصب از GitHub

```powershell
dsh plugin --profile web add github:jalilahmad/deepseek-peak-indicator
```

پس از نصب، Harness Web GUI را دوباره بارگذاری کنید (یا DeepSeek Harness Desktop را از نو راه‌اندازی
کنید). اگر Harness دارای HMR باشد، معمولاً یک تازه‌سازی صفحه کافی است.

<details>
<summary>نصب از طریق Plugin Manager</summary>

1. در نوار کناری Harness، **Plugins** را باز کنید.
2. **Add plugin** → **Install a third-party plugin** را انتخاب کنید.
3. نام بسته npm یعنی `@jalilahmad.fazeli/deepseek-peak-indicator` یا مشخصه GitHub یعنی
   `github:jalilahmad/deepseek-peak-indicator` را وارد کنید و نصب را انجام دهید.
4. مطمئن شوید بسته روی **On** است، سپس صفحه را دوباره بارگذاری کنید.

</details>

---

## ویژگی‌ها

- **یک نگاه، سه حالت** — 🟢 `OFF-PEAK`، 🔴 `PEAK`، ⚪ `UNKNOWN`.
- **شمارش معکوس تا گذار بعدی** — پنجره بازشو زمان باقی‌مانده را به ساعت و دقیقه کامل نشان می‌دهد.
- **مرزهای دقیق** — وضعیت درست در مرز رسمی دوره تغییر می‌کند؛ شمارش معکوس هر دقیقه یک بار تازه
  می‌شود و یک تایمر دقیق، خودِ گذار را انجام می‌دهد.
- **همیشه حاضر** — یک مدخل پاورقی نوار کناری با دامنه ریشه که پیش از باز شدن هر Session،
  Conversation یا Composer وجود دارد.
- **آگاه به تعطیلات** — تاریخ‌های تأییدشده تعطیلات عمومی چین برای 2025 و 2026؛ سالی که تأیید نشده باشد
  صادقانه **UNKNOWN** گزارش می‌شود و هرگز حدس زده نمی‌شود.
- **ایمن از نظر منطقه زمانی** — زمان‌بندی در UTC ارزیابی می‌شود، تاریخ تعطیلات در وقت استاندارد چین، و
  همه تبدیل‌ها از پایگاه داده IANA مرورگر (`Intl`) استفاده می‌کنند (بدون آفست ثابت، ایمن در برابر DST).
- **کوچک و خصوصی** — یک بسته Client، یک ردیف Host، یک تایمر 60 ثانیه‌ای به‌علاوه یک تایمر گذار؛ بدون
  کلید API، بک‌اند، پایگاه داده، تله‌متری یا polling شبکه.
- **چرخه عمر تمیز** — تایمرها، شنونده‌ها، ناظرها و استایل‌ها همه هنگام تخلیه آزاد می‌شوند؛ بارگذاری
  مجدد دقیقاً یک نشانگر می‌سازد.

---

## تصاویر

این‌ها تصاویر واقعی DeepSeek Harness Desktop v0.2.1-rc.5 هستند که این افزونه را اجرا می‌کند. نام فضاهای
کاری و عنوان نشست‌ها برای حفظ حریم خصوصی تار شده‌اند.

**برنامه کامل — نشانگر در پاورقی نوار کناری**

![پنجره کامل DeepSeek Harness با نشانگر OFF-PEAK در پاورقی نوار کناری](docs/screenshots/01-indicator-sidebar.png)

**حالت OFF-PEAK همراه با پنجره بازشوی کمینه**

![نشانگر OFF-PEAK همراه با پنجره بازشوی دو خطی با متن «Peak starts in: 60h 35m»](docs/screenshots/03-popover-offpeak.png)

**مدخل افزونه در Plugin Manager**

![مدخل DeepSeek Peak Indicator در صفحه Plugins در Harness، روشن](docs/screenshots/05-plugin-manager.png)

تصاویر **PEAK** و **UNKNOWN** هنوز در انتظار ضبط هستند، چون این حالت‌ها به شرایط واقعی زمان‌بندی نیاز
دارند که در زمان ضبط وجود نداشت: PEAK فقط در بازه‌های پیک رسمی روزهای کاری رخ می‌دهد و UNKNOWN فقط
زمانی که تقویم تعطیلات چین برای سال جاری تأیید نشده باشد. این تصاویر پس از نخستین بازه واقعی PEAK
افزوده خواهند شد؛ برای شرایط دقیق و مراحل ضبط به
[docs/screenshots/SCREENSHOTS_NEEDED.md](docs/screenshots/SCREENSHOTS_NEEDED.md) مراجعه کنید.

---

## نحوه کار

نشانگر در **`sidebar.footer.action`** ثبت می‌شود؛ جایگاه فهرستی با دامنه ریشه در کنار Settings که بسته
عرضه‌شده `@deepseek-ai/dsh-client-ui-sidebar` آن را تعریف می‌کند. این جایگاه بخشی از پوسته دائمی برنامه
است، بنابراین به Session، Conversation یا Composer وابسته نیست. نوار کناری بازشده یک دکمه قرصی کوچک
(نقطه + برچسب) نشان می‌دهد و ریل 56 px فرم جمع‌وجورِ فقط نقطه را نمایش می‌دهد.

### حالت‌ها

| حالت | معنا |
| --- | --- |
| 🔴 **PEAK** | درون یک بازه پیک رسمی، دوشنبه تا جمعه، و آن تاریخ یکی از تعطیلات عمومی تأییدشده چین نیست. قیمت بالاتر API اعمال می‌شود. |
| 🟢 **OFF-PEAK** | هر حالت دیگر: بیرون از دو بازه پیک روزانه، در آخر هفته، یا در یک تعطیلات عمومی تأییدشده چین. قیمت API با نصف نرخ پیک اعمال می‌شود. |
| ⚪ **UNKNOWN** | درون یک بازه پیک روز هفته است، اما تقویم تعطیلات محلی برای آن سال تأیید نشده است (غایب، منتشرنشده یا بدشکل). افزونه از حدس زدن خودداری می‌کند. |

آخر هفته‌ها تمام روز خارج از پیک هستند، از جمله روزهای کاری جبرانی آخر هفته (调休)، مطابق با عبارت
DeepSeek که آخر هفته‌ها و تعطیلات را «به‌طور کامل» خارج از پیک می‌داند.

### پنجره بازشوی کمینه

روی نشانگر کلیک کنید؛ برای بستن، دوباره کلیک کنید، `Escape` را فشار دهید یا بیرون از آن کلیک کنید.
پنجره بازشو دقیقاً دو خط دارد:

```text
🔴 PEAK
Off-Peak starts in: 2h 13m
```

```text
🟢 OFF-PEAK
Peak starts in: 61h 29m
```

```text
⚪ UNKNOWN
Next transition cannot be reliably determined.
```

شمارش معکوس فقط ساعت و دقیقه کامل است (هرگز ثانیه). هر دقیقه یک بار تازه می‌شود، در حالی که یک تایمر
گذار دقیق، وضعیت را در مرز رسمی تغییر می‌دهد. اگر پایان دوره فعلی در سالی قرار بگیرد که تقویم تعطیلات
آن تأیید نشده است، افزونه به جای ساختن شمارش معکوس، خط UNKNOWN را نشان می‌دهد.

### مدیریت منطقه زمانی

- بازه‌های پیک با دقیقه‌های روز بر حسب **UTC** مقایسه می‌شوند.
- تاریخ‌های تعطیلات چین با تاریخ تقویمی **`Asia/Shanghai`** همان لحظه جستجو می‌شوند.
- مرز نیمه‌شب چین از همان منطقه و با `Intl` استخراج می‌شود (برای `Asia/Shanghai` برابر 16:00 UTC) —
  محاسبه می‌شود، هرگز در کد ثابت نشده است.
- بسته کمک‌کننده‌های ایمن در برابر DST و مبتنی بر IANA را با **`Asia/Kabul`** به عنوان منطقه نمایش پیش‌فرض
  نگه می‌دارد (`DISPLAY_TIME_ZONE` در [`client.js`](client.js))؛ پنجره بازشوی کمینه فعلی عمداً فقط
  مدت‌ها را نشان می‌دهد، بنابراین منطقه زمانی بر آنچه نمایش داده می‌شود اثری ندارد و تنها بر درستی
  محاسبه اثر می‌گذارد.

---

## زمان‌بندی قیمت‌گذاری

بر پایه مستندات رسمی قیمت‌گذاری DeepSeek:

| دوره | زمان (UTC) | قیمت |
| --- | --- | --- |
| **پیک** | دوشنبه تا جمعه، **01:00–04:00** و **06:00–10:00** — به استثنای تعطیلات عمومی چین | قیمت کامل پیک |
| **خارج از پیک** | همه ساعت‌های دیگر، آخر هفته‌ها، و تعطیلات عمومی چین به‌طور کامل | نصف نرخ پیک |

معادل به وقت پکن: **09:00–12:00** و **14:00–18:00**. قیمت‌گذاری پیک/خارج از پیک بر اساس تغییرات رسمی در
**16:00 UTC روز 2026-08-16** معرفی شد؛ همیشه اعداد روز را در صفحه رسمی قیمت‌گذاری تأیید کنید.

منابع رسمی: [قیمت‌گذاری DeepSeek](https://api-docs.deepseek.com/quick_start/pricing/) ·
[صفحه چینی قیمت‌گذاری](https://api-docs.deepseek.com/zh-cn/quick_start/pricing) ·
[تغییرات](https://api-docs.deepseek.com/updates).

---

## تعطیلات عمومی چین

تاریخ‌های تعطیلات در فایل قابل ویرایش [`holidays.json`](holidays.json) قرار دارند و توسط
[`tools/sync-holidays.mjs`](tools/sync-holidays.mjs) در بسته مرورگر درج می‌شوند (یک بسته مرورگر نمی‌تواند
در زمان اجرا فایل همسایه را بخواند).

- **2025** و **2026** از اطلاعیه‌های شورای دولتی تأیید شده‌اند
  ([2025](https://www.gov.cn/zhengce/content/202411/content_6986382.htm)،
  [2026](https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm)).
- یک سال تنها با `verified: true`، یک `source` رسمی غیرخالی و تاریخ‌های تقویمی واقعی و ساختاردرست،
  تأییدشده به شمار می‌آید.
- **2027 عمداً تأیید نشده است** — هنگام آماده‌سازی این انتشار، برنامه سالانه تعطیلات منتشر نشده بود.
  بنابراین بازه‌های پیک روزهای هفته در 2027 **UNKNOWN** نشان می‌دهند؛ آخر هفته‌ها و ساعت‌های خارج از پیک
  قطعی می‌مانند.
- سالی بدون داده تأییدشده هرگز نمی‌تواند PEAK نادرست تولید کند.

برای افزودن یک سال: `holidays.json` را ویرایش کنید، `node tools/sync-holidays.mjs` را اجرا کنید و سپس
آزمون‌ها را اجرا کنید.

---

## حریم خصوصی و معماری

- **بدون کلید API.** افزونه هرگز کلید API نمی‌خواهد، ذخیره نمی‌کند و به کار نمی‌برد.
- **بدون بک‌اند، بدون پایگاه داده، بدون فضای ذخیره‌سازی.** هیچ مؤلفه سروری و هیچ دسترسی به حساب وجود ندارد.
- **بدون درخواست شبکه، بدون polling، بدون تله‌متری.** در `client.js` هیچ `fetch`، `XMLHttpRequest`،
  `WebSocket`، `EventSource` یا `import()` پویا وجود ندارد؛ تنها ساعت محلی و جدول تعطیلات همراه بسته را
  می‌خواند.
- **بدون اسرار در مخزن.** هیچ کلید، توکن، مسیر شخصی یا وضعیت مخصوص ماشین وجود ندارد.
- **هشدار استاندارد درباره افزونه‌ها.** مانند هر افزونه DSH، کد افزونه با مجوزهای محلی برنامه Harness اجرا
  می‌شود. پیش از نصب، کد منبع را بررسی کنید؛ جزئیات و گزارش در [SECURITY.md](SECURITY.md) آمده است.

افزونه یک بسته DSH با نیمه Host خالی و نیمه Client در سمت مرورگر است:

1. `package.json` بخش `dsh.bundle` (پچ Cordis که ردیف Loader را درج می‌کند) و `dsh.client` (ورودی مرورگر)
   را اعلام می‌کند.
2. `cordis.patch.yml` ردیف افزونه را درج می‌کند؛ [`index.js`](index.js) یک `apply()` عمداً خالی است.
3. `client.js` یک کارخانه ماژول با بارگذاری تنبل ثبت می‌کند، واژه‌نامه‌های زبان را می‌افزاید و نشانگر را
   از طریق `ctx.slots` در `sidebar.footer.action` ثبت می‌کند.
4. یک حالت ساعت دیواری، یک بازه 60 ثانیه‌ای و یک تایمر گذار دقیق، موتور رابط کاربری هستند؛ همه آن‌ها
   هنگام تخلیه مدخل جایگاه پاک‌سازی می‌شوند.

طراحی کامل، الگوریتم وضعیت، جستجوی گذار و قواعد پاک‌سازی در
[`docs/architecture.md`](docs/architecture.md) آمده است.

---

## سازگاری و محدودیت‌ها

- **فقط روی DeepSeek Harness Desktop v0.2.1-rc.5 (Windows) آزمون شده است.** سازگاری با نسخه‌های دیگر DSH،
  کلاینت‌ها و پلتفرم‌های دیگر ادعا نمی‌شود؛ `engines.dsh` نسخه آزمون‌شده را پین می‌کند تا زمان اجراهای
  آزمون‌نشده به جای بارگذاری کورکورانه رد شوند.
- **نوار کناری جمع‌شده در Windows.** در چیدمان نوار عنوان Windows، پوسته نوار کناری عرضه‌شده هنگام
  جمع شدن نوار کناری کل پاورقی خود را پنهان می‌کند (از جمله کنترل Settings عرضه‌شده)، بنابراین نشانگر در
  نوار کناری بازشده پیش‌فرض دیده می‌شود اما در آن حالت جمع‌شده دیده نمی‌شود. فرم جمع‌وجورِ فقط نقطه در
  ریل 56 px به کار می‌رود، جایی که پوسته پاورقی را رندر می‌کند.
- **داده تعطیلات 2027.** بازه‌های پیک روزهای هفته در 2027 تا زمان انتشار اطلاعیه رسمی و به‌روزرسانی
  تقویم **UNKNOWN** نشان می‌دهند. آخر هفته‌ها و ساعت‌های خارج از پیک قطعی می‌مانند.
- **هویت بسته.** بستهٔ عمومی `@jalilahmad.fazeli/deepseek-peak-indicator` است؛ همین شناسهٔ
  ماژول/بستهٔ Harness برای نصب npm و GitHub به کار می‌رود. نصب‌های پیش از این تغییر نام (با
  `@local/deepseek-peak-indicator`) باید ابتدا حذف و سپس دوباره نصب شوند. شناسهٔ ردیف افزونه
  `deepseek-peak-indicator` و همهٔ رفتارهای زمان اجرا بدون تغییر باقی مانده‌اند.
- **تصاویر.** سه تصویر واقعی عرضه شده است؛ تصاویر PEAK و UNKNOWN به شرایط واقعی زمان‌بندی نیاز دارند و
  هنوز در انتظار ضبط‌اند. به [تصاویر](#تصاویر) و
  [SCREENSHOTS_NEEDED.md](docs/screenshots/SCREENSHOTS_NEEDED.md) مراجعه کنید.

---

## به‌روزرسانی و حذف نصب

**به‌روزرسانی** — DeepSeek Harness بسته‌های نصب‌شده را به‌صورت درجا به‌روزرسانی نمی‌کند:

1. **Plugins** را باز کنید، **DeepSeek Peak Indicator** را پیدا کنید و **Remove** را بزنید
   (یا `dsh plugin --profile web remove @jalilahmad.fazeli/deepseek-peak-indicator` را اجرا کنید).
2. از همان دستور بخش [نصب](#نصب) دوباره نصب کنید.
3. Web GUI را دوباره بارگذاری کنید.

اگر نسخهٔ پیش از npm را نصب کرده بودید، ابتدا بسته قدیمی را حذف کنید:
`dsh plugin --profile web remove @local/deepseek-peak-indicator`.

**حذف نصب** — **Plugins** → **DeepSeek Peak Indicator** → **Remove**، یا:

```powershell
dsh plugin --profile web remove @jalilahmad.fazeli/deepseek-peak-indicator
```

افزونه چیزی بیرون از بسته خود ذخیره نمی‌کند، بنابراین حذف نصب هیچ داده‌ای بر جای نمی‌گذارد.

---

## توسعه

هیچ مرحله build و هیچ وابستگی وجود ندارد. تنها اسکریپت‌های Node.js، مجموعه آزمون و ابزار همگام‌سازی
تعطیلات هستند.

```text
deepseek-peak-indicator/
├── client.js                 # browser half: schedule core, sidebar indicator, popover, timers
├── index.js                  # empty Host half (Loader row)
├── package.json              # bundle manifest, dsh.bundle / dsh.client, metadata
├── cordis.patch.yml          # Loader patch inserting the plugin row
├── holidays.json             # editable Chinese public holiday calendar
├── icon.svg                  # previous plugin icon (retained as backup)
├── locale/                   # plugin display metadata (en, zh)
├── tools/sync-holidays.mjs   # inlines holidays.json into client.js
├── test/schedule.test.mjs    # 22 Node tests (schedule, popover, registration)
├── docs/                     # architecture, marketplace notes, screenshot instructions
├── assets/                   # README banner, runtime plugin icon, marketplace icons
├── screenshots.json          # marketplace storefront screenshot list
├── README.md · README.fa.md · README.zh-CN.md
├── CHANGELOG.md · CONTRIBUTING.md · SECURITY.md · LICENSE
└── .gitignore · .gitattributes
```

`assets/readme-banner.png` بنر اصلی (هیرو) همین README است. `assets/icon-512.png` (PNG ۵۱۲×۵۱۲،
۵۸.۶ کیلوبایت، کمتر از سقف ۲۵۶ کیلوبایتی آیکون DSH) **آیکون زمان اجرای افزونه** است و از طریق همان
صادرات `./icon` در مانیفست ارائه می‌شود؛ این آیکون به‌صورت زنده در Plugin Manager تأیید شد. `icon.svg`
به‌عنوان آیکون قبلی و نسخه پشتیبان نگه داشته می‌شود و `assets/icon-180.png` نیز به‌عنوان آیکون
کوچک‌تر marketplace باقی می‌ماند.

اجرای آزمون‌ها:

```powershell
node --test test/schedule.test.mjs
```

نتیجه مورد انتظار: **22 آزمون، 22 قبول، 0 ناموفق** (تأییدشده با Node.js v24.21.0، همان زمان اجرای همراه
DSH Desktop v0.2.1-rc.5). این مجموعه هر دو بازه پیک، ساعت‌های خارج از پیک، آخر هفته‌ها و روزهای کاری
جبرانی، استثناهای تعطیلات، حالت UNKNOWN مربوط به 2027 منتشرنشده، لحظه‌های دقیق گذار، قالب‌بندی شمارش
معکوس، مدل پنجره بازشوی دو خطی، فرم‌های عریض و جمع‌وجور، ثبت تک‌جایگاه، مرز نیمه‌شب چین استخراج‌شده از
`Intl` و رد تاریخ بدشکل را پوشش می‌دهد.

نصب محلی برای توسعه:

```powershell
git clone https://github.com/jalilahmad/deepseek-peak-indicator.git
dsh plugin --profile web add <absolute-path-to-checkout>
```

از مشارکت استقبال می‌شود — به [CONTRIBUTING.md](CONTRIBUTING.md) و [SECURITY.md](SECURITY.md) مراجعه کنید.
یادداشت‌های معماری: [`docs/architecture.md`](docs/architecture.md)؛ یادداشت‌های مارکت‌پلیس و ارسال:
[`docs/marketplaces.md`](docs/marketplaces.md).

---

## مجوز، نویسنده و سپاسگزاری‌ها

[MIT](LICENSE) © 2026 **جلیل احمد فاضلی (Jalil Ahmad Fazeli)** · [@jalilahmad](https://github.com/jalilahmad) ·
[مخزن](https://github.com/jalilahmad/deepseek-peak-indicator) ·
[مسائل](https://github.com/jalilahmad/deepseek-peak-indicator/issues)

این یک افزونه مستقل و جامعه‌ساخته است و وابستگی سازمانی به DeepSeek ندارد.

سپاسگزاری‌ها و منابع رسمی:

- افزونه از مدل رسمی افزونه bundle/Cordis در DeepSeek Harness پیروی می‌کند (پچ `dsh.bundle` + نیمه مرورگر
  `dsh.client` + ثبت `ctx.slots`).
- قواعد قیمت‌گذاری: [قیمت‌گذاری API DeepSeek](https://api-docs.deepseek.com/quick_start/pricing/) و
  [نسخه چینی](https://api-docs.deepseek.com/zh-cn/quick_start/pricing)؛
  تاریخ معرفی: [تغییرات](https://api-docs.deepseek.com/updates).
- برنامه‌های تعطیلات عمومی چین: اطلاعیه‌های شورای دولتی برای 2025 و 2026 (پیوندها در بالا).
- داده منطقه زمانی `Intl`/IANA از زمان اجرای مرورگر می‌آید؛ `react` و `react-dom` توسط جدول ماژول مرورگر
  Harness ارائه می‌شوند. هیچ کد منبع شخص ثالثی در بسته گنجانده نشده است.
- آیکون و اثر هنری بنر README دارایی‌های اصلی و ساخته‌شده برای همین افزونه هستند.
