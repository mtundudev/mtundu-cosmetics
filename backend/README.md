# Mtundu Cosmetics - Python Backend (FastAPI)

Backend thabiti na ya kisasa ya Python kwa ajili ya mfumo wa mauzo wa **Mtundu Cosmetics**, iliyoundwa kwa kutumia **FastAPI**, **SQLAlchemy 2.0**, na **Pydantic v2**.

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
│   │       └── products.py         # GET /products, GET /products/{slug}
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

### 1. Hakikisha Vifurushi Vimesakinishwa
```bash
pip install -r backend/requirements.txt
```

### 2. Anzisha Seva
```bash
python backend/run.py
```
Seva itaanza kwenye: `http://127.0.0.1:8000`

### 3. Nyaraka za API (Swagger & ReDoc)
- **Swagger Interactive UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## Orodha ya Endpoints

| Njia (Route) | Mbinu (Method) | Maelezo | Ruhusa |
|---|---|---|---|
| `/api/v1/orders` | POST | Tengeneza order mpya ya mteja (inakupa namba kama `MC-20261114-1234`) | Mteja |
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
