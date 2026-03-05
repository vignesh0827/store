from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import date

class UserBase(BaseModel):
    username: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Vegetable Schemas
class VegetableBase(BaseModel):
    name_en: str
    name_ta: str
    price: float = Field(..., ge=0)
    category: str
    stock: float = Field(..., ge=0)
    min_stock: float = Field(default=10.0, ge=0)
    image: str

class VegetableCreate(VegetableBase):
    pass

class Vegetable(VegetableBase):
    id: int
    class Config:
        from_attributes = True

# Supplier Schemas
class SupplierBase(BaseModel):
    name: str
    location: str
    contact: str
    products: str
    status: str = "Active"
    rating: float = Field(4.5, ge=0, le=5)

class SupplierCreate(SupplierBase):
    pass

class Supplier(SupplierBase):
    id: int
    class Config:
        from_attributes = True

# Staff & Attendance Schemas
class StaffBase(BaseModel):
    name: str
    role: str
    mobile: str
    avatar: str = "👤"
    status: str = "Absent"
    check_in: str = "--"
    check_out: str = "--"

class StaffCreate(StaffBase):
    pass

class Staff(StaffBase):
    id: int
    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    staff_id: int
    date: date
    status: str
    check_in: str
    check_out: str

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    id: int
    class Config:
        from_attributes = True

# Billing Schemas
class SalesBillItemBase(BaseModel):
    veg_id: int
    name: str
    quantity: float = Field(..., gt=0)
    price: float = Field(..., ge=0)
    total: float = Field(..., ge=0)

class SalesBillItemCreate(SalesBillItemBase):
    pass

class SalesBillItem(SalesBillItemBase):
    id: int
    bill_id: int
    class Config:
        from_attributes = True

class SalesBillBase(BaseModel):
    bill_number: str
    customer_name: str
    mobile_number: str
    date: str
    subtotal: float = Field(..., ge=0)
    discount: float = Field(0, ge=0)
    grand_total: float = Field(..., ge=0)
    payment_mode: str
    gst_amount: float = 0.0
    taxable_amount: float = 0.0
    biller_name: Optional[str] = None

class SalesBillCreate(SalesBillBase):
    items: List[SalesBillItemCreate]

class SalesBill(SalesBillBase):
    id: int
    items: List[SalesBillItem]
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    stock_value: float
    today_sales: float
    today_purchase: float
    today_wastage: float
    total_profit: float
    pending_bills: float
    staff_present: str
    total_orders: int
    sales_history: List[dict] = []
    low_stock: List[dict] = []
    recent_activity: List[dict] = []
    top_selling: List[dict] = []

# Inward Schemas
class InwardItemBase(BaseModel):
    veg_id: int
    name: str
    quantity: float
    purchase_price: float
    selling_price: float
    total: float

class InwardItemCreate(InwardItemBase):
    pass

class InwardRecordBase(BaseModel):
    invoice_number: str
    supplier_name: str
    date: str
    total_amount: float
    amount_paid: float
    payment_mode: str

class InwardRecordCreate(InwardRecordBase):
    items: List[InwardItemCreate]

class InwardItem(InwardItemBase):
    id: int
    record_id: int
    class Config:
        from_attributes = True

class InwardRecord(InwardRecordBase):
    id: int
    items: List[InwardItem]
    class Config:
        from_attributes = True

class Notification(BaseModel):
    id: int
    text: str
    time: str
    type: str # warning, info, success

class SupplierDue(BaseModel):
    id: int
    name: str
    contact: str
    total_due: float
    last_payment: str
    status: str

class SupplierPaymentBase(BaseModel):
    supplier_id: int
    date: str
    amount: float
    payment_mode: str
    notes: Optional[str] = None

class SupplierPaymentCreate(SupplierPaymentBase):
    pass

class SupplierPayment(SupplierPaymentBase):
    id: int
    class Config:
        from_attributes = True

# Wastage Schemas
class WastageRecordBase(BaseModel):
    veg_id: int
    name: str
    quantity: float = Field(..., gt=0)
    reason: str
    date: str

class WastageRecordCreate(WastageRecordBase):
    added_by: Optional[str] = None

class WastageRecord(WastageRecordBase):
    id: int
    loss_amount: float
    added_by: Optional[str] = None
    
    class Config:
        from_attributes = True

# Customer Schemas
class CustomerBase(BaseModel):
    name: str
    mobile: str
    total_spent: float = 0.0
    last_visit: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    class Config:
        from_attributes = True
