from fastapi import APIRouter, Depends, Path, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from uuid import UUID

from app.database import get_db
from app.modules.auth.models import User
from app.modules.auth.schemas import UserResponse, UserUpdate, AdminUserUpdate, UserListResponse
from app.modules.auth.dependencies import get_current_user, get_current_admin_user

router = APIRouter(prefix="/users", tags=["users"])


# ──────────────────────────────────────────────
# Current User Endpoints
# ──────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserResponse)
async def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    update_data = user_in.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(current_user, field, update_data[field])

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user


# ──────────────────────────────────────────────
# Admin: User Management Endpoints
# ──────────────────────────────────────────────

@router.get("/", response_model=UserListResponse)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: str = Query("", max_length=255),
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """Admin: List all users with optional search filter."""
    query = select(User)
    count_query = select(func.count(User.id))

    if search.strip():
        pattern = f"%{search.strip()}%"
        filter_clause = or_(User.email.ilike(pattern), User.full_name.ilike(pattern))
        query = query.where(filter_clause)
        count_query = count_query.where(filter_clause)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    query = query.order_by(User.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()

    return UserListResponse(users=users, total=total)


@router.patch("/{user_id}", response_model=UserResponse)
async def admin_update_user(
    user_in: AdminUserUpdate,
    user_id: UUID = Path(..., title="User ID"),
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """Admin: Update a user's role or profile info."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}")
async def admin_delete_user(
    user_id: UUID = Path(..., title="User ID"),
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    """Admin: Delete a user account. Cannot delete yourself."""
    if current_admin.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account"
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    await db.delete(user)
    await db.commit()
    return {"detail": "User deleted successfully"}
