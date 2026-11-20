# Omega Cosmetics - Python Backend (FastAPI)

Backend thabiti na ya kisasa ya Python kwa ajili ya mfumo wa mauzo wa **Omega Cosmetics**, iliyoundwa kwa kutumia **FastAPI**, **SQLAlchemy 2.0**, na **Pydantic v2**.

---

## Muundo wa Folda (Folder Structure)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # Entrypoint kuu ya FastAPI, CORS, lifespans, na routers
│   ├── core/                       # Mipangilio ya kiusalama na core
│   │   ├── __init__.py
│   │   ├── config.py               # Mazingira (Settings / .env)
│   │   ├── security.py             # Uthibitishaji wa Admin (Session Cookies & Tokens)
│   │   └── email.py                # Utumaji wa barua pepe za arifa (SMTP)
│   ├── db/                         # Safu ya hifadhidata (Database)
│   │   ├── __init__.py
│   │   ├── base.py                 # SQLAlchemy DeclarativeBase
│   │   ├── session.py              # Engine ya SQLAlchemy & SessionLocal
│   │   └── init_db.py              # Uundaji wa majedwali & kuweka data za mwanzo
│   ├── models/                     # Majedwali ya Database (ORM Models)
│   │   ├── __init__.py
│   │   ├── order.py                # Jedwali la Order & vipengele vyake
│   │   ├── review.py               # Jedwali la Maoni ya Wateja (Reviews)
│   │   ├── contact.py              # Jedwali la Ujumbe wa Mawasiliano (Contacts)
│   │   └── product.py              # Jedwali la Bidhaa (Products)
│   ├── schemas/                    # Uthibitishaji wa data (Pydantic Schemas)
│   │   ├── __init__.py
│   │   ├── auth.py                 # Admin login & status
│   │   ├── order.py                # OrderCreate, OrderOut, SalesMetrics
│   │   ├── review.py               # ReviewCreate, ReviewOut, ReviewUpdate
│   │   ├── contact.py              # ContactCreate, ContactOut
│   │   └── product.py              # ProductCreate, ProductOut, ProductUpdate
│   ├── api/                        # Njia za API (API Endpoints)
│   │   ├── __init__.py
│   │   ├── api_v1.py               # Router kuu ya v1
│   │   └── endpoints/
│   │       ├── __init__.py
│   │       ├── auth.py             # POST /admin/login, POST /admin/logout, GET /admin/me
│   │       ├── orders.py           # POST /orders, GET /orders, GET /orders/metrics
│   │       ├── reviews.py          # GET /reviews, POST /reviews, PATCH /reviews/{id}/approve
│   │       ├── contact.py          # POST /contact, GET /contact
│   │       └── products.py         # Public catalog and admin product CRUD
│   └── services/                   # Mantiki ya Kibiashara (Business Logic)
│       ├── __init__.py
│       ├── order_service.py        # Uzalishaji wa namba za oda & takwimu
│       ├── review_service.py       # Usimamizi wa maoni
│       ├── contact_service.py      # Usimamizi wa ujumbe
│       └── product_service.py      # Usimamizi wa bidhaa
├── tests/                          # Majaribio (Automated Tests)
│   ├── __init__.py
│   └── test_api.py                 # Majaribio ya endpoints zote
├── .env.example                    # Kiolezo cha vigezo vya mazingira
├── requirements.txt                # Vifurushi vinavyohitajika
├── run.py                          # Amri ya kuendesha seva ya backend
└── README.md
```

---

## Jinsi ya Kuendesha Backend (Quickstart)

### 1. Weka mipangilio ya siri
Nakili `backend/.env.example` kwenda `.env` kwenye mzizi wa project au `backend/.env`, kisha weka `ADMIN_PASSWORD` na `SECRET_KEY` salama. Backend husoma sehemu zote mbili. Tumia thamani tofauti na mifano hii wakati wa deployment.

Frontend inatumia `NEXT_PUBLIC_API_BASE_URL` kutoka `.env.local`; thamani ya maendeleo ni `http://localhost:8000/api/v1`.

### 2. Hakikisha Vifurushi Vimesakinishwa
```bash
pip install -r backend/requirements.txt
```

### 3. Anzisha Seva
```bash
python backend/run.py
```
Seva itaanza kwenye: `http://127.0.0.1:8000`

### 4. Nyaraka za API (Swagger & ReDoc)
- **Swagger Interactive UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## Orodha ya Endpoints

| Njia (Route) | Mbinu (Method) | Maelezo | Ruhusa |
|---|---|---|---|
| `/api/v1/orders` | POST | Tengeneza order mpya ya mteja (inakupa namba kama `MC-20261114-1234`) | Mteja |
| `/api/v1/orders/payment-config` | GET | Hali ya malipo ya mtandaoni na test mode | Mteja |
| `/api/v1/orders/{ref}/checkout` | POST | Anzisha checkout ya Selcom au test mode | Mteja mwenye token ya oda |
| `/api/v1/orders/{ref}/payment-status` | GET | Thibitisha hali ya malipo | Mteja mwenye token ya oda |
| `/api/v1/orders/{ref}/test-payment` | POST | Simulate malipo yaliyokamilika (test mode pekee) | Mteja mwenye token ya oda |
| `/api/v1/orders` | GET | Orodha ya orders zote | Admin |
| `/api/v1/orders/metrics` | GET | Takwimu kamili za mauzo, chati za kila siku, bidhaa zinazoongoza | Admin |
| `/api/v1/orders/{ref}` | GET | Maelezo ya order kupitia reference code | Mteja / Admin |
| `/api/v1/reviews` | GET | Pata maoni ya wateja yaliyoidhinishwa | Mteja |
| `/api/v1/reviews` | POST | Tuma maoni mapya ya mteja | Mteja |
| `/api/v1/reviews/{id}/approve` | PATCH | Idhinisha au kataa maoni | Admin |
| `/api/v1/contact` | POST | Tuma ujumbe wa fomu ya wasiliana nasi | Mteja |
| `/api/v1/contact` | GET | Orodha ya jumbe zilizotumwa | Admin |
| `/api/v1/admin/login` | POST | Ingia kama admin (inaseti cookie salama) | Msimamizi |
| `/api/v1/admin/logout` | POST | Toka kwenye akaunti ya admin | Msimamizi |
| `/api/v1/admin/me` | GET | Angalia hali ya kuingia ya admin | Wote |
| `/api/v1/products` | GET | Orodha ya bidhaa zenye vichungi vya kategoria na tafuta | Wote |
| `/api/v1/products/{slug}` | GET | Taarifa za bidhaa mahususi | Wote |
| `/api/v1/products` | POST | Ongeza bidhaa | Admin |
| `/api/v1/products/{slug}` | PUT | Rekebisha au ficha/onyesha bidhaa | Admin |
| `/api/v1/products/{slug}` | DELETE | Futa bidhaa | Admin |
| `/api/v1/products?include_inactive=true` | GET | Orodha ya bidhaa zote pamoja na zilizofichwa | Admin |
| `/api/v1/services` | GET | Orodha ya huduma zinazopatikana | Wote |
| `/api/v1/services` | POST | Ongeza huduma ya Kiswahili na Kiingereza | Admin |
| `/api/v1/services/{id}` | PATCH | Hariri huduma au ibadilishe ionekane/ifichwe | Admin |
| `/api/v1/services?include_inactive=true` | GET | Orodha ya huduma zote, hata zilizofichwa | Admin |

Admin login hutumia cookie ya HTTP-only iliyosainiwa na backend. Weka `COOKIE_SECURE=true` kwa production inayotumia HTTPS. Ikiwa frontend na API ziko kwenye domains tofauti, weka pia `COOKIE_SAMESITE=none`. `CORS_ORIGINS` lazima iwe na origin ya frontend. Endpoint za admin zinahitaji session hiyo; password chaguomsingi haipo.

Dashboard ya admin katika `/admin/mauzo` inaweza kuongeza, kurekebisha, kuficha/kuonyesha na kufuta bidhaa. Bidhaa hazina orodha ya mfano iliyowekwa kwenye frontend au seed ya backend; database mpya huanza bila bidhaa na katalogi ya mbele huonyesha bidhaa zilizopo FastAPI pekee. Bidhaa zilizohifadhiwa tayari kwenye database hazifutwi na mabadiliko haya.

Admin pia anaweza kuongeza na kuhariri huduma kwa Kiswahili na Kiingereza, au kuzificha/kuzirudisha kwenye tovuti. Kwenye sehemu ya bidhaa anaweza kuweka punguzo la asilimia (0–100); bei iliyopunguzwa huonyeshwa kwenye ofa za ukurasa wa mwanzo na hutumika tena backend inapokokotoa oda.

Checkout huhifadhi oda kwenye FastAPI kisha huonyesha kitufe cha kuituma kupitia WhatsApp kwa ujumbe uliojazwa tayari. Wateja wanaweza pia kufungua WhatsApp kutoka kitufe kinachoonekana kwenye kila ukurasa. Frontend ina chaguo za Kiswahili/Kiingereza na mwonekano wa mwanga/giza; mapendeleo huhifadhiwa kwenye kivinjari.

### Malipo ya Selcom na picha zilizopakiwa

`PAYMENT_MODE=test` huwezesha checkout ya majaribio iliyoandikwa wazi kuwa haihamishi fedha. `PAYMENT_MODE=selcom` hutumia akaunti na credentials halisi za Selcom; weka `SELCOM_BASE_URL`, `SELCOM_API_KEY`, `SELCOM_API_SECRET`, na `SELCOM_VENDOR_ID` kwenye mazingira ya backend pekee. Usiziweke kwenye frontend. `APP_ENV=production` pamoja na `PAYMENT_MODE=test` hukataliwa wakati backend inaanza. Weka `FRONTEND_PUBLIC_URL` na `API_PUBLIC_URL` kwa anwani za deployment.

Kwa deployment ya production, chagua `PAYMENT_MODE=selcom` baada ya merchant account kuthibitishwa, au `manual` hadi hapo. Weka `APP_ENV=production`, `COOKIE_SECURE=true`, tumia `SECRET_KEY` na `ADMIN_PASSWORD` salama, na tumia HTTPS. Hali ya `test` haipaswi kutumiwa kupokea fedha halisi.

Kwa maendeleo, `MEDIA_STORAGE=local` huhifadhi picha chini ya `MEDIA_ROOT`. Production hutumia Supabase Storage kupitia bucket ya umma ya picha za bidhaa na wasifu; weka `MEDIA_STORAGE=supabase`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, na `SUPABASE_STORAGE_BUCKET`. Backend hurejesha public image URL na haihitaji Render disk. Usitumie service role key kwenye frontend wala kuiweka Git.

Arifa za oda hutumwa kwa `ORDER_NOTIFICATION_EMAIL`; ikiwa imeachwa tupu, backend hutumia `CONTACT_TO_EMAIL`. Sanidi `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, na `SMTP_PASS` ili kutuma barua. Email ya oda ina jedwali la bidhaa na jumla lenye rangi za chapa. Arifa za oda, mawasiliano na maoni hutumwa baada ya API kujibu ili SMTP isicheleweshe wateja; tumia foleni ya kazi za kudumu ikiwa mfumo unahitaji majaribio ya kutuma tena baada ya server kuzimika.

## Checklist ya kabla ya deployment

- Weka `NEXT_PUBLIC_API_BASE_URL` na `NEXT_PUBLIC_SITE_URL` kwenye mazingira ya frontend kabla ya build; tumia anwani halisi za HTTPS za API na tovuti.
- Weka `APP_ENV=production`, `PAYMENT_MODE=manual` au `selcom`, `ADMIN_PASSWORD` yenye angalau herufi 12, `SECRET_KEY` yenye angalau herufi 32, na `COOKIE_SECURE=true`.
- Weka `CORS_ORIGINS` kuwa origin halisi za frontend pekee, zote zikiwa HTTPS. Ikiwa frontend na API ziko kwenye tovuti tofauti, tumia `COOKIE_SAMESITE=none` pamoja na `COOKIE_SECURE=true`.
- Weka SMTP credentials halisi. Ikiwa utatumia Selcom, weka vendor ID na credentials zote za merchant kwenye secret manager ya hosting; usiweke kwenye frontend.
- Tumia Supabase PostgreSQL connection string kupitia `DATABASE_URL`; URL za kawaida za `postgres://`/`postgresql://` hubadilishwa kutumia `psycopg`.
- Weka `MEDIA_STORAGE=supabase`, Supabase project URL, service-role key na bucket name kwenye Render. Tengeneza bucket hiyo kwenye Supabase Storage na iwe public kwa kusoma picha za bidhaa.
- Build frontend kwa `npm run build`, kisha endesha kwa `npm run start`. Endesha API bila reload kwa `uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}`.
- Hakiki `/health`, admin login, upload ya picha, uundaji wa oda, arifa za barua pepe na malipo ya production kabla ya kutangaza duka.

Mipangilio ya production hukataliwa backend ikikosa HTTPS, siri za admin, cookie salama au SMTP; Selcom pia huhitaji credentials zote. `NEXT_PUBLIC_SITE_URL` inatumika kutengeneza canonical/metadata links, hivyo lazima iwekwe kwa domain halisi.

### Vercel + Render

- Vercel: tumia root directory ya project, build command `npm run build`, na weka `NEXT_PUBLIC_API_BASE_URL=https://<api-service>.onrender.com/api/v1` pamoja na `NEXT_PUBLIC_SITE_URL=https://<store>.vercel.app`.
- Render: tengeneza Web Service kutoka root ya repository; build command ni `pip install -r backend/requirements.txt`, start command ni `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`, na health check path ni `/health`.
- Unganisha Supabase PostgreSQL kupitia `DATABASE_URL` (tumia connection string ya session pooler ikiwa direct connection haipatikani kutoka Render).
- Weka `MEDIA_STORAGE=supabase`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, na `SUPABASE_STORAGE_BUCKET=omega-media` kwenye Render. Unda bucket ya `omega-media` kwenye Supabase na uruhusu public reads kwa picha.
- Weka `FRONTEND_PUBLIC_URL`, `API_PUBLIC_URL`, `CORS_ORIGINS` kwa domains halisi pamoja na `COOKIE_SAMESITE=none` na `COOKIE_SECURE=true`. Render disk haihitajiki kwa picha.
- Anza na `PAYMENT_MODE=manual`; washa `selcom` tu baada ya merchant account na credentials halisi kuthibitishwa. Weka credentials zote, SMTP na admin password kama secret environment variables kwenye Render; usizihifadhi kwenye Git.
