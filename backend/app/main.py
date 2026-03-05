from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app import crud, models, schemas, auth
from app.database import engine, get_db
from app.config import settings
import cloudinary
import cloudinary.uploader
from fastapi import File, UploadFile

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

models.Base.metadata.create_all(bind=engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI(title="VeggieFlow Pro API")

# Authentication Endpoint
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = crud.get_user_by_username(db, username=form_data.username)
    print(f"DEBUG: Login Attempt for user: '{form_data.username}'")
    if not user:
        print(f"DEBUG: User '{form_data.username}' not found in DB")
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

async def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except auth.JWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_manager_user(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges"
        )
    return current_user

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to VeggieFlow Pro API"}

@app.post("/signup", response_model=schemas.User)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

# User Management (Manager Only)
@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    return crud.get_users(db, skip=skip, limit=limit)

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    # Don't allow manager to delete themselves via this endpoint easily if they are the only one
    success = crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

# Vegetables
@app.post("/vegetables/", response_model=schemas.Vegetable)
def create_vegetable(veg: schemas.VegetableCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    return crud.create_vegetable(db=db, veg=veg)

@app.get("/vegetables/", response_model=List[schemas.Vegetable])
def read_vegetables(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    vegetables = crud.get_vegetables(db, skip=skip, limit=limit)
    return vegetables

@app.get("/vegetables/low-stock/", response_model=List[schemas.Vegetable])
def read_low_stock_vegetables(db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    return crud.get_low_stock_vegetables(db)

# Suppliers
@app.post("/suppliers/", response_model=schemas.Supplier)
def create_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    return crud.create_supplier(db=db, supplier=supplier)

@app.get("/suppliers/", response_model=List[schemas.Supplier])
def read_suppliers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_suppliers(db, skip=skip, limit=limit)

@app.put("/suppliers/{supplier_id}", response_model=schemas.Supplier)
def update_supplier(supplier_id: int, supplier: schemas.SupplierCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    db_supplier = crud.update_supplier(db, supplier_id, supplier)
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return db_supplier

@app.delete("/suppliers/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    success = crud.delete_supplier(db, supplier_id)
    if not success:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return {"message": "Supplier deleted"}

@app.get("/suppliers/dues/", response_model=List[schemas.SupplierDue])
def read_supplier_dues(db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    return crud.get_supplier_dues(db)

@app.post("/suppliers/payments/", response_model=schemas.SupplierPayment)
def create_supplier_payment(payment: schemas.SupplierPaymentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    return crud.record_supplier_payment(db, payment)

@app.get("/suppliers/payments/{supplier_id}", response_model=List[schemas.SupplierPayment])
def read_supplier_payments(supplier_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    return crud.get_supplier_payment_history(db, supplier_id)

# Staff
@app.post("/staff/", response_model=schemas.Staff)
def create_staff(staff: schemas.StaffCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    return crud.create_staff(db=db, staff=staff)

@app.get("/staff/", response_model=List[schemas.Staff])
def read_staff(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_staff(db, skip=skip, limit=limit)

@app.put("/staff/{staff_id}", response_model=schemas.Staff)
def update_staff(staff_id: int, staff: schemas.StaffCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    db_staff = crud.update_staff(db, staff_id, staff)
    if db_staff is None:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return db_staff

@app.delete("/staff/{staff_id}")
def delete_staff(staff_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    success = crud.delete_staff(db, staff_id)
    if not success:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return {"message": "Staff member deleted"}

# Billing
@app.post("/sales/", response_model=schemas.SalesBill)
def create_sales_bill(bill: schemas.SalesBillCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_sales_bill(db=db, bill=bill)

@app.get("/sales/", response_model=List[schemas.SalesBill])
def read_sales_bills(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_sales_bills(db, skip=skip, limit=limit)

@app.get("/customers/", response_model=List[schemas.Customer])
def read_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    return crud.get_customers(db, skip=skip, limit=limit)

@app.get("/dashboard/stats", response_model=schemas.DashboardStats)
def read_dashboard_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    return crud.get_dashboard_stats(db)

@app.post("/inward/", response_model=schemas.InwardRecord)
def create_inward_record(rec: schemas.InwardRecordCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    return crud.create_inward_record(db, rec)

@app.get("/notifications", response_model=List[schemas.Notification])
def read_notifications(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_notifications(db)

# Attendance History
@app.post("/attendance/", response_model=schemas.Attendance)
def record_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    # Also update staff current status
    staff = crud.get_staff_member(db, attendance.staff_id)
    if staff:
        staff.status = attendance.status
        staff.check_in = attendance.check_in
        staff.check_out = attendance.check_out
        db.commit()
    return crud.record_attendance(db, attendance)

@app.get("/attendance/history", response_model=List[schemas.Attendance])
def read_attendance_history(staff_id: int = None, date: str = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    date_obj = datetime.strptime(date, '%Y-%m-%d').date() if date else None
    return crud.get_attendance_history(db, staff_id=staff_id, date=date_obj)

@app.post("/upload/image/")
async def upload_image(file: UploadFile = File(...), current_user: models.User = Depends(get_manager_user)):
    try:
        # Upload the file to Cloudinary
        result = cloudinary.uploader.upload(file.file, folder="veggieflow/vegetables")
        # Return the secure URL
        return {"url": result.get("secure_url")}
    except Exception as e:
        print(f"Cloudinary upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Wastage
@app.post("/wastage/", response_model=schemas.WastageRecord)
def create_wastage(record: schemas.WastageRecordCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_manager_user)):
    try:
        return crud.create_wastage_record(db=db, record=record)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/wastage/", response_model=List[schemas.WastageRecord])
def read_wastage(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_wastage_records(db, skip=skip, limit=limit)

