import type {
    Slot,
    CreateBookingRequest,
    CreateBookingResponse,
    CancelBookingRequest,
    SubmitPaymentRequest,
    PaymentStatusResponse,
    MyBooking,
} from '../types/booking.types';

// ✔️ أولوية: الـ VITE_PUBLIC_API_URL هو الاسم الصحيح في ملف .env الخاص بنا
// لا تستخدم VITE_API_BASE_URL (الذي كان غير معرّف ويفشل بشكل صامت إلى '/api')
const BASE_URL = (
    import.meta.env.VITE_PUBLIC_API_URL ??
    import.meta.env.VITE_API_BASE_URL ??
    'https://upwind-schnapps-uncoated.ngrok-free.dev'
).replace(/\/$/, ''); // إزالة الشرطة المائلة من النهاية لمنع تكرارها مع بداية المسار

function authHeaders(): HeadersInit {
    // التحقق من كلا الاسمين لأن بعض أجزاء التطبيق تخزن التوكن بأسماء مختلفة
    const token =
        localStorage.getItem('accessToken') ??
        localStorage.getItem('hagzaya_token');
    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'ngrok-skip-browser-warning': 'true',
    };
}

/**
 * Every Booking endpoint in the Swagger doc responds with
 * `application/octet-stream` rather than `application/json`.
 *
 * This helper is the SINGLE place that un-wraps the response. It is
 * deliberately defensive:
 *   - Logs the full URL + status on every error so you can see exactly
 *     which request failed in the console.
 *   - Checks the content-type before attempting JSON.parse. If the server
 *     returns an HTML error page (e.g. ngrok's 404 or a Kestrel crash page),
 *     the raw HTML is logged to the console under a clearly labelled group
 *     so you can read it without opening DevTools Network tab.
 *   - Throws a rich Error that includes the URL, HTTP status, and a snippet
 *     of the server response body for easy copy-paste into a bug report.
 */
async function handleStreamResponse<T>(
    response: Response,
    requestUrl?: string,
): Promise<T> {
    const url = requestUrl ?? response.url ?? '(unknown URL)';
    const ct = response.headers.get('content-type') ?? '';
    const isJson = ct.includes('application/json');
    const isStream = ct.includes('application/octet-stream');
    const canParse = isJson || isStream || ct === '';

    // ── Helper: read body text safely (response body can only be consumed once) ──
    const readText = async (): Promise<string> => {
        try {
            const blob = await response.clone().blob();
            return await blob.text();
        } catch {
            return '(could not read response body)';
        }
    };

    if (!response.ok) {
        const raw = await readText();

        // إذا كان جسم الاستجابة صفحة HTML نطبعها كاملةً في الكونسول لتسهيل التشخيص
        if (raw.trimStart().startsWith('<')) {
            console.groupCollapsed(
                `%c[Booking API] HTML error from ${response.status} ${response.statusText} — ${url}`,
                'color: #c62828; font-weight: bold;'
            );
            console.log(raw);
            console.groupEnd();
        }

        let detail = '';
        if (isJson || isStream) {
            try {
                const parsed = JSON.parse(raw);
                detail = parsed?.message || parsed?.title || parsed?.detail || '';
            } catch { /* not JSON — detail stays empty */ }
        }

        throw new Error(
            `[${response.status}] ${response.statusText} — ${url}` +
            (detail ? `\nتفاصيل الخطأ: ${detail}` : '')
        );
    }

    // استجابة ناجحة: قراءة النص ومحاولة التحليل
    const raw = await readText();

    if (!raw.trim()) return undefined as T;

    // تحقق مهم: منع محاولة JSON.parse على صفحة HTML بشكل هادئ
    if (raw.trimStart().startsWith('<')) {
        console.groupCollapsed(
            `%c[Booking API] تحذير: الخادم أعاد HTML بدلاً من JSON — ${url}`,
            'color: #e65100; font-weight: bold;'
        );
        console.log(raw);
        console.groupEnd();
        throw new Error(
            `[Booking API] Expected JSON but got HTML from ${url} (status ${response.status})` +
            `\nThis usually means the URL is wrong or the backend returned an error page.` +
            `\nتحقق من: هل VITE_PUBLIC_API_URL مضبوط في .env وهل المسار صحيح؟`
        );
    }

    if (!canParse) {
        // نوع المحتوى غير متوقع لكن سنحاول التحليل بشكل متسامح
        console.warn(`[Booking API] Unexpected content-type '${ct}' from ${url} — attempting JSON.parse anyway`);
    }

    try {
        return JSON.parse(raw) as T;
    } catch {
        console.error(
            `[Booking API] JSON.parse failed for response from ${url}\nRaw text (first 500 chars):`,
            raw.slice(0, 500)
        );
        throw new Error(
            `[Booking API] Invalid JSON from ${url}\nRaw: ${raw.slice(0, 200)}`
        );
    }
}

export const bookingApi = {
    /** GET /api/bookings/slots/{fieldId}?date=YYYY-MM-DD */
    async getAvailableSlots(fieldId: number, date: string): Promise<Slot[]> {
        // تحذير: لا تستخدم new URL() مع BASE_URL الكامل لأن window.location.origin
        // سيتغلب على المضيف ويحوّل الطلب إلى localhost.
        // استخدم template literal بسيط عوضاً.
        const url = `${BASE_URL}/api/bookings/slots/${fieldId}?date=${date}`;
        const response = await fetch(url, { headers: { ...authHeaders() } });
        const data = await handleStreamResponse<Slot[] | { data: Slot[] }>(response, url);
        return Array.isArray(data) ? data : (data as { data: Slot[] })?.data ?? [];
    },

    /** GET /api/bookings/slots/available-dates?fieldId=123 */
    async getAvailableDates(fieldId: number): Promise<string[]> {
        const url = `${BASE_URL}/api/bookings/slots/available-dates?fieldId=${fieldId}`;
        const response = await fetch(url, { headers: { ...authHeaders() } });
        return handleStreamResponse<string[]>(response, url);
    },

    /**
     * POST /api/bookings — creates AND locks the booking in one call.
     * Books a single slot (wrapped in the `slotIds` array the backend
     * expects). `paymentMethod` must be supplied here even though the UI
     * lets the player pick their wallet on the next screen — we send the
     * default selection now and allow it to be corrected via
     * `submitPayment` once the player actually chooses.
     */
    async createBooking(request: CreateBookingRequest): Promise<CreateBookingResponse> {
        const url = `${BASE_URL}/api/bookings`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify(request),
        });
        return handleStreamResponse<CreateBookingResponse>(response, url);
    },

    /** POST /api/bookings/cancel */
    async cancelBooking(request: CancelBookingRequest): Promise<void> {
        const url = `${BASE_URL}/api/bookings/cancel`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify(request),
        });
        return handleStreamResponse<void>(response, url);
    },

    async submitPayment(data: { bookingId: number; paymentMethod: number | string; proofImageUrl: string; transactionId?: string }): Promise<void> {
        const url = `${BASE_URL}/api/bookings/submit-payment`;
        
        // Safe string translation for the backend contract
        const paymentMethodString = 
            data.paymentMethod === 0 || data.paymentMethod === 'VodafoneCash' ? 'VodafoneCash' : 'InstaPay';

        const flatPayload = {
            bookingId: data.bookingId,
            paymentMethod: paymentMethodString,
            proofImageUrl: data.proofImageUrl,
            transactionId: data.transactionId
        };

        // Send flatPayload directly WITHOUT wrapping it inside an outer object
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify(flatPayload),
        });
        return handleStreamResponse<void>(response, url);
    },

    /** GET /api/bookings/{id}/payment-status */
    async getPaymentStatus(bookingId: number): Promise<PaymentStatusResponse> {
        const url = `${BASE_URL}/api/bookings/${bookingId}/payment-status`;
        const response = await fetch(url, { headers: { ...authHeaders() } });
        return handleStreamResponse<PaymentStatusResponse>(response, url);
    },

    /**
     * GET /api/bookings/my-bookings
     *
     * The API now returns a categorised object:
     *   { upcoming: Booking[], past: Booking[], cancelled: Booking[], tournamentRegistrations: any[] }
     *
     * We return the raw parsed payload so the page can distribute it into the
     * correct state buckets.  Legacy array / { data: [] } shapes are preserved
     * as fallbacks so nothing breaks if the backend is rolled back.
     */
    async getMyBookings(): Promise<any> {
        const url = `${BASE_URL}/api/bookings/my-bookings`;
        const response = await fetch(url, { headers: { ...authHeaders() } });
        // Use a permissive type so the wrapper doesn't lose fields by forcing MyBooking[]
        const raw = await handleStreamResponse<any>(response, url);

        // ── New categorised shape ──────────────────────────────────────────────
        if (raw && typeof raw === 'object' && !Array.isArray(raw) &&
            ('upcoming' in raw || 'past' in raw || 'cancelled' in raw)) {
            return raw; // { upcoming, past, cancelled, tournamentRegistrations }
        }

        // ── Legacy: { data: [...] } envelope ─────────────────────────────────
        if (raw && typeof raw === 'object' && !Array.isArray(raw) && Array.isArray(raw.data)) {
            return raw.data;
        }

        // ── Legacy: flat array ────────────────────────────────────────────────
        return Array.isArray(raw) ? raw : [];
    },

    /** GET /api/bookings/{id} */
    async getBookingById(id: number): Promise<CreateBookingResponse> {
        const url = `${BASE_URL}/api/bookings/${id}`;
        const response = await fetch(url, { headers: { ...authHeaders() } });
        return handleStreamResponse<CreateBookingResponse>(response, url);
    },

    /**
     * ⚠️ PLACEHOLDER — no upload endpoint exists in the provided Swagger
     * excerpt. `submit-payment` expects a `proofImageUrl` string, so the
     * receipt image must land in storage (S3 / Azure Blob / a dedicated
     * `/api/uploads` endpoint, etc.) before that call can be made. Wire
     * this up to the real endpoint once it exists; until then this throws
     * loudly instead of pretending to succeed.
     */
    async uploadReceipt(_file: File): Promise<string> {
        throw new Error(
            'uploadReceipt() is not wired to a real endpoint yet — replace this with a call to your file storage upload API, which should return a public/signed URL for proofImageUrl.'
        );
    },
};