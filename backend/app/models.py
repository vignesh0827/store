from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Boolean
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # manager/bill_counter
    is_active = Column(Boolean, default=True)

class Vegetable(Base):
    __tablename__ = "vegetables"
    id = Column(Integer, primary_key=True, index=True)
    name_en = Column(String, index=True)
    name_ta = Column(String)
    price = Column(Float)
    category = Column(String)
    stock = Column(Float)
    min_stock = Column(Float, default=10.0)
    image = Column(String)

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    contact = Column(String)
    products = Column(String)
    status = Column(String, default="Active")
    rating = Column(Float, default=4.5)

class Staff(Base):
    __tablename__ = "staff"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(String)
    mobile = Column(String)
    avatar = Column(String, default="👤")
    status = Column(String, default="Absent")
    check_in = Column(String, default="--")
    check_out = Column(String, default="--")

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"))
    date = Column(Date, default=datetime.date.today)
    status = Column(String) # Present/Absent
    check_in = Column(String)
    check_out = Column(String)

class SalesBill(Base):
    __tablename__ = "sales_bills"
    id = Column(Integer, primary_key=True, index=True)
    bill_number = Column(String, unique=True, index=True)
    customer_name = Column(String)
    mobile_number = Column(String)
    date = Column(String)
    subtotal = Column(Float)
    discount = Column(Float)
    grand_total = Column(Float)
    payment_mode = Column(String)
    gst_amount = Column(Float, default=0.0)
    taxable_amount = Column(Float, default=0.0)
    biller_name = Column(String, nullable=True)
    items = relationship("SalesBillItem", back_populates="bill")

class SalesBillItem(Base):
    __tablename__ = "sales_bill_items"
    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(Integer, ForeignKey("sales_bills.id"))
    veg_id = Column(Integer)
    name = Column(String)
    quantity = Column(Float)
    price = Column(Float)
    total = Column(Float)
    bill = relationship("SalesBill", back_populates="items")

class InwardRecord(Base):
    __tablename__ = "inward_records"
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    supplier_name = Column(String)
    date = Column(String)
    total_amount = Column(Float)
    amount_paid = Column(Float)
    payment_mode = Column(String)
    items = relationship("InwardItem", back_populates="record")

class InwardItem(Base):
    __tablename__ = "inward_items"
    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("inward_records.id"))
    veg_id = Column(Integer, ForeignKey("vegetables.id"))
    name = Column(String)
    quantity = Column(Float)
    purchase_price = Column(Float)
    selling_price = Column(Float)
    total = Column(Float)
    record = relationship("InwardRecord", back_populates="items")

class SupplierPayment(Base):
    __tablename__ = "supplier_payments"
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    date = Column(String)
    amount = Column(Float)
    payment_mode = Column(String) # Cash/Online
    notes = Column(String, nullable=True)

class WastageRecord(Base):
    __tablename__ = "wastage_records"
    id = Column(Integer, primary_key=True, index=True)
    veg_id = Column(Integer, ForeignKey("vegetables.id"))
    name = Column(String)
    quantity = Column(Float)
    reason = Column(String)
    date = Column(String)
    loss_amount = Column(Float)
    added_by = Column(String, nullable=True)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    mobile = Column(String, unique=True, index=True)
    total_spent = Column(Float, default=0.0)
    last_visit = Column(String)
