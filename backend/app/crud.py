from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date as date_obj
from app import models, schemas, auth

# Users
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

def get_vegetable(db: Session, veg_id: int):
    return db.query(models.Vegetable).filter(models.Vegetable.id == veg_id).first()

def get_vegetables(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Vegetable).offset(skip).limit(limit).all()

def get_low_stock_vegetables(db: Session):
    return db.query(models.Vegetable).filter(models.Vegetable.stock <= models.Vegetable.min_stock).all()

def create_vegetable(db: Session, veg: schemas.VegetableCreate):
    db_veg = models.Vegetable(**veg.dict())
    db.add(db_veg)
    db.commit()
    db.refresh(db_veg)
    return db_veg

# Suppliers
def get_supplier(db: Session, supplier_id: int):
    return db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()

def get_suppliers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Supplier).offset(skip).limit(limit).all()

def create_supplier(db: Session, supplier: schemas.SupplierCreate):
    db_supplier = models.Supplier(**supplier.dict())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

def update_supplier(db: Session, supplier_id: int, supplier: schemas.SupplierCreate):
    db_supplier = get_supplier(db, supplier_id)
    if db_supplier:
        for key, value in supplier.dict().items():
            setattr(db_supplier, key, value)
        db.commit()
        db.refresh(db_supplier)
    return db_supplier

def delete_supplier(db: Session, supplier_id: int):
    db_supplier = get_supplier(db, supplier_id)
    if db_supplier:
        db.delete(db_supplier)
        db.commit()
    return db_supplier

# Staff
def get_staff_member(db: Session, staff_id: int):
    return db.query(models.Staff).filter(models.Staff.id == staff_id).first()

def get_staff(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Staff).offset(skip).limit(limit).all()

def create_staff(db: Session, staff: schemas.StaffCreate):
    db_staff = models.Staff(**staff.dict())
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff

def update_staff(db: Session, staff_id: int, staff: schemas.StaffCreate):
    db_staff = get_staff_member(db, staff_id)
    if db_staff:
        for key, value in staff.dict().items():
            setattr(db_staff, key, value)
        db.commit()
        db.refresh(db_staff)
    return db_staff

def delete_staff(db: Session, staff_id: int):
    db_staff = get_staff_member(db, staff_id)
    if db_staff:
        db.delete(db_staff)
        db.commit()
    return db_staff

# Sales Bills
def create_sales_bill(db: Session, bill: schemas.SalesBillCreate):
    db_bill = models.SalesBill(
        bill_number=bill.bill_number,
        customer_name=bill.customer_name,
        mobile_number=bill.mobile_number,
        date=bill.date,
        subtotal=bill.subtotal,
        discount=bill.discount,
        grand_total=bill.grand_total,
        payment_mode=bill.payment_mode,
        gst_amount=bill.gst_amount,
        taxable_amount=bill.taxable_amount,
        biller_name=bill.biller_name
    )
    db.add(db_bill)
    db.commit()
    db.refresh(db_bill)
    
    for item in bill.items:
        db_item = models.SalesBillItem(**item.dict(), bill_id=db_bill.id)
        db.add(db_item)
    
    db.commit()
    db.refresh(db_bill)

    # Update or Create Customer record
    if bill.mobile_number:
        customer = db.query(models.Customer).filter(models.Customer.mobile == bill.mobile_number).first()
        if customer:
            if bill.customer_name: customer.name = bill.customer_name
            customer.total_spent += bill.grand_total
            customer.last_visit = bill.date
        else:
            db_customer = models.Customer(
                name=bill.customer_name or "Unknown",
                mobile=bill.mobile_number,
                total_spent=bill.grand_total,
                last_visit=bill.date
            )
            db.add(db_customer)
    
    db.commit()
    db.refresh(db_bill)
    return db_bill

def get_sales_bills(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.SalesBill).offset(skip).limit(limit).all()

# Inward Records
def create_inward_record(db: Session, rec: schemas.InwardRecordCreate):
    # Try to find supplier_id by name
    supplier = db.query(models.Supplier).filter(func.lower(func.trim(models.Supplier.name)) == func.lower(func.trim(rec.supplier_name))).first()
    supplier_id = supplier.id if supplier else None

    db_rec = models.InwardRecord(
        invoice_number=rec.invoice_number,
        supplier_id=supplier_id,
        supplier_name=rec.supplier_name,
        date=rec.date,
        total_amount=rec.total_amount,
        amount_paid=rec.amount_paid,
        payment_mode=rec.payment_mode
    )
    db.add(db_rec)
    db.commit()
    db.refresh(db_rec)
    
    for item in rec.items:
        db_item = models.InwardItem(**item.dict(), record_id=db_rec.id)
        db.add(db_item)
        
        # Update vegetable stock & prices
        veg = db.query(models.Vegetable).filter(models.Vegetable.id == item.veg_id).first()
        if veg:
            veg.stock += item.quantity
            veg.price = item.selling_price # Auto-update selling price
            
    db.commit()
    db.refresh(db_rec)
    return db_rec

def get_notifications(db: Session):
    notifications = []
    
    # 1. Low stock alerts
    low_stock = db.query(models.Vegetable).filter(models.Vegetable.stock <= models.Vegetable.min_stock).all()
    for idx, v in enumerate(low_stock):
        notifications.append({
            "id": 1000 + idx,
            "text": f"Low stock alert: {v.name_en} ({round(v.stock, 2)} KG left)",
            "time": "Active",
            "type": "warning"
        })
        
    # 2. Recent Inwards (last 2)
    recent_inwards = db.query(models.InwardRecord).order_by(models.InwardRecord.id.desc()).limit(2).all()
    for idx, r in enumerate(recent_inwards):
        notifications.append({
            "id": 2000 + idx,
            "text": f"New inward: From {r.supplier_name}",
            "time": "Recently",
            "type": "info"
        })
        
    # 3. Recent Sales (last 2)
    recent_sales = db.query(models.SalesBill).order_by(models.SalesBill.id.desc()).limit(2).all()
    for idx, s in enumerate(recent_sales):
        notifications.append({
            "id": 3000 + idx,
            "text": f"New bill: #{s.bill_number} - ₹{s.grand_total}",
            "time": "Recently",
            "type": "success"
        })
        
    return notifications

    
def get_dashboard_stats(db: Session):
    # Stock Value
    stock_value = db.query(func.sum(models.Vegetable.stock * models.Vegetable.price)).scalar() or 0.0
    
    today_str = date_obj.today().isoformat()
    
    # Today's Sales
    today_bills = db.query(models.SalesBill).filter(models.SalesBill.date.contains(today_str)).all()
    today_sales = sum(bill.grand_total for bill in today_bills)
    total_orders = len(today_bills)
    
    # Today's Purchase (Inwards)
    today_inwards = db.query(models.InwardRecord).filter(models.InwardRecord.date.contains(today_str)).all()
    today_purchase = sum(inward.total_amount for inward in today_inwards)
    
    # Today's Wastage
    today_wastages = db.query(models.WastageRecord).filter(models.WastageRecord.date.contains(today_str)).all()
    today_wastage_loss = sum(w.loss_amount for w in today_wastages)
    
    # Actual Profit = Sales - Purchase - Wastage (Daily)
    total_profit = today_sales - today_purchase - today_wastage_loss
    
    # Staff Present
    total_staff = db.query(models.Staff).count()
    present_staff = db.query(models.Staff).filter(models.Staff.status == 'Present').count()
    staff_present_str = f"{present_staff}/{total_staff}"
    
    # Sales Chart Data (Last 7 Days)
    from datetime import timedelta
    sales_history = []
    for i in range(6, -1, -1):
        d = date_obj.today() - timedelta(days=i)
        d_str = d.isoformat()
        
        day_bills = db.query(models.SalesBill).filter(models.SalesBill.date.contains(d_str)).all()
        day_sales = sum(b.grand_total for b in day_bills)
        
        day_inwards = db.query(models.InwardRecord).filter(models.InwardRecord.date.contains(d_str)).all()
        day_purchase = sum(i.total_amount for i in day_inwards)
        
        sales_history.append({"name": d.strftime('%a'), "sales": day_sales, "purchase": day_purchase})

    # Recent Activity (Latest 5 Bills or Actions)
    # Since we only tracked SalesBills, let's use them
    recent_bills = db.query(models.SalesBill).order_by(models.SalesBill.id.desc()).limit(5).all()
    recent_activity = []
    for bill in recent_bills:
        recent_activity.append({
            "id": bill.id,
            "type": "Sale",
            "desc": f"{bill.customer_name} - Bill #{bill.bill_number}",
            "amount": f"₹{bill.grand_total}",
            "time": "Recent",
            "icon": "ArrowUpRight",
            "color": "green"
        })

    # Low Stock Items
    low_stock_db = db.query(models.Vegetable).filter(models.Vegetable.stock <= models.Vegetable.min_stock).all()
    low_stock_list = []
    for veg in low_stock_db:
        low_stock_list.append({
            "name": veg.name_en,
            "level": f"{veg.stock} KG",
            "status": "Critical" if veg.stock < (veg.min_stock/2) else "Low",
            "color": "red" if veg.stock < (veg.min_stock/2) else "amber"
        })

    # Top Selling Products (Placeholder logic)
    top_selling_list = []
    top_vegs = db.query(models.Vegetable).limit(5).all()
    for v in top_vegs:
        top_selling_list.append({"name": v.name_en, "sold": "N/A", "trend": "+0%", "val": 0})

    return {
        "stock_value": stock_value,
        "today_sales": today_sales,
        "today_purchase": today_purchase,
        "today_wastage": today_wastage_loss,
        "total_profit": total_profit,
        "pending_bills": 0.0,
        "staff_present": staff_present_str,
        "total_orders": total_orders,
        "sales_history": sales_history,
        "low_stock": low_stock_list,
        "recent_activity": recent_activity,
        "top_selling": top_selling_list
    }

def get_attendance_history(db: Session, staff_id: int = None, date: date_obj = None):
    query = db.query(models.Attendance)
    if staff_id:
        query = query.filter(models.Attendance.staff_id == staff_id)
    if date:
        query = query.filter(models.Attendance.date == date)
    return query.order_by(models.Attendance.date.desc(), models.Attendance.id.desc()).all()

def record_attendance(db: Session, attendance: schemas.AttendanceCreate):
    db_attendance = models.Attendance(
        staff_id=attendance.staff_id,
        date=attendance.date,
        status=attendance.status,
        check_in=attendance.check_in,
        check_out=attendance.check_out
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def get_supplier_dues(db: Session):
    # Get all suppliers
    suppliers = db.query(models.Supplier).all()
    dues_list = []
    
    for s in suppliers:
        # 1. Calculate total from Inward records (Match by ID or Name for safety)
        s_name_norm = s.name.strip().lower()
        inwards = db.query(models.InwardRecord).filter(
            (models.InwardRecord.supplier_id == s.id) | 
            (func.lower(func.trim(models.InwardRecord.supplier_name)) == s_name_norm)
        ).all()
        
        total_procured = sum(i.total_amount for i in inwards)
        inward_paid = sum(i.amount_paid for i in inwards)
        
        # 2. Subtract standalone payments
        standalone_payments = db.query(models.SupplierPayment).filter(models.SupplierPayment.supplier_id == s.id).all()
        standalone_paid = sum(p.amount for p in standalone_payments)
        
        total_paid = inward_paid + standalone_paid
        balance = total_procured - total_paid
        
        last_inward = db.query(models.InwardRecord).filter(
            (models.InwardRecord.supplier_id == s.id) | 
            (func.lower(func.trim(models.InwardRecord.supplier_name)) == s_name_norm)
        ).order_by(models.InwardRecord.id.desc()).first()
        
        last_date = last_inward.date if last_inward else "Never"
        
        dues_list.append({
            "id": s.id,
            "name": s.name,
            "contact": s.contact,
            "total_due": balance,
            "last_payment": last_date,
            "status": "Active" if balance > 0 else "Cleared"
        })
    
    return dues_list

def record_supplier_payment(db: Session, payment: schemas.SupplierPaymentCreate):
    db_payment = models.SupplierPayment(**payment.dict())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def get_supplier_payment_history(db: Session, supplier_id: int):
    return db.query(models.SupplierPayment).filter(models.SupplierPayment.supplier_id == supplier_id).order_by(models.SupplierPayment.id.desc()).all()

# Wastage Records
def create_wastage_record(db: Session, record: schemas.WastageRecordCreate):
    # Find the vegetable
    veg = db.query(models.Vegetable).filter(models.Vegetable.id == record.veg_id).first()
    if not veg:
        raise ValueError("Vegetable not found")
        
    # Get the latest purchase price from Inward Items for loss calculation
    # Default to 0 if no purchase history is found
    last_inward = db.query(models.InwardItem).filter(models.InwardItem.veg_id == record.veg_id).order_by(models.InwardItem.id.desc()).first()
    purchase_price = last_inward.purchase_price if last_inward else (veg.price * 0.7) # Fallback to 70% of selling price
    
    loss_amount = purchase_price * record.quantity
    
    # Reduce stock
    if veg.stock >= record.quantity:
        veg.stock -= record.quantity
    else:
        veg.stock = 0 # Prevent negative stock
        
    db_record = models.WastageRecord(
        veg_id=record.veg_id,
        name=record.name,
        quantity=record.quantity,
        reason=record.reason,
        date=record.date,
        loss_amount=loss_amount,
        added_by=record.added_by
    )
    
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def get_wastage_records(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.WastageRecord).order_by(models.WastageRecord.id.desc()).offset(skip).limit(limit).all()

def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Customer).order_by(models.Customer.total_spent.desc()).offset(skip).limit(limit).all()
